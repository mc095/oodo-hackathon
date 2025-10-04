import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar_url
       FROM expenses e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.id = ?`,
      [params.id]
    );

    const expenses = rows as any[];
    if (expenses.length === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const expense = expenses[0];

    // Get approvers for this expense
    const [approvers] = await pool.execute(
      `SELECT ea.*, u.name as approver_name FROM expense_approvers ea 
       JOIN users u ON ea.approver_id = u.id 
       WHERE ea.expense_id = ?`,
      [params.id]
    );

    return NextResponse.json({
      id: expense.id,
      userId: expense.user_id,
      userName: expense.user_name,
      userEmail: expense.user_email,
      userAvatarUrl: expense.user_avatar_url,
      amount: parseFloat(expense.amount),
      currency: expense.currency,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      status: expense.status,
      vendor: expense.vendor,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at,
      approvers: (approvers as any[]).map(approver => ({
        userId: approver.approver_id,
        approverName: approver.approver_name,
        status: approver.status,
        comment: approver.comment,
      })),
    });

  } catch (error) {
    console.error('Get expense error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updates = await request.json();

    const fields = [];
    const values = [];

    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }
    if (updates.currency !== undefined) {
      fields.push('currency = ?');
      values.push(updates.currency);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.date !== undefined) {
      fields.push('date = ?');
      values.push(updates.date);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.vendor !== undefined) {
      fields.push('vendor = ?');
      values.push(updates.vendor);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(params.id);
    await pool.execute(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Return the updated expense
    const [updatedExpenses] = await pool.execute(
      `SELECT e.*, u.name as user_name, u.avatar_url as user_avatar_url FROM expenses e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.id = ?`,
      [params.id]
    );

    const updatedExpense = (updatedExpenses as any[])[0];

    return NextResponse.json({
      id: updatedExpense.id,
      userId: updatedExpense.user_id,
      userName: updatedExpense.user_name,
      userAvatarUrl: updatedExpense.user_avatar_url,
      amount: parseFloat(updatedExpense.amount),
      currency: updatedExpense.currency,
      category: updatedExpense.category,
      description: updatedExpense.description,
      date: updatedExpense.date,
      status: updatedExpense.status,
      vendor: updatedExpense.vendor,
      approvers: [],
    });

  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const pool = getPool();
    await pool.execute('DELETE FROM expenses WHERE id = ?', [params.id]);

    return NextResponse.json({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
