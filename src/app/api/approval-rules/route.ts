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

    // Get user's company
    const [users] = await pool.execute(
      'SELECT company_id FROM users WHERE id = ?',
      [userId]
    );

    if ((users as any[]).length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = (users as any[])[0].company_id;

    // Get approval rules for the company
    const [rules] = await pool.execute(
      'SELECT ar.*, u.name as specific_approver_name, u2.name as hybrid_approver_name FROM approval_rules ar LEFT JOIN users u ON ar.specific_approver_id = u.id LEFT JOIN users u2 ON ar.hybrid_approver_id = u2.id WHERE ar.company_id = ? ORDER BY ar.created_at DESC',
      [companyId]
    );

    const formattedRules = (rules as any[]).map(rule => ({
      id: rule.id,
      companyId: rule.company_id,
      ruleType: rule.rule_type,
      percentageThreshold: rule.percentage_threshold,
      specificApproverId: rule.specific_approver_id,
      specificApproverName: rule.specific_approver_name,
      hybridPercentage: rule.hybrid_percentage,
      hybridApproverId: rule.hybrid_approver_id,
      hybridApproverName: rule.hybrid_approver_name,
      isActive: rule.is_active,
      createdAt: rule.created_at,
      updatedAt: rule.updated_at
    }));

    return NextResponse.json(formattedRules);

  } catch (error) {
    console.error('Get approval rules error:', error);
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

    // Get user's company
    const [users] = await pool.execute(
      'SELECT company_id FROM users WHERE id = ?',
      [userId]
    );

    if ((users as any[]).length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = (users as any[])[0].company_id;

    const {
      ruleType,
      percentageThreshold,
      specificApproverId,
      hybridPercentage,
      hybridApproverId
    } = await request.json();

    if (!ruleType) {
      return NextResponse.json({ error: 'Rule type is required' }, { status: 400 });
    }

    // Validate based on rule type
    if (ruleType === 'Percentage' && !percentageThreshold) {
      return NextResponse.json({ error: 'Percentage threshold is required for percentage rule' }, { status: 400 });
    }

    if (ruleType === 'Specific_Approver' && !specificApproverId) {
      return NextResponse.json({ error: 'Specific approver is required for specific approver rule' }, { status: 400 });
    }

    if (ruleType === 'Hybrid' && (!hybridPercentage || !hybridApproverId)) {
      return NextResponse.json({ error: 'Both hybrid percentage and approver are required for hybrid rule' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'INSERT INTO approval_rules (company_id, rule_type, percentage_threshold, specific_approver_id, hybrid_percentage, hybrid_approver_id) VALUES (?, ?, ?, ?, ?, ?)',
      [companyId, ruleType, percentageThreshold || null, specificApproverId || null, hybridPercentage || null, hybridApproverId || null]
    );

    const ruleId = (result as any).insertId;

    return NextResponse.json({ success: true, ruleId });

  } catch (error) {
    console.error('Create approval rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
