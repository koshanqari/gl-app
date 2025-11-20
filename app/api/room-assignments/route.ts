import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { checkPermission } from '@/lib/auth-helpers';

// GET room assignments by event_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({
        status: 'error',
        message: 'event_id is required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          ra.id,
          ra.event_id,
          ra.member_id,
          ra.room_number,
          ra.room_type,
          ra.special_requests,
          ra.status,
          ra.is_active,
          ra.created_at,
          ra.updated_at
        FROM app.room_assignments ra
        WHERE ra.event_id = $1 AND ra.is_active = TRUE
        ORDER BY ra.room_number, ra.created_at`,
        [eventId]
      );

      return NextResponse.json({ 
        status: 'success', 
        assignments: result.rows 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch room assignments:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch room assignments', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create or update room assignment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_id,
      member_id,
      room_number,
      room_type,
      special_requests,
    } = body;

    if (!event_id || !member_id || !room_number) {
      return NextResponse.json({
        status: 'error',
        message: 'event_id, member_id, and room_number are required',
      }, { status: 400 });
    }

    // Check authentication and permission
    const { allowed, auth } = await checkPermission('stay', event_id);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const created_by = auth.userId || null;

    const client = await pool.connect();
    
    try {
      // Check if assignment already exists
      const existingResult = await client.query(
        `SELECT id FROM app.room_assignments 
         WHERE event_id = $1 AND member_id = $2 AND is_active = TRUE`,
        [event_id, member_id]
      );

      let result;
      
      if (existingResult.rows.length > 0) {
        // Update existing assignment
        result = await client.query(
          `UPDATE app.room_assignments
           SET room_number = $1, room_type = $2, special_requests = $3, updated_at = NOW()
           WHERE event_id = $4 AND member_id = $5 AND is_active = TRUE
           RETURNING *`,
          [room_number, room_type, special_requests, event_id, member_id]
        );
      } else {
        // Create new assignment
        result = await client.query(
          `INSERT INTO app.room_assignments 
            (event_id, member_id, room_number, room_type, special_requests, status, created_by)
           VALUES ($1, $2, $3, $4, $5, 'assigned', $6)
           RETURNING *`,
          [event_id, member_id, room_number, room_type, special_requests, created_by]
        );
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Room assignment saved successfully', 
        assignment: result.rows[0] 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to save room assignment:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to save room assignment', 
      error: error.message 
    }, { status: 500 });
  }
}

