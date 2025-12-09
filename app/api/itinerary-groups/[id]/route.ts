import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkPermission } from '@/lib/auth-helpers';

// GET single itinerary group
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          id, event_id, group_name, group_order, start_date, end_date, 
          description, is_active, created_at, updated_at
        FROM app.itinerary_groups 
        WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Itinerary group not found',
        }, { status: 404 });
      }

      // Check permission
      const { allowed } = await checkPermission('itinerary', result.rows[0].event_id);
      if (!allowed) {
        return NextResponse.json({
          status: 'error',
          message: 'Unauthorized - No session found or insufficient permissions',
        }, { status: 401 });
      }

      return NextResponse.json({
        status: 'success',
        group: result.rows[0],
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch itinerary group:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch itinerary group',
      error: error.message,
    }, { status: 500 });
  }
}

// PUT update itinerary group
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      group_name,
      group_order,
      start_date,
      end_date,
      description,
    } = body;

    const client = await pool.connect();
    
    try {
      // First get the group to check permissions
      const groupResult = await client.query(
        `SELECT event_id FROM app.itinerary_groups WHERE id = $1`,
        [id]
      );

      if (groupResult.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Itinerary group not found',
        }, { status: 404 });
      }

      // Check permission
      const { allowed } = await checkPermission('itinerary', groupResult.rows[0].event_id);
      if (!allowed) {
        return NextResponse.json({
          status: 'error',
          message: 'Unauthorized - No session found or insufficient permissions',
        }, { status: 401 });
      }

      const result = await client.query(
        `UPDATE app.itinerary_groups 
         SET 
           group_name = COALESCE($1, group_name),
           group_order = COALESCE($2, group_order),
           start_date = $3,
           end_date = $4,
           description = $5,
           updated_at = NOW()
         WHERE id = $6
         RETURNING id, event_id, group_name, group_order, start_date, end_date, 
                   description, is_active, created_at, updated_at`,
        [
          group_name,
          group_order,
          start_date || null,
          end_date || null,
          description || null,
          id,
        ]
      );

      return NextResponse.json({
        status: 'success',
        message: 'Itinerary group updated successfully',
        group: result.rows[0],
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to update itinerary group:', error);
    
    if (error.code === '23505') {
      return NextResponse.json({
        status: 'error',
        message: 'A group with this order already exists for this event',
      }, { status: 400 });
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update itinerary group',
      error: error.message,
    }, { status: 500 });
  }
}

// DELETE itinerary group (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await pool.connect();
    
    try {
      // First get the group to check permissions
      const groupResult = await client.query(
        `SELECT event_id FROM app.itinerary_groups WHERE id = $1`,
        [id]
      );

      if (groupResult.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Itinerary group not found',
        }, { status: 404 });
      }

      // Check permission
      const { allowed } = await checkPermission('itinerary', groupResult.rows[0].event_id);
      if (!allowed) {
        return NextResponse.json({
          status: 'error',
          message: 'Unauthorized - No session found or insufficient permissions',
        }, { status: 401 });
      }

      // Check if group has activities
      const activitiesResult = await client.query(
        `SELECT COUNT(*) as count FROM app.itinerary_activities WHERE group_id = $1`,
        [id]
      );

      if (parseInt(activitiesResult.rows[0].count) > 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Cannot delete group with activities. Please remove or reassign activities first.',
        }, { status: 400 });
      }

      // Soft delete
      await client.query(
        `UPDATE app.itinerary_groups 
         SET is_active = FALSE, updated_at = NOW()
         WHERE id = $1`,
        [id]
      );

      return NextResponse.json({
        status: 'success',
        message: 'Itinerary group deleted successfully',
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to delete itinerary group:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to delete itinerary group',
      error: error.message,
    }, { status: 500 });
  }
}


