/**
 * Send SMS using Fast2SMS API
 * @param phoneNumber - Phone number (with country code, e.g., "6006324328")
 * @param otp - 6-digit OTP code
 * @returns Promise<boolean> - true if successful
 */
export async function sendSMS(phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.FAST2SMS_SENDER_ID || 'GrwthJ';
    const templateId = process.env.FAST2SMS_TEMPLATE_ID || '171149';

    if (!apiKey) {
      console.error('FAST2SMS_API_KEY is not configured');
      return {
        success: false,
        message: 'SMS service is not configured',
      };
    }

    // Remove any spaces, dashes, or plus signs from phone number
    const cleanPhone = phoneNumber.replace(/[\s\-+]/g, '');

    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.append('authorization', apiKey);
    url.searchParams.append('route', 'dlt');
    url.searchParams.append('sender_id', senderId);
    url.searchParams.append('message', templateId);
    url.searchParams.append('variables_values', otp);
    url.searchParams.append('flash', '0');
    url.searchParams.append('numbers', cleanPhone);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.return === true) {
      return { success: true };
    } else {
      console.error('Fast2SMS API error:', data);
      return {
        success: false,
        message: data.message || 'Failed to send SMS',
      };
    }
  } catch (error: any) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send SMS',
    };
  }
}

