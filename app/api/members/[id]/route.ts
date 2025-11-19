import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET single member by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          id, event_id, employee_id, name, email, country_code, phone,
          kyc_document_type, kyc_document_number, kyc_document_url,
          is_active, created_at, updated_at
        FROM app.members 
        WHERE id = $1 AND is_active = TRUE`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Member not found' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        member: result.rows[0] 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch member:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch member', 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT update member
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get session from cookies (server-side)
    const cookieStore = cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    
    if (!executiveSession) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found',
      }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      employee_id,
      name,
      email,
      country_code,
      phone,
      kyc_document_type,
      kyc_document_number,
      kyc_document_url,
    } = body;

    if (!employee_id || !name || !email || !phone) {
      return NextResponse.json({
        status: 'error',
        message: 'Employee ID, Name, Email, and Phone are required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE app.members
        SET 
          employee_id = $1,
          name = $2,
          email = $3,
          country_code = $4,
          phone = $5,
          kyc_document_type = $6,
          kyc_document_number = $7,
          kyc_document_url = $8,
          updated_at = NOW()
        WHERE id = $9 AND is_active = TRUE
        RETURNING id, event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url, is_active, created_at, updated_at`,
        [
          employee_id,
          name,
          email,
          country_code || '+91',
          phone,
          kyc_document_type || null,
          kyc_document_number || null,
          kyc_document_url || null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Member not found or inactive' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Member updated successfully',
        member: result.rows[0]
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to update member:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Employee ID already exists for this event', 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to update member', 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE member (soft delete)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get session from cookies (server-side)
    const cookieStore = cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    
    if (!executiveSession) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found',
      }, { status: 401 });
    }

    const { id } = params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE app.members 
        SET is_active = FALSE, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Member not found or already inactive' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Member deleted successfully (soft delete)' 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to delete member:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to delete member', 
      error: error.message 
    }, { status: 500 });
  }
}

