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

    // Get workflows for the company
    const [workflows] = await pool.execute(
      'SELECT * FROM approval_workflows WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );

    const workflowsWithSteps = await Promise.all(
      (workflows as any[]).map(async (workflow) => {
        const [steps] = await pool.execute(
          'SELECT * FROM approval_steps WHERE workflow_id = ? ORDER BY step_order',
          [workflow.id]
        );

        return {
          id: workflow.id,
          companyId: workflow.company_id,
          name: workflow.name,
          isActive: workflow.is_active,
          steps: (steps as any[]).map(step => ({
            id: step.id,
            workflowId: step.workflow_id,
            stepOrder: step.step_order,
            approverType: step.approver_type,
            specificUserId: step.specific_user_id,
            isManagerApprover: step.is_manager_approver,
            createdAt: step.created_at
          })),
          createdAt: workflow.created_at,
          updatedAt: workflow.updated_at
        };
      })
    );

    return NextResponse.json(workflowsWithSteps);

  } catch (error) {
    console.error('Get workflows error:', error);
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

    const { name, steps } = await request.json();

    if (!name || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'Name and steps are required' }, { status: 400 });
    }

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Create workflow
      const [workflowResult] = await pool.execute(
        'INSERT INTO approval_workflows (company_id, name) VALUES (?, ?)',
        [companyId, name]
      );

      const workflowId = (workflowResult as any).insertId;

      // Create steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await pool.execute(
          'INSERT INTO approval_steps (workflow_id, step_order, approver_type, specific_user_id, is_manager_approver) VALUES (?, ?, ?, ?, ?)',
          [workflowId, i + 1, step.approverType, step.specificUserId || null, step.isManagerApprover || false]
        );
      }

      await pool.execute('COMMIT');

      return NextResponse.json({ success: true, workflowId });

    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create workflow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
