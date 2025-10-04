import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';
import crypto from 'crypto';

interface CompanySignupData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  country: string;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      companyName, 
      country, 
      currency 
    }: CompanySignupData = await request.json();

    // Validation
    if (!name || !email || !password || !companyName || !country || !currency) {
      return NextResponse.json({ 
        error: 'All fields are required' 
      }, { status: 400 });
    }

    const pool = getPool();

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ 
        error: 'User already exists with this email' 
      }, { status: 409 });
    }

    // Check if company name already exists
    const [existingCompanies] = await pool.execute(
      'SELECT id FROM companies WHERE name = ?',
      [companyName]
    );

    if ((existingCompanies as any[]).length > 0) {
      return NextResponse.json({ 
        error: 'Company name already exists' 
      }, { status: 409 });
    }

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Create company first
      const [companyResult] = await pool.execute(
        'INSERT INTO companies (name, currency, country) VALUES (?, ?, ?)',
        [companyName, currency, country]
      );

      const companyId = (companyResult as any).insertId;

      // Hash password
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      // Create admin user
      const [userResult] = await pool.execute(
        'INSERT INTO users (name, email, role, company_id) VALUES (?, ?, ?, ?)',
        [name, email, 'Admin', companyId]
      );

      const userId = (userResult as any).insertId;

      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await pool.execute(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );

      // Update users table to include company_id
      await pool.execute(
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id VARCHAR(36)',
        []
      );

      await pool.execute(
        'UPDATE users SET company_id = ? WHERE id = ?',
        [companyId, userId]
      );

      // Commit transaction
      await pool.execute('COMMIT');

      // Get the created user data
      const [newUsers] = await pool.execute(
        'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE u.id = ?',
        [userId]
      );

      const newUser = (newUsers as any[])[0];

      return NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatarUrl: newUser.avatar_url,
          role: newUser.role,
          managerId: newUser.manager_id,
          companyId: newUser.company_id,
          companyName: newUser.company_name,
        },
        company: {
          id: companyId,
          name: companyName,
          currency,
          country,
        },
        token,
        message: 'Company and admin created successfully'
      });

    } catch (error) {
      // Rollback transaction
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Company signup error:', error);
    return NextResponse.json({ 
      error: 'Failed to create company and user. Please try again.' 
    }, { status: 500 });
  }
}
