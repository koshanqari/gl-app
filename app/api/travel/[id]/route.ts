import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkPermission } from '@/lib/auth-helpers';

// GET single travel schedule with RSVP details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const client = await pool.connect();
    
    try {
      const scheduleResult = await client.query(
        `SELECT 
          id, event_id, name, from_datetime, to_datetime, pickup_location, 
          dropoff_location, vehicle_type, description,
          is_active, created_at, updated_at
        FROM app.travel_schedules 
        WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (scheduleResult.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Travel schedule not found' 
        }, { status: 404 });
      }

      const schedule = scheduleResult.rows[0];

      // Fetch RSVP details
      const rsvpsResult = await client.query(
        `SELECT 
          tr.id,
          tr.member_id,
          tr.response,
          tr.responded_at,
          m.name as member_name,
          m.employee_id,
          m.email,
          m.phone
        FROM app.travel_rsvps tr
        JOIN app.members m ON tr.member_id = m.id
        WHERE tr.travel_schedule_id = $1
        ORDER BY tr.updated_at DESC`,
        [id]
      );

      schedule.rsvps = rsvpsResult.rows;

      // Get total members for the event
      const membersCountResult = await client.query(
        `SELECT COUNT(*) as count FROM app.members WHERE event_id = $1 AND is_active = TRUE`,
        [schedule.event_id]
      );
      const totalMembers = parseInt(membersCountResult.rows[0]?.count || '0');
      
      // Get RSVP counts
      const countsResult = await client.query(
        `SELECT 
          response,
          COUNT(*) as count
        FROM app.travel_rsvps
        WHERE travel_schedule_id = $1
        GROUP BY response`,
        [id]
      );

      const counts = { yes: 0, maybe: 0, no: 0, pending: totalMembers };
      countsResult.rows.forEach(row => {
        counts[row.response as 'yes' | 'maybe' | 'no'] = parseInt(row.count);
        counts.pending -= parseInt(row.count);
      });
      schedule.rsvp_counts = counts;

      return NextResponse.json({ 
        status: 'success', 
        schedule 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch travel schedule:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch travel schedule', 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT update travel schedule
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      from_datetime,
      to_datetime,
      pickup_location,
      dropoff_location,
      vehicle_type,
      description,
    } = body;

    if (!name || !from_datetime) {
      return NextResponse.json({
        status: 'error',
        message: 'name and from_datetime are required',
      }, { status: 400 });
    }

    // Get event_id from schedule
    const client = await pool.connect();
    let eventId: string | null = null;
    
    try {
      const eventResult = await client.query(
        `SELECT event_id FROM app.travel_schedules WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (eventResult.rows.length === 0) {
        client.release();
        return NextResponse.json({
          status: 'error',
          message: 'Travel schedule not found',
        }, { status: 404 });
      }

      eventId = eventResult.rows[0].event_id;
    } finally {
      client.release();
    }

    // Check authentication and permission
    const { allowed } = await checkPermission('travel', eventId || undefined);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const updateClient = await pool.connect();
    
    try {
      const result = await updateClient.query(
        `UPDATE app.travel_schedules
         SET name = $1, from_datetime = $2, to_datetime = $3, pickup_location = $4,
             dropoff_location = $5, vehicle_type = $6, description = $7, updated_at = NOW()
         WHERE id = $8 AND is_active = TRUE
         RETURNING id, event_id, name, from_datetime, to_datetime, pickup_location, 
                   dropoff_location, vehicle_type, description, is_active, created_at, updated_at`,
        [
          name,
          from_datetime,
          to_datetime || null,
          pickup_location || null,
          dropoff_location || null,
          vehicle_type || null,
          description || null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Travel schedule not found or inactive' 
        }, { status: 404 });
      }

      const schedule = result.rows[0];
      // Get total members for the event
      const membersCountResult = await client.query(
        `SELECT COUNT(*) as count FROM app.members WHERE event_id = $1 AND is_active = TRUE`,
        [eventId]
      );
      const totalMembers = parseInt(membersCountResult.rows[0]?.count || '0');
      schedule.rsvp_counts = { yes: 0, maybe: 0, no: 0, pending: totalMembers };

      return NextResponse.json({ 
        status: 'success', 
        message: 'Travel schedule updated successfully',
        schedule 
      }, { status: 200 });
      
    } finally {
      updateClient.release();
    }
  } catch (error: any) {
    console.error('Failed to update travel schedule:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to update travel schedule', 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE travel schedule (soft delete)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get event_id from schedule
    const client = await pool.connect();
    let eventId: string | null = null;
    
    try {
      const eventResult = await client.query(
        `SELECT event_id FROM app.travel_schedules WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (eventResult.rows.length === 0) {
        client.release();
        return NextResponse.json({
          status: 'error',
          message: 'Travel schedule not found',
        }, { status: 404 });
      }

      eventId = eventResult.rows[0].event_id;
    } finally {
      client.release();
    }

    // Check authentication and permission
    const { allowed } = await checkPermission('travel', eventId || undefined);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const deleteClient = await pool.connect();
    
    try {
      const result = await deleteClient.query(
        `UPDATE app.travel_schedules 
        SET is_active = FALSE, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Travel schedule not found or already inactive' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Travel schedule deleted successfully' 
      }, { status: 200 });
      
    } finally {
      deleteClient.release();
    }
  } catch (error: any) {
    console.error('Failed to delete travel schedule:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to delete travel schedule', 
      error: error.message 
    }, { status: 500 });
  }
}

