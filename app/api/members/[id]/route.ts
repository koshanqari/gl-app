import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { checkPermission, checkAuth } from '@/lib/auth-helpers';

// GET single member by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
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
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // First, get the member to check event_id
    const client = await pool.connect();
    let memberEventId: string | null = null;
    
    try {
      const memberResult = await client.query(
        `SELECT event_id FROM app.members WHERE id = $1 AND is_active = TRUE`,
        [id]
      );
      
      if (memberResult.rows.length === 0) {
        client.release();
        return NextResponse.json({
          status: 'error',
          message: 'Member not found',
        }, { status: 404 });
      }
      
      memberEventId = memberResult.rows[0].event_id;
    } finally {
      client.release();
    }

    // Check authentication - allow member session for their own profile, or executive/collaborator with permissions
    const cookieStore = await cookies();
    const memberSession = cookieStore.get('member-session')?.value;
    
    let isMemberUpdatingOwnProfile = false;
    
    // If it's a member session, verify they're updating their own profile
    if (memberSession) {
      try {
        const member = JSON.parse(memberSession);
        // Verify the member is updating their own profile by checking if the member ID matches
        const verifyClient = await pool.connect();
        try {
          const verifyResult = await verifyClient.query(
            `SELECT id FROM app.members WHERE id = $1 AND email = $2 AND is_active = TRUE`,
            [id, member.email]
          );
          isMemberUpdatingOwnProfile = verifyResult.rows.length > 0;
        } finally {
          verifyClient.release();
        }
      } catch {
        // Invalid member session
      }
    }

    // If not a member updating their own profile, check for executive/collaborator permission
    if (!isMemberUpdatingOwnProfile) {
      const { allowed } = await checkPermission('members', memberEventId || undefined);
      if (!allowed) {
        return NextResponse.json({
          status: 'error',
          message: 'Unauthorized - No session found or insufficient permissions',
        }, { status: 401 });
      }
    }

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

    const updateClient = await pool.connect();
    
    try {
      const result = await updateClient.query(
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
      updateClient.release();
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
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    
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

