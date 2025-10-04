import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT u.*, m.name as manager_name FROM users u 
       LEFT JOIN users m ON u.manager_id = m.id 
       ORDER BY u.name`
    );

    const users = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatar_url,
      role: row.role,
      managerId: row.manager_id,
      managerName: row.manager_name,
    }));

    return NextResponse.json(users);

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, managerId, avatarUrl } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, role, manager_id, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [name, email, role || 'Employee', managerId || null, avatarUrl || null]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Return the created user
    const [newUsers] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    const newUser = (newUsers as any[])[0];

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarUrl: newUser.avatar_url,
      role: newUser.role,
      managerId: newUser.manager_id,
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
