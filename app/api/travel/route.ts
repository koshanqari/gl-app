import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkPermission } from '@/lib/auth-helpers';

// GET all travel schedules for an event with RSVP counts
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
      // Fetch travel schedules
      const schedulesResult = await client.query(
        `SELECT 
          id, event_id, name, from_datetime, to_datetime, pickup_location, 
          dropoff_location, vehicle_type, description,
          is_active, created_at, updated_at
        FROM app.travel_schedules
        WHERE event_id = $1 AND is_active = TRUE
        ORDER BY from_datetime ASC`,
        [eventId]
      );

      const schedules = schedulesResult.rows;

      // Fetch RSVP counts for each schedule
      if (schedules.length > 0) {
        const scheduleIds = schedules.map(s => s.id);
        
        // Get total members for the event
        const membersCountResult = await client.query(
          `SELECT COUNT(*) as count FROM app.members WHERE event_id = $1 AND is_active = TRUE`,
          [eventId]
        );
        const totalMembers = parseInt(membersCountResult.rows[0]?.count || '0');
        
        const rsvpCountsResult = await client.query(
          `SELECT 
            travel_schedule_id,
            response,
            COUNT(*) as count
          FROM app.travel_rsvps
          WHERE travel_schedule_id = ANY($1)
          GROUP BY travel_schedule_id, response`,
          [scheduleIds]
        );

        // Group RSVP counts by schedule_id and response
        const rsvpCountsBySchedule: Record<string, { yes: number; maybe: number; no: number; pending: number }> = {};
        schedules.forEach(schedule => {
          rsvpCountsBySchedule[schedule.id] = { yes: 0, maybe: 0, no: 0, pending: totalMembers };
        });

        rsvpCountsResult.rows.forEach(row => {
          if (rsvpCountsBySchedule[row.travel_schedule_id]) {
            rsvpCountsBySchedule[row.travel_schedule_id][row.response as 'yes' | 'maybe' | 'no'] = parseInt(row.count);
            // Subtract from pending count
            rsvpCountsBySchedule[row.travel_schedule_id].pending -= parseInt(row.count);
          }
        });

        // Attach RSVP counts to schedules
        schedules.forEach(schedule => {
          schedule.rsvp_counts = rsvpCountsBySchedule[schedule.id] || { yes: 0, maybe: 0, no: 0, pending: totalMembers };
        });
      }

      return NextResponse.json({ 
        status: 'success', 
        schedules 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch travel schedules:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch travel schedules', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create new travel schedule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_id,
      name,
      from_datetime,
      to_datetime,
      pickup_location,
      dropoff_location,
      vehicle_type,
      description,
    } = body;

    if (!event_id || !name || !from_datetime) {
      return NextResponse.json({
        status: 'error',
        message: 'event_id, name, and from_datetime are required',
      }, { status: 400 });
    }

    // Check authentication and permission
    const { allowed, auth } = await checkPermission('travel', event_id);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const userId = auth.isExecutive ? auth.userId : (auth.isCollaborator ? auth.userId : null);

    const client = await pool.connect();
    
    try {
      // Insert travel schedule
      const scheduleResult = await client.query(
        `INSERT INTO app.travel_schedules 
          (event_id, name, from_datetime, to_datetime, pickup_location, dropoff_location, vehicle_type, description, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, event_id, name, from_datetime, to_datetime, pickup_location, dropoff_location, vehicle_type, description, is_active, created_at, updated_at`,
        [
          event_id,
          name,
          from_datetime,
          to_datetime || null,
          pickup_location || null,
          dropoff_location || null,
          vehicle_type || null,
          description || null,
          userId,
        ]
      );

      const schedule = scheduleResult.rows[0];
      // Get total members for the event
      const membersCountResult = await client.query(
        `SELECT COUNT(*) as count FROM app.members WHERE event_id = $1 AND is_active = TRUE`,
        [event_id]
      );
      const totalMembers = parseInt(membersCountResult.rows[0]?.count || '0');
      schedule.rsvp_counts = { yes: 0, maybe: 0, no: 0, pending: totalMembers };

      return NextResponse.json({ 
        status: 'success', 
        message: 'Travel schedule created successfully', 
        schedule 
      }, { status: 201 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to create travel schedule:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create travel schedule', 
      error: error.message 
    }, { status: 500 });
  }
}

