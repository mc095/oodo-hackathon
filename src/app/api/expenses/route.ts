import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const pool = getPool();

    // Get user from token
    const [sessions] = await pool.execute(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if ((sessions as any[]).length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = (sessions as any[])[0].user_id;

    // Get user's role
    const [users] = await pool.execute(
      'SELECT role, company_id FROM users WHERE id = ?',
      [userId]
    );

    if ((users as any[]).length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (users as any[])[0].role;
    const userCompanyId = (users as any[])[0].company_id;

    let query = '';
    let params: any[] = [];

    if (userRole === 'Admin') {
      // Admin can see all expenses in their company
      query = `
        SELECT e.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar_url
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        WHERE u.company_id = ?
        ORDER BY e.date DESC, e.created_at DESC
      `;
      params = [userCompanyId];
    } else if (userRole === 'Manager') {
      // Manager can see expenses from their direct reports
      query = `
        SELECT e.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar_url
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        WHERE (u.manager_id = ? OR e.user_id = ?) AND u.company_id = ?
        ORDER BY e.date DESC, e.created_at DESC
      `;
      params = [userId, userId, userCompanyId];
    } else {
      // Employee can only see their own expenses
      query = `
        SELECT e.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar_url
        FROM expenses e 
        JOIN users u ON e.user_id = u.id 
        WHERE e.user_id = ?
        ORDER BY e.date DESC, e.created_at DESC
      `;
      params = [userId];
    }

    const [rows] = await pool.execute(query, params);

    const expenses = (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userAvatarUrl: row.user_avatar_url,
      amount: parseFloat(row.amount),
      currency: row.currency,
      category: row.category,
      description: row.description,
      date: row.date,
      status: row.status,
      vendor: row.vendor,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      approvers: [], // We'll populate this separately if needed
    }));

    return NextResponse.json(expenses);

  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const pool = getPool();

    // Get user from token
    const [sessions] = await pool.execute(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if ((sessions as any[]).length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = (sessions as any[])[0].user_id;

    const {
      amount,
      currency,
      category,
      description,
      date,
      vendor,
      status = 'Pending'
    } = await request.json();

    if (!amount || !category || !vendor || !date) {
      return NextResponse.json({ error: 'Amount, category, vendor, and date are required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'INSERT INTO expenses (user_id, amount, currency, category, description, date, status, vendor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, amount, currency || 'USD', category, description || '', date, status, vendor]
    );

    const insertResult = result as any;
    const expenseId = insertResult.insertId;

    // Trigger approval workflow
    try {
      // Get user's company
      const [userData] = await pool.execute(
        'SELECT company_id, manager_id FROM users WHERE id = ?',
        [userId]
      );

      if ((userData as any[]).length > 0) {
        const companyId = (userData as any[])[0].company_id;
        const managerId = (userData as any[])[0].manager_id;

        // Get active workflow for the company
        const [workflows] = await pool.execute(
          'SELECT aw.* FROM approval_workflows aw WHERE aw.company_id = ? AND aw.is_active = TRUE ORDER BY aw.created_at DESC LIMIT 1',
          [companyId]
        );

        if ((workflows as any[]).length > 0) {
          const workflow = (workflows as any[])[0];
          
          // Get workflow steps
          const [steps] = await pool.execute(
            'SELECT * FROM approval_steps WHERE workflow_id = ? ORDER BY step_order',
            [workflow.id]
          );

          if ((steps as any[]).length > 0) {
            const firstStep = (steps as any[])[0];
            let firstApproverId = null;

            // Determine first approver based on step configuration
            if (firstStep.approver_type === 'Manager' && managerId) {
              firstApproverId = managerId;
            } else if (firstStep.approver_type === 'Specific_User') {
              firstApproverId = firstStep.specific_user_id;
            } else if (firstStep.approver_type === 'Finance') {
              // Find a user with Finance role
              const [financeUsers] = await pool.execute(
                'SELECT id FROM users WHERE role = "Finance" AND company_id = ? LIMIT 1',
                [companyId]
              );
              firstApproverId = (financeUsers as any[])[0]?.id;
            } else if (firstStep.approver_type === 'Director') {
              // Find a user with Director role
              const [directorUsers] = await pool.execute(
                'SELECT id FROM users WHERE role = "Director" AND company_id = ? LIMIT 1',
                [companyId]
              );
              firstApproverId = (directorUsers as any[])[0]?.id;
            }

            if (firstApproverId) {
              // Create first approval request
              await pool.execute(
                'INSERT INTO expense_approval_requests (expense_id, current_approver_id, step_order, status) VALUES (?, ?, ?, "Pending")',
                [expenseId, firstApproverId, firstStep.step_order]
              );
            }
          }
        }
      }
    } catch (workflowError) {
      console.error('Approval workflow error:', workflowError);
      // Don't fail the expense creation if workflow setup fails
    }

    // Return the created expense
    const [newExpenses] = await pool.execute(
      `SELECT e.*, u.name as user_name, u.avatar_url as user_avatar_url FROM expenses e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.id = ?`,
      [expenseId]
    );

    const newExpense = (newExpenses as any[])[0];

    return NextResponse.json({
      id: newExpense.id,
      userId: newExpense.user_id,
      userName: newExpense.user_name,
      userAvatarUrl: newExpense.user_avatar_url,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      category: newExpense.category,
      description: newExpense.description,
      date: newExpense.date,
      status: newExpense.status,
      vendor: newExpense.vendor,
      approvers: [],
    });

  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
