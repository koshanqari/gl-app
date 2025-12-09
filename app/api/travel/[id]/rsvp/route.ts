import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { checkPermission } from '@/lib/auth-helpers';

// GET RSVP for a specific travel schedule and member
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('member_id');

    if (!memberId) {
      return NextResponse.json({
        status: 'error',
        message: 'member_id is required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          id, travel_schedule_id, member_id, response, responded_at, created_at, updated_at
        FROM app.travel_rsvps 
        WHERE travel_schedule_id = $1 AND member_id = $2`,
        [id, memberId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'success', 
          rsvp: null // No RSVP yet - no default response
        }, { status: 200 });
      }

      return NextResponse.json({ 
        status: 'success', 
        rsvp: result.rows[0] 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch RSVP:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch RSVP', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST/PUT create or update RSVP
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { member_id, response } = body;

    if (!member_id || !response) {
      return NextResponse.json({
        status: 'error',
        message: 'member_id and response are required',
      }, { status: 400 });
    }

    if (!['yes', 'maybe', 'no'].includes(response)) {
      return NextResponse.json({
        status: 'error',
        message: 'response must be "yes", "maybe", or "no"',
      }, { status: 400 });
    }

    // Check authentication - allow members to update their own RSVP or executives/collaborators to update any
    const cookieStore = await cookies();
    const memberSession = cookieStore.get('member-session')?.value;
    const executiveSession = cookieStore.get('executive-session')?.value;
    const collaboratorSession = cookieStore.get('collaborator-session')?.value;
    
    let isAuthorized = false;
    
    // Check if member is updating their own RSVP
    if (memberSession) {
      try {
        const member = JSON.parse(memberSession);
        if (member.id === member_id) {
          isAuthorized = true;
        }
      } catch {
        // Invalid session, continue to check executive/collaborator
      }
    }
    
    // Check if executive or collaborator (they can update any RSVP)
    if (!isAuthorized && (executiveSession || collaboratorSession)) {
      // Get event_id from travel schedule to check permissions
      const checkClient = await pool.connect();
      try {
        const scheduleResult = await checkClient.query(
          `SELECT event_id FROM app.travel_schedules WHERE id = $1`,
          [id]
        );
        
        if (scheduleResult.rows.length > 0) {
          const eventId = scheduleResult.rows[0].event_id;
          const { allowed } = await checkPermission('travel', eventId);
          
          if (allowed) {
            isAuthorized = true;
          }
        }
      } finally {
        checkClient.release();
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - Cannot update this RSVP',
      }, { status: 403 });
    }

    const client = await pool.connect();
    
    try {
      // Check if RSVP already exists
      const existingResult = await client.query(
        `SELECT id FROM app.travel_rsvps 
         WHERE travel_schedule_id = $1 AND member_id = $2`,
        [id, member_id]
      );

      let result;
      
      if (existingResult.rows.length > 0) {
        // Update existing RSVP
        result = await client.query(
          `UPDATE app.travel_rsvps
           SET response = $1, responded_at = NOW(), updated_at = NOW()
           WHERE travel_schedule_id = $2 AND member_id = $3
           RETURNING *`,
          [response, id, member_id]
        );
      } else {
        // Create new RSVP
        result = await client.query(
          `INSERT INTO app.travel_rsvps 
            (travel_schedule_id, member_id, response, responded_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING *`,
          [id, member_id, response]
        );
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'RSVP updated successfully', 
        rsvp: result.rows[0] 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to save RSVP:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to save RSVP', 
      error: error.message 
    }, { status: 500 });
  }
}

