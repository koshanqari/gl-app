import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET all collaborators for an event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Event ID is required',
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT 
          id, event_id, name, email, organization, permissions,
          is_active, created_at, updated_at
        FROM app.collaborators 
        WHERE event_id = $1 AND is_active = TRUE
        ORDER BY created_at DESC`,
        [eventId]
      );

      return NextResponse.json(
        {
          status: 'success',
          collaborators: result.rows,
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch collaborators:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch collaborators',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new collaborator
export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;

    if (!executiveSession) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Unauthorized - No session found',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      event_id,
      name,
      email,
      password,
      organization,
      permissions,
    } = body;

    if (!event_id || !name || !email || !password || !organization) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Event ID, Name, Email, Password, and Organization are required',
        },
        { status: 400 }
      );
    }

    // Validate permissions
    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Permissions object is required',
        },
        { status: 400 }
      );
    }

    // Check if at least one permission is enabled
    const hasPermissions = Object.values(permissions).some((p: any) => p === true);
    if (!hasPermissions) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'At least one permission must be enabled',
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `INSERT INTO app.collaborators 
          (event_id, name, email, password_hash, organization, permissions)
        VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6)
        RETURNING id, event_id, name, email, organization, permissions, is_active, created_at, updated_at`,
        [
          event_id,
          name,
          email,
          password,
          organization,
          JSON.stringify(permissions),
        ]
      );

      return NextResponse.json(
        {
          status: 'success',
          message: 'Collaborator created successfully',
          collaborator: {
            ...result.rows[0],
            permissions: typeof result.rows[0].permissions === 'string' 
              ? JSON.parse(result.rows[0].permissions)
              : result.rows[0].permissions,
          },
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to create collaborator:', error);

    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Email already exists for this event',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create collaborator',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

