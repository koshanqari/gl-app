import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET single event
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          id, partner_id, event_name, event_type, description, logo_url,
          start_date, end_date, is_active, created_at, updated_at, created_by
        FROM app.events 
        WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Event not found' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        event: result.rows[0] 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch event', 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT update event
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get executive session from cookies (server-side)
    const cookieStore = cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    
    if (!executiveSession) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found',
      }, { status: 401 });
    }
    
    let user;
    try {
      user = JSON.parse(executiveSession);
    } catch (e) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - Invalid session',
      }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      event_name,
      event_type,
      description,
      logo_url,
      start_date,
      end_date,
    } = body;

    if (!event_name || !start_date || !end_date) {
      return NextResponse.json({
        status: 'error',
        message: 'Event name, start date, and end date are required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE app.events
        SET event_name = $1, event_type = $2, description = $3, logo_url = $4,
            start_date = $5, end_date = $6, updated_at = NOW()
        WHERE id = $7 AND is_active = TRUE
        RETURNING id`,
        [
          event_name,
          event_type || null,
          description || null,
          logo_url || null,
          start_date,
          end_date,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Event not found or inactive' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Event updated successfully' 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to update event', 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE soft delete event (set is_active = false)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get executive session from cookies (server-side)
    const cookieStore = cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    
    if (!executiveSession) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found',
      }, { status: 401 });
    }
    
    let user;
    try {
      user = JSON.parse(executiveSession);
    } catch (e) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - Invalid session',
      }, { status: 401 });
    }

    const { id } = params;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE app.events 
        SET is_active = FALSE, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Event not found or already inactive' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Event deleted successfully (soft delete)' 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to delete event', 
      error: error.message 
    }, { status: 500 });
  }
}

