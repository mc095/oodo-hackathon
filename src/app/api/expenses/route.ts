import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar_url
       FROM expenses e 
       JOIN users u ON e.user_id = u.id 
       ORDER BY e.date DESC, e.created_at DESC`
    );

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
