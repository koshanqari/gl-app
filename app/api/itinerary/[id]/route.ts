import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkPermission } from '@/lib/auth-helpers';

// GET single itinerary activity
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const client = await pool.connect();
    
    try {
      const activityResult = await client.query(
        `SELECT 
          id, event_id, name, from_datetime, to_datetime, venue, description,
          is_active, created_at, updated_at
        FROM app.itinerary_activities 
        WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (activityResult.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Activity not found' 
        }, { status: 404 });
      }

      const activity = activityResult.rows[0];

      // Fetch links
      const linksResult = await client.query(
        `SELECT id, activity_id, link_text, link_url, created_at
         FROM app.itinerary_links
         WHERE activity_id = $1
         ORDER BY created_at ASC`,
        [id]
      );
      activity.links = linksResult.rows;

      return NextResponse.json({ 
        status: 'success', 
        activity 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch activity:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch activity', 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT update itinerary activity
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // First, get the activity to check event_id
    const client = await pool.connect();
    let activityEventId: string | null = null;
    
    try {
      const activityResult = await client.query(
        `SELECT event_id FROM app.itinerary_activities WHERE id = $1 AND is_active = TRUE`,
        [id]
      );
      
      if (activityResult.rows.length === 0) {
        client.release();
        return NextResponse.json({
          status: 'error',
          message: 'Activity not found',
        }, { status: 404 });
      }
      
      activityEventId = activityResult.rows[0].event_id;
    } finally {
      client.release();
    }

    // Check authentication and permission
    const { allowed } = await checkPermission('itinerary', activityEventId || undefined);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      from_datetime,
      to_datetime,
      venue,
      description,
      links = [],
    } = body;

    if (!name || !from_datetime) {
      return NextResponse.json({
        status: 'error',
        message: 'name and from_datetime are required',
      }, { status: 400 });
    }

    const updateClient = await pool.connect();
    
    try {
      await updateClient.query('BEGIN');

      // Update activity
      const result = await updateClient.query(
        `UPDATE app.itinerary_activities
        SET 
          name = $1,
          from_datetime = $2,
          to_datetime = $3,
          venue = $4,
          description = $5,
          updated_at = NOW()
        WHERE id = $6 AND is_active = TRUE
        RETURNING id, event_id, name, from_datetime, to_datetime, venue, description, is_active, created_at, updated_at`,
        [
          name,
          from_datetime,
          to_datetime || null,
          venue || null,
          description || null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        await updateClient.query('ROLLBACK');
        return NextResponse.json({ 
          status: 'error', 
          message: 'Activity not found or inactive' 
        }, { status: 404 });
      }

      const activity = result.rows[0];

      // Delete existing links
      await updateClient.query(
        `DELETE FROM app.itinerary_links WHERE activity_id = $1`,
        [id]
      );

      // Insert new links
      if (links && links.length > 0) {
        for (const link of links) {
          if (link.link_text && link.link_url) {
            await updateClient.query(
              `INSERT INTO app.itinerary_links (activity_id, link_text, link_url)
               VALUES ($1, $2, $3)`,
              [id, link.link_text, link.link_url]
            );
          }
        }
      }

      // Fetch updated links
      const linksResult = await updateClient.query(
        `SELECT id, activity_id, link_text, link_url, created_at
         FROM app.itinerary_links
         WHERE activity_id = $1
         ORDER BY created_at ASC`,
        [id]
      );
      activity.links = linksResult.rows;

      await updateClient.query('COMMIT');

      return NextResponse.json({ 
        status: 'success', 
        message: 'Activity updated successfully',
        activity
      }, { status: 200 });
      
    } catch (dbError: any) {
      await updateClient.query('ROLLBACK');
      throw dbError;
    } finally {
      updateClient.release();
    }
  } catch (error: any) {
    console.error('Failed to update activity:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to update activity', 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE itinerary activity (soft delete)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get activity to check event_id
    const client = await pool.connect();
    let activityEventId: string | null = null;
    
    try {
      const activityResult = await client.query(
        `SELECT event_id FROM app.itinerary_activities WHERE id = $1 AND is_active = TRUE`,
        [id]
      );
      
      if (activityResult.rows.length === 0) {
        client.release();
        return NextResponse.json({
          status: 'error',
          message: 'Activity not found',
        }, { status: 404 });
      }
      
      activityEventId = activityResult.rows[0].event_id;
    } finally {
      client.release();
    }

    // Check authentication and permission
    const { allowed } = await checkPermission('itinerary', activityEventId || undefined);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }
    
    const deleteClient = await pool.connect();
    
    try {
      const result = await deleteClient.query(
        `UPDATE app.itinerary_activities 
        SET is_active = FALSE, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Activity not found or already inactive' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Activity deleted successfully (soft delete)' 
      }, { status: 200 });
      
    } finally {
      deleteClient.release();
    }
  } catch (error: any) {
    console.error('Failed to delete activity:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to delete activity', 
      error: error.message 
    }, { status: 500 });
  }
}

