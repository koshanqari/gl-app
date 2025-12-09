import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkPermission } from '@/lib/auth-helpers';

// GET event settings
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check permission
    const { allowed } = await checkPermission('event_profile', id);
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
          id,
          send_registration_notification
        FROM app.events 
        WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Event not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        status: 'success',
        settings: {
          send_registration_notification: result.rows[0].send_registration_notification ?? true,
        },
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch event settings:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch event settings',
      error: error.message,
    }, { status: 500 });
  }
}

// PUT update event settings
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check permission
    const { allowed } = await checkPermission('event_profile', id);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    const body = await request.json();
    const { send_registration_notification } = body;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE app.events 
         SET 
           send_registration_notification = COALESCE($1, send_registration_notification),
           updated_at = NOW()
         WHERE id = $2 AND is_active = TRUE
         RETURNING id, send_registration_notification`,
        [send_registration_notification, id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Event not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        status: 'success',
        message: 'Settings updated successfully',
        settings: {
          send_registration_notification: result.rows[0].send_registration_notification,
        },
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to update event settings:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update event settings',
      error: error.message,
    }, { status: 500 });
  }
}


