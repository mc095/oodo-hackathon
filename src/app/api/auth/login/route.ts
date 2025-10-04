import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';
import { User } from '@/lib/types';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const users = rows as User[];
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    
    // Simple password check - in production, use bcrypt
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    // For demo purposes, we'll assume the password is simply hashed
    // In a real app, you'd store hashed passwords in the database
    if (passwordHash !== crypto.createHash('sha256').update('password').digest('hex')) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.execute(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        managerId: user.managerId,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
