import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateOTP, storeOTP, canResendOTP, cleanupExpiredOTPs } from '@/lib/otp-utils';
import { sendSMS } from '@/lib/sms-service';
import { sendEmail, generateOTPEmailHTML } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Valid email address is required',
        },
        { status: 400 }
      );
    }

    // Clean up expired OTPs
    await cleanupExpiredOTPs();

    // Check if OTP can be resent
    const resendCheck = await canResendOTP(email);
    if (!resendCheck.canResend) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Please wait ${resendCheck.remainingSeconds} seconds before requesting a new OTP`,
          remainingSeconds: resendCheck.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const client = await pool.connect();

    try {
      // Find member by email (case-insensitive)
      const result = await client.query(
        `SELECT 
          id, email, name, country_code, phone, employee_id
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
            message: 'No account found with this email address',
          },
          { status: 404 }
        );
      }

      const member = result.rows[0];

      // Generate OTP
      const otp = generateOTP();
      // Store using the email from the request (will be normalized in storeOTP)
      console.log('[Send OTP] Storing OTP for email:', email);
      await storeOTP(email, otp);

      // Send OTP via SMS and Email in parallel
      const [smsResult, emailResult] = await Promise.allSettled([
        member.phone && member.country_code
          ? sendSMS(`${member.country_code}${member.phone}`, otp)
          : Promise.resolve({ success: false, message: 'No phone number available' }),
        sendEmail(
          member.email,
          'OTP Verification - EventCentral',
          generateOTPEmailHTML(otp, member.name)
        ),
      ]);

      // Log results
      const smsSuccess = smsResult.status === 'fulfilled' && smsResult.value.success;
      const emailSuccess = emailResult.status === 'fulfilled' && emailResult.value.success;

      if (!smsSuccess && !emailSuccess) {
        console.error('Failed to send OTP:', {
          sms: smsResult.status === 'fulfilled' ? smsResult.value : smsResult.reason,
          email: emailResult.status === 'fulfilled' ? emailResult.value : emailResult.reason,
        });
        return NextResponse.json(
          {
            status: 'error',
            message: 'Failed to send OTP. Please try again later.',
          },
          { status: 500 }
        );
      }

      // Return success even if one method failed
      return NextResponse.json(
        {
          status: 'success',
          message: `OTP sent${smsSuccess && emailSuccess ? ' via SMS and email' : smsSuccess ? ' via SMS' : ' via email'}`,
          sentVia: {
            sms: smsSuccess,
            email: emailSuccess,
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
    console.error('Send OTP error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to send OTP',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

