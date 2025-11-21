import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyOTP, cleanupExpiredOTPs } from '@/lib/otp-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    // Validate inputs
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Valid email address is required',
        },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Valid 6-digit OTP is required',
        },
        { status: 400 }
      );
    }

    // Clean up expired OTPs
    await cleanupExpiredOTPs();

    // Verify OTP - normalize email before verification
    console.log('[Verify OTP] Verifying OTP for email:', email);
    const verification = await verifyOTP(email, otp);
    if (!verification.valid) {
      return NextResponse.json(
        {
          status: 'error',
          message: verification.message || 'Invalid OTP',
        },
        { status: 401 }
      );
    }

    const client = await pool.connect();

    try {
      // Get member details
      const result = await client.query(
        `SELECT 
          id, event_id, employee_id, name, email, country_code, phone,
          kyc_document_type, kyc_document_number, kyc_document_url,
          is_active, created_at, updated_at
        FROM app.members
        WHERE LOWER(email) = LOWER($1) AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1`,
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Member not found',
          },
          { status: 404 }
        );
      }

      const member = result.rows[0];

      // Set member session cookie
      const memberSession = {
        email: member.email,
        employee_id: member.employee_id,
        name: member.name,
        id: member.id,
        event_id: member.event_id,
      };

      const cookieStore = await cookies();
      // Set cookie without httpOnly so client-side can read it (matching existing pattern)
      cookieStore.set('member-session', JSON.stringify(memberSession), {
        httpOnly: false, // Allow client-side access for getMemberSession()
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      // Create response
      return NextResponse.json(
        {
          status: 'success',
          message: 'Login successful',
          member: {
            id: member.id,
            email: member.email,
            employee_id: member.employee_id,
            name: member.name,
            event_id: member.event_id,
          },
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Login failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

