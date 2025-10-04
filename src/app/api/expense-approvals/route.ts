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
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if ((users as any[]).length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (users as any[])[0].role;

    let query = '';
    let params: any[] = [];

    if (userRole === 'Admin') {
      // Admin can see all pending approvals
      query = `
        SELECT ear.*, e.*, u.name as employee_name, u.email as employee_email,
               approver.name as approver_name, approver.email as approver_email
        FROM expense_approval_requests ear
        JOIN expenses e ON ear.expense_id = e.id
        JOIN users u ON e.user_id = u.id
        JOIN users approver ON ear.current_approver_id = approver.id
        WHERE ear.status = 'Pending'
        ORDER BY ear.created_at DESC
      `;
    } else if (userRole === 'Manager') {
      // Manager can see approvals assigned to them
      query = `
        SELECT ear.*, e.*, u.name as employee_name, u.email as employee_email,
               approver.name as approver_name, approver.email as approver_email
        FROM expense_approval_requests ear
        JOIN expenses e ON ear.expense_id = e.id
        JOIN users u ON e.user_id = u.id
        JOIN users approver ON ear.current_approver_id = approver.id
        WHERE ear.current_approver_id = ? AND ear.status = 'Pending'
        ORDER BY ear.created_at DESC
      `;
      params = [userId];
    } else {
      // Employee can see their own expense approvals
      query = `
        SELECT ear.*, e.*, u.name as employee_name, u.email as employee_email,
               approver.name as approver_name, approver.email as approver_email
        FROM expense_approval_requests ear
        JOIN expenses e ON ear.expense_id = e.id
        JOIN users u ON e.user_id = u.id
        JOIN users approver ON ear.current_approver_id = approver.id
        WHERE e.user_id = ?
        ORDER BY ear.created_at DESC
      `;
      params = [userId];
    }

    const [approvals] = await pool.execute(query, params);

    const formattedApprovals = (approvals as any[]).map(approval => ({
      id: approval.id,
      expenseId: approval.expense_id,
      currentApproverId: approval.current_approver_id,
      stepOrder: approval.step_order,
      status: approval.status,
      comment: approval.comment,
      createdAt: approval.created_at,
      updatedAt: approval.updated_at,
      expense: {
        id: approval.id,
        userId: approval.user_id,
        amount: parseFloat(approval.amount),
        currency: approval.currency,
        category: approval.category,
        description: approval.description,
        date: approval.date,
        status: approval.status,
        vendor: approval.vendor,
        employeeName: approval.employee_name,
        employeeEmail: approval.employee_email
      },
      approverName: approval.approver_name,
      approverEmail: approval.approver_email
    }));

    return NextResponse.json(formattedApprovals);

  } catch (error) {
    console.error('Get expense approvals error:', error);
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

    const { expenseId, action, comment } = await request.json();

    if (!expenseId || !action) {
      return NextResponse.json({ error: 'Expense ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 });
    }

    // Get the current approval request
    const [requests] = await pool.execute(
      'SELECT * FROM expense_approval_requests WHERE expense_id = ? AND current_approver_id = ? AND status = "Pending"',
      [expenseId, userId]
    );

    if ((requests as any[]).length === 0) {
      return NextResponse.json({ error: 'No pending approval request found' }, { status: 404 });
    }

    const approvalRequest = (requests as any[])[0];

    // Update the approval request
    await pool.execute(
      'UPDATE expense_approval_requests SET status = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [action === 'approve' ? 'Approved' : 'Rejected', comment || null, approvalRequest.id]
    );

    if (action === 'approve') {
      // Check if this is the final step or if there are more approvers
      const [workflowSteps] = await pool.execute(
        'SELECT aw.*, ast.step_order FROM approval_workflows aw JOIN approval_steps ast ON aw.id = ast.workflow_id WHERE aw.company_id = (SELECT company_id FROM users WHERE id = (SELECT user_id FROM expenses WHERE id = ?)) ORDER BY ast.step_order',
        [expenseId]
      );

      const currentStep = approvalRequest.step_order;
      const totalSteps = (workflowSteps as any[]).length;

      if (currentStep < totalSteps) {
        // Move to next approver
        const nextStep = (workflowSteps as any[]).find(step => step.step_order === currentStep + 1);
        
        if (nextStep) {
          // Determine next approver based on step configuration
          let nextApproverId = null;
          
          if (nextStep.approver_type === 'Manager') {
            // Get the employee's manager
            const [employee] = await pool.execute(
              'SELECT manager_id FROM users WHERE id = (SELECT user_id FROM expenses WHERE id = ?)',
              [expenseId]
            );
            nextApproverId = (employee as any[])[0]?.manager_id;
          } else if (nextStep.approver_type === 'Specific_User') {
            nextApproverId = nextStep.specific_user_id;
          } else if (nextStep.approver_type === 'Finance') {
            // Find a user with Finance role
            const [financeUsers] = await pool.execute(
              'SELECT id FROM users WHERE role = "Finance" LIMIT 1'
            );
            nextApproverId = (financeUsers as any[])[0]?.id;
          } else if (nextStep.approver_type === 'Director') {
            // Find a user with Director role
            const [directorUsers] = await pool.execute(
              'SELECT id FROM users WHERE role = "Director" LIMIT 1'
            );
            nextApproverId = (directorUsers as any[])[0]?.id;
          }

          if (nextApproverId) {
            // Create new approval request for next approver
            await pool.execute(
              'INSERT INTO expense_approval_requests (expense_id, current_approver_id, step_order, status) VALUES (?, ?, ?, "Pending")',
              [expenseId, nextApproverId, currentStep + 1]
            );
          }
        }
      } else {
        // Final step - approve the expense
        await pool.execute(
          'UPDATE expenses SET status = "Approved" WHERE id = ?',
          [expenseId]
        );
      }
    } else {
      // Rejected - update expense status
      await pool.execute(
        'UPDATE expenses SET status = "Rejected" WHERE id = ?',
        [expenseId]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Process expense approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
