import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, employee_id } = await request.json();
    
    // Validate required fields
    if (!email || !employee_id) {
      return NextResponse.json({
        status: 'error',
        message: 'Email and Employee ID are required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Authenticate member using email and employee_id
      const result = await client.query(`
        SELECT 
          id, event_id, employee_id, name, email, country_code, phone,
          kyc_document_type, kyc_document_number, kyc_document_url,
          is_active, created_at, updated_at
        FROM app.members
        WHERE email = $1 
          AND employee_id = $2
          AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1;
      `, [email, employee_id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Invalid email or employee ID',
        }, { status: 401 });
      }
      
      const member = result.rows[0];
      
      return NextResponse.json({
        status: 'success',
        message: 'Login successful',
        member: {
          id: member.id,
          email: member.email,
          employee_id: member.employee_id,
          name: member.name,
          event_id: member.event_id,
        },
      }, { status: 200 });
      
    } catch (dbError: any) {
      throw dbError;
    } finally {
      client.release();
    }
    
  } catch (error: any) {
    console.error('Member login error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Login failed',
      error: error.message,
    }, { status: 500 });
  }
}

