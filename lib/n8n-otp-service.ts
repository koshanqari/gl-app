/**
 * Generic notification service via n8n webhook
 * This allows flexible template and channel management through n8n
 * 
 * n8n will route based on "type" and use "data" for the notification content
 * 
 * The data field is completely flexible - you can send any JSON structure:
 * - OTP: { type: "OTP", data: { otp: "123456" } }
 * - Welcome: { type: "welcome", data: { emp_code: "134" } }
 * - Event Reminder: { type: "Event Reminder", data: { eventName: "...", date: "..." } }
 * - Travel Update: { type: "Travel Update", data: { schedule: "...", time: "..." } }
 * 
 * Add any new type with any data structure - no code changes needed!
 */

export type NotificationType = 'OTP' | 'welcome' | 'Event Reminder' | 'Travel Update' | 'Room Assignment' | string;

export interface NotificationRequest {
  name?: string;
  phone?: string;
  countryCode?: string;
  email: string;
  type: NotificationType;
  data: Record<string, any>; // Flexible JSON data for the notification
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  channels?: {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
  };
}

/**
 * Send notification through n8n webhook
 * n8n will handle routing based on "type" and use "data" for content
 * 
 * Example payload:
 * {
 *   name: "John Doe",
 *   phone: "1234567890",
 *   countryCode: "+91",
 *   email: "john@example.com",
 *   type: "OTP",
 *   data: { otp: "123456", expiresIn: 5 }
 * }
 */
export async function sendNotificationViaN8N(
  request: NotificationRequest
): Promise<NotificationResponse> {
  try {
    const n8nWebhookUrl = process.env.N8N_NOTIFICATION_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error('N8N_NOTIFICATION_WEBHOOK_URL is not configured');
      return {
        success: false,
        message: 'Notification service is not configured',
      };
    }

    // Prepare payload for n8n (matching n8n workflow format)
    const payload = {
      name: request.name,
      phone: request.phone,
      country_code: request.countryCode, // Convert camelCase to snake_case for n8n
      email: request.email,
      type: request.type,
      source: 'gl-app', // Identifier for the source application
      data: request.data,
    };

    // Call n8n webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: Add authentication header if n8n requires it
          ...(process.env.N8N_WEBHOOK_SECRET && {
            'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
          }),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('n8n webhook error:', errorText);
        return {
          success: false,
          message: `n8n webhook returned ${response.status}`,
        };
      }

      const data = await response.json();

      // n8n should return: { success: true, channels: { email: true, sms: true } }
      return {
        success: data.success !== false,
        message: data.message,
        channels: data.channels,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('n8n webhook timeout');
        return {
          success: false,
          message: 'Notification service timeout',
        };
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Failed to send notification via n8n:', error);
    return {
      success: false,
      message: error.message || 'Failed to send notification',
    };
  }
}

/**
 * Helper function to send OTP notification
 * Convenience wrapper for the generic notification service
 */
export async function sendOTPNotification(
  email: string,
  phone: string | null | undefined,
  countryCode: string | null | undefined,
  otp: string,
  name?: string
): Promise<NotificationResponse> {
  return sendNotificationViaN8N({
    name: name,
    phone: phone || undefined,
    countryCode: countryCode || undefined,
    email: email,
    type: 'otp', // Lowercase to match n8n workflow
    data: {
      otp_code: otp, // Use otp_code to match n8n workflow
    },
  });
}

/**
 * Helper function to send welcome notification
 * Example of how to use the generic service for different types
 */
export async function sendWelcomeNotification(
  email: string,
  phone: string | null | undefined,
  countryCode: string | null | undefined,
  empCode: string,
  name?: string
): Promise<NotificationResponse> {
  return sendNotificationViaN8N({
    name: name,
    phone: phone || undefined,
    countryCode: countryCode || undefined,
    email: email,
    type: 'welcome',
    data: {
      emp_code: empCode,
    },
  });
}

/**
 * Fallback: Send OTP directly (if n8n is unavailable)
 * This ensures OTP delivery even if n8n is down
 * Only used for OTP type notifications
 */
export async function sendOTPFallback(
  email: string,
  phone: string | null,
  countryCode: string | null,
  otp: string,
  memberName?: string
): Promise<{ success: boolean; message?: string }> {
  // Import fallback services
  const { sendEmail, generateOTPEmailHTML } = await import('@/lib/email-service');
  const { sendSMS } = await import('@/lib/sms-service');

  const [smsResult, emailResult] = await Promise.allSettled([
    phone && countryCode
      ? sendSMS(`${countryCode}${phone}`, otp)
      : Promise.resolve({ success: false, message: 'No phone number available' }),
    sendEmail(
      email,
      'OTP Verification - EventCentral',
      generateOTPEmailHTML(otp, memberName)
    ),
  ]);

  const smsSuccess = smsResult.status === 'fulfilled' && smsResult.value.success;
  const emailSuccess = emailResult.status === 'fulfilled' && emailResult.value.success;

  if (!smsSuccess && !emailSuccess) {
    return {
      success: false,
      message: 'Failed to send OTP via fallback',
    };
  }

  return {
    success: true,
    message: `OTP sent${smsSuccess && emailSuccess ? ' via SMS and email' : smsSuccess ? ' via SMS' : ' via email'}`,
  };
}

