import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkPermission } from '@/lib/auth-helpers';

// GET all itinerary groups for an event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({
        status: 'error',
        message: 'Event ID is required',
      }, { status: 400 });
    }

    // Check permission
    const { allowed } = await checkPermission('itinerary', eventId);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          id, event_id, group_name, group_order, start_date, end_date, 
          description, is_active, created_at, updated_at
        FROM app.itinerary_groups 
        WHERE event_id = $1 AND is_active = TRUE
        ORDER BY group_order ASC, created_at ASC`,
        [eventId]
      );

      return NextResponse.json({
        status: 'success',
        groups: result.rows,
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch itinerary groups:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch itinerary groups',
      error: error.message,
    }, { status: 500 });
  }
}

// POST create new itinerary group
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_id,
      group_name,
      group_order,
      start_date,
      end_date,
      description,
    } = body;

    if (!event_id || !group_name) {
      return NextResponse.json({
        status: 'error',
        message: 'Event ID and group name are required',
      }, { status: 400 });
    }

    // Check permission
    const { allowed, auth } = await checkPermission('itinerary', event_id);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // If group_order not provided, get the next order number
      let finalGroupOrder = group_order;
      if (!finalGroupOrder) {
        const maxOrderResult = await client.query(
          `SELECT COALESCE(MAX(group_order), 0) + 1 as next_order
           FROM app.itinerary_groups 
           WHERE event_id = $1`,
          [event_id]
        );
        finalGroupOrder = parseInt(maxOrderResult.rows[0].next_order);
      }

      const result = await client.query(
        `INSERT INTO app.itinerary_groups 
          (event_id, group_name, group_order, start_date, end_date, description, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, event_id, group_name, group_order, start_date, end_date, 
                  description, is_active, created_at, updated_at`,
        [
          event_id,
          group_name,
          finalGroupOrder,
          start_date || null,
          end_date || null,
          description || null,
          auth?.userId || null,
        ]
      );

      return NextResponse.json({
        status: 'success',
        message: 'Itinerary group created successfully',
        group: result.rows[0],
      }, { status: 201 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to create itinerary group:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({
        status: 'error',
        message: 'A group with this order already exists for this event',
      }, { status: 400 });
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to create itinerary group',
      error: error.message,
    }, { status: 500 });
  }
}

