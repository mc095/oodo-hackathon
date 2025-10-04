import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const pool = getPool();

    await pool.execute(
      'DELETE FROM sessions WHERE token = ?',
      [token]
    );

    return NextResponse.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
