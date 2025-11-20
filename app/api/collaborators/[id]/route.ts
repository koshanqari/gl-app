import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET single collaborator by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT 
          id, event_id, name, email, organization, permissions,
          is_active, created_at, updated_at
        FROM app.collaborators 
        WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Collaborator not found',
          },
          { status: 404 }
        );
      }

      const collaborator = result.rows[0];
      return NextResponse.json(
        {
          status: 'success',
          collaborator: {
            ...collaborator,
            permissions: typeof collaborator.permissions === 'string'
              ? JSON.parse(collaborator.permissions)
              : collaborator.permissions,
          },
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch collaborator:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch collaborator',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT update collaborator
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
      password,
      organization,
      permissions,
    } = body;

    if (!name || !email || !organization) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Name, Email, and Organization are required',
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
      let query: string;
      let params: any[];

      // If password is provided, update it along with other fields
      if (password && password.trim() !== '') {
        query = `
          UPDATE app.collaborators
          SET 
            name = $1,
            email = $2,
            password_hash = crypt($3, gen_salt('bf')),
            organization = $4,
            permissions = $5,
            updated_at = NOW()
          WHERE id = $6 AND is_active = TRUE
          RETURNING id, event_id, name, email, organization, permissions, is_active, created_at, updated_at
        `;
        params = [name, email, password, organization, JSON.stringify(permissions), id];
      } else {
        // Update without changing password
        query = `
          UPDATE app.collaborators
          SET 
            name = $1,
            email = $2,
            organization = $3,
            permissions = $4,
            updated_at = NOW()
          WHERE id = $5 AND is_active = TRUE
          RETURNING id, event_id, name, email, organization, permissions, is_active, created_at, updated_at
        `;
        params = [name, email, organization, JSON.stringify(permissions), id];
      }

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Collaborator not found or inactive',
          },
          { status: 404 }
        );
      }

      const collaborator = result.rows[0];
      return NextResponse.json(
        {
          status: 'success',
          message: 'Collaborator updated successfully',
          collaborator: {
            ...collaborator,
            permissions: typeof collaborator.permissions === 'string'
              ? JSON.parse(collaborator.permissions)
              : collaborator.permissions,
          },
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to update collaborator:', error);

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
        message: 'Failed to update collaborator',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE collaborator (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        `UPDATE app.collaborators 
        SET is_active = FALSE, updated_at = NOW() 
        WHERE id = $1 AND is_active = TRUE
        RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Collaborator not found or already inactive',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          status: 'success',
          message: 'Collaborator deleted successfully',
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to delete collaborator:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete collaborator',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

