import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET all members or members by event_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const email = searchParams.get('email');

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          id, event_id, employee_id, name, email, country_code, phone,
          kyc_document_type, kyc_document_number, kyc_document_url,
          is_active, created_at, updated_at
        FROM app.members 
        WHERE is_active = TRUE
      `;
      
      const params: any[] = [];
      let paramCount = 0;
      
      if (eventId) {
        paramCount++;
        query += ` AND event_id = $${paramCount}`;
        params.push(eventId);
      }
      
      if (email) {
        paramCount++;
        query += ` AND email = $${paramCount}`;
        params.push(email);
      }
      
      query += ` ORDER BY employee_id ASC`;

      const result = await client.query(query, params);

      return NextResponse.json({ 
        status: 'success', 
        members: result.rows 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch members', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create new member
export async function POST(request: Request) {
  try {
    // Get session from cookies (server-side)
    const cookieStore = await cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    
    if (!executiveSession) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found',
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      event_id,
      employee_id,
      name,
      email,
      country_code,
      phone,
      kyc_document_type,
      kyc_document_number,
      kyc_document_url,
    } = body;

    if (!event_id || !employee_id || !name || !email || !phone) {
      return NextResponse.json({
        status: 'error',
        message: 'Event ID, Employee ID, Name, Email, and Phone are required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO app.members 
          (event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url, is_active, created_at, updated_at`,
        [
          event_id,
          employee_id,
          name,
          email,
          country_code || '+91',
          phone,
          kyc_document_type || null,
          kyc_document_number || null,
          kyc_document_url || null,
        ]
      );

      return NextResponse.json({ 
        status: 'success', 
        message: 'Member created successfully', 
        member: result.rows[0] 
      }, { status: 201 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to create member:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Employee ID already exists for this event', 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create member', 
      error: error.message 
    }, { status: 500 });
  }
}

