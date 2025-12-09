/**
 * Example: Refactored send-otp route using generic n8n notification service
 * 
 * To use this:
 * 1. Set N8N_NOTIFICATION_WEBHOOK_URL in .env.local
 * 2. Optionally set N8N_WEBHOOK_SECRET for authentication
 * 3. Set USE_N8N_NOTIFICATIONS=true to enable n8n, false to use direct sending
 * 4. Rename this file to route.ts (or merge changes)
 * 
 * n8n will receive:
 * {
 *   name: "John Doe",
 *   phone: "1234567890",
 *   countryCode: "+91",
 *   email: "john@example.com",
 *   type: "OTP",
 *   data: { otp: "123456" }
 * }
 */

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateOTP, storeOTP, canResendOTP, cleanupExpiredOTPs } from '@/lib/otp-utils';
import { sendOTPNotification, sendOTPFallback } from '@/lib/n8n-otp-service';

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
      console.log('[Send OTP] Storing OTP for email:', email);
      await storeOTP(email, otp);

      // Check if n8n should be used
      const useN8N = process.env.USE_N8N_NOTIFICATIONS === 'true' && process.env.N8N_NOTIFICATION_WEBHOOK_URL;

      let deliveryResult;
      let sentVia = { email: false, sms: false };

      if (useN8N) {
        // Send via n8n using helper function
        // This sends: { type: "OTP", data: { otp: "123456" } }
        console.log('[Send OTP] Sending via n8n');
        deliveryResult = await sendOTPNotification(
          member.email,
          member.phone,
          member.country_code,
          otp,
          member.name
        );

        // If n8n fails, fallback to direct sending
        if (!deliveryResult.success) {
          console.warn('[Send OTP] n8n failed, using fallback');
          deliveryResult = await sendOTPFallback(
            member.email,
            member.phone,
            member.country_code,
            otp,
            member.name
          );
          sentVia = { email: true, sms: !!member.phone };
        } else {
          // n8n succeeded, use its response
          sentVia = {
            email: deliveryResult.channels?.email ?? false,
            sms: deliveryResult.channels?.sms ?? false,
          };
        }
      } else {
        // Direct sending (current implementation)
        console.log('[Send OTP] Using direct sending (n8n disabled)');
        deliveryResult = await sendOTPFallback(
          member.email,
          member.phone,
          member.country_code,
          otp,
          member.name
        );
        sentVia = { email: true, sms: !!member.phone };
      }

      if (!deliveryResult.success) {
        return NextResponse.json(
          {
            status: 'error',
            message: deliveryResult.message || 'Failed to send OTP. Please try again later.',
          },
          { status: 500 }
        );
      }

      // Return success
      return NextResponse.json(
        {
          status: 'success',
          message: deliveryResult.message || 'OTP sent successfully',
          sentVia,
          method: useN8N ? 'n8n' : 'direct',
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
