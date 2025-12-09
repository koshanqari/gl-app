import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { checkPermission, checkAuth } from '@/lib/auth-helpers';

// GET all itinerary activities for an event
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
      // Fetch activities with group information
      const activitiesResult = await client.query(
        `SELECT 
          a.id, a.event_id, a.name, a.from_datetime, a.to_datetime, a.venue, a.description,
          a.sequence_order, a.group_id, a.is_active, a.created_at, a.updated_at,
          g.group_name, g.group_order
        FROM app.itinerary_activities a
        LEFT JOIN app.itinerary_groups g ON a.group_id = g.id
        WHERE a.event_id = $1 AND a.is_active = TRUE
        ORDER BY COALESCE(g.group_order, 999), a.sequence_order ASC, a.from_datetime ASC`,
        [eventId]
      );

      const activities = activitiesResult.rows;

      // Fetch links for each activity
      if (activities.length > 0) {
        const activityIds = activities.map(a => a.id);
        const linksResult = await client.query(
          `SELECT 
            id, activity_id, link_text, link_url, created_at
          FROM app.itinerary_links
          WHERE activity_id = ANY($1)
          ORDER BY created_at ASC`,
          [activityIds]
        );

        // Group links by activity_id
        const linksByActivity: Record<string, any[]> = {};
        linksResult.rows.forEach(link => {
          if (!linksByActivity[link.activity_id]) {
            linksByActivity[link.activity_id] = [];
          }
          linksByActivity[link.activity_id].push(link);
        });

        // Attach links to activities
        activities.forEach(activity => {
          activity.links = linksByActivity[activity.id] || [];
        });
      }

      return NextResponse.json({ 
        status: 'success', 
        activities 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch itinerary activities:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch itinerary activities', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create new itinerary activity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_id,
      name,
      from_datetime,
      to_datetime,
      venue,
      description,
      sequence_order,
      group_id,
      links = [],
    } = body;

    if (!event_id || !name || !from_datetime) {
      return NextResponse.json({
        status: 'error',
        message: 'event_id, name, and from_datetime are required',
      }, { status: 400 });
    }

    // Check authentication and permission
    const { allowed, auth } = await checkPermission('itinerary', event_id);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const userId = auth.isExecutive ? auth.userId : (auth.isCollaborator ? auth.userId : null);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get next sequence order if not provided
      let finalSequenceOrder = sequence_order;
      if (finalSequenceOrder === undefined || finalSequenceOrder === null) {
        const maxSeqResult = await client.query(
          `SELECT COALESCE(MAX(sequence_order), 0) + 1 as next_seq
           FROM app.itinerary_activities
           WHERE event_id = $1 AND DATE(from_datetime) = DATE($2) AND is_active = TRUE`,
          [event_id, from_datetime]
        );
        finalSequenceOrder = maxSeqResult.rows[0].next_seq;
      }

      // Insert activity
      const activityResult = await client.query(
        `INSERT INTO app.itinerary_activities 
          (event_id, name, from_datetime, to_datetime, venue, description, sequence_order, group_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, event_id, name, from_datetime, to_datetime, venue, description, sequence_order, group_id, is_active, created_at, updated_at`,
        [
          event_id,
          name,
          from_datetime,
          to_datetime || null,
          venue || null,
          description || null,
          finalSequenceOrder,
          group_id || null,
          userId,
        ]
      );

      const activity = activityResult.rows[0];

      // Insert links if provided
      if (links && links.length > 0) {
        for (const link of links) {
          if (link.link_text && link.link_url) {
            await client.query(
              `INSERT INTO app.itinerary_links (activity_id, link_text, link_url)
               VALUES ($1, $2, $3)`,
              [activity.id, link.link_text, link.link_url]
            );
          }
        }

        // Fetch links for response
        const linksResult = await client.query(
          `SELECT id, activity_id, link_text, link_url, created_at
           FROM app.itinerary_links
           WHERE activity_id = $1
           ORDER BY created_at ASC`,
          [activity.id]
        );
        activity.links = linksResult.rows;
      } else {
        activity.links = [];
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        status: 'success', 
        message: 'Itinerary activity created successfully', 
        activity 
      }, { status: 201 });
      
    } catch (dbError: any) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to create itinerary activity:', error);
    console.error('Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      message: error.message,
    });
    
    // Check if table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database tables not found. Please run the SQL migration to create itinerary tables.',
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create itinerary activity', 
      error: error.message,
      detail: error.detail,
      hint: error.hint,
    }, { status: 500 });
  }
}

