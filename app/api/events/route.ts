import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET all events or events by partner_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          e.id, e.partner_id, e.event_name, e.event_type, e.description, e.logo_url,
          e.start_date, e.end_date, e.location, e.is_active, e.created_at, e.updated_at, e.created_by,
          p.company_name as partner_name
        FROM app.events e
        LEFT JOIN app.partners p ON e.partner_id = p.id
        WHERE e.is_active = TRUE
      `;
      
      const params: any[] = [];
      
      if (partnerId) {
        query += ` AND partner_id = $1`;
        params.push(partnerId);
      }
      
      query += ` ORDER BY start_date DESC`;

      const result = await client.query(query, params);

      return NextResponse.json({ 
        status: 'success', 
        events: result.rows 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch events', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create new event
export async function POST(request: Request) {
  try {
    // Get executive session from cookies (server-side)
    const cookieStore = await cookies();
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

    const body = await request.json();
    const {
      partner_id,
      event_name,
      event_type,
      description,
      logo_url,
      start_date,
      end_date,
    } = body;

    if (!partner_id || !event_name || !start_date || !end_date) {
      return NextResponse.json({
        status: 'error',
        message: 'Partner ID, event name, start date, and end date are required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO app.events 
          (partner_id, event_name, event_type, description, logo_url, start_date, end_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, partner_id, event_name, event_type, description, logo_url, start_date, end_date, is_active, created_at, updated_at, created_by`,
        [
          partner_id,
          event_name,
          event_type || null,
          description || null,
          logo_url || null,
          start_date,
          end_date,
          user.id,
        ]
      );

      return NextResponse.json({ 
        status: 'success', 
        message: 'Event created successfully', 
        event: result.rows[0] 
      }, { status: 201 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create event', 
      error: error.message 
    }, { status: 500 });
  }
}

