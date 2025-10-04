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

    // Check token validity
    const [sessions] = await pool.execute(
      'SELECT u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()',
      [token]
    );

    if ((sessions as any[]).length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = (sessions as any[])[0];

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      role: user.role,
      managerId: user.manager_id,
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
