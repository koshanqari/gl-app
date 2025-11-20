import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, event_id } = await request.json();
    
    // Validate required fields
    if (!email || !password || !event_id) {
      return NextResponse.json({
        status: 'error',
        message: 'Email, password, and event ID are required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Authenticate collaborator using bcrypt
      const result = await client.query(`
        SELECT id, event_id, name, email, organization, permissions, is_active
        FROM app.collaborators
        WHERE email = $1 
          AND event_id = $2
          AND password_hash = crypt($3, password_hash)
          AND is_active = true;
      `, [email, event_id, password]);
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Invalid email, password, or you don\'t have access to this event',
        }, { status: 401 });
      }
      
      const collaborator = result.rows[0];
      
      // Parse permissions if it's a string
      const permissions = typeof collaborator.permissions === 'string'
        ? JSON.parse(collaborator.permissions)
        : collaborator.permissions;
      
      return NextResponse.json({
        status: 'success',
        message: 'Login successful',
        collaborator: {
          id: collaborator.id,
          email: collaborator.email,
          name: collaborator.name,
          organization: collaborator.organization,
          permissions: permissions,
        },
      }, { status: 200 });
      
    } catch (dbError: any) {
      throw dbError;
    } finally {
      client.release();
    }
    
  } catch (error: any) {
    console.error('Collaborator login error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Login failed',
      error: error.message,
    }, { status: 500 });
  }
}

