/**
 * Send email using Brevo (formerly Sendinblue) API
 * @param toEmail - Recipient email address
 * @param toName - Recipient name (optional)
 * @param subject - Email subject
 * @param htmlContent - HTML content of the email
 * @returns Promise<boolean> - true if successful
 */
export async function sendEmail(
  toEmail: string,
  subject: string,
  htmlContent: string,
  toName?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@intellsys.tech';
    const senderName = process.env.BREVO_SENDER_NAME || 'EventCentral';

    if (!apiKey) {
      console.error('BREVO_API_KEY is not configured');
      return {
        success: false,
        message: 'Email service is not configured',
      };
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'API-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split('@')[0],
          },
        ],
        htmlContent: htmlContent,
        subject: subject,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      console.error('Brevo API error:', data);
      return {
        success: false,
        message: data.message || 'Failed to send email',
      };
    }
  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email',
    };
  }
}

/**
 * Generate HTML content for OTP email
 */
export function generateOTPEmailHTML(otp: string, recipientName?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #1e293b; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">EventCentral</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px;">OTP Verification</h2>
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                ${recipientName ? `Hello ${recipientName},` : 'Hello,'}
              </p>
              <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                Your One-Time Password (OTP) for login is:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 20px 40px; background-color: #f1f5f9; border-radius: 8px; border: 2px dashed #cbd5e1;">
                  <span style="font-size: 32px; font-weight: bold; color: #1e293b; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${otp}
                  </span>
                </div>
              </div>
              <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                This OTP is valid for 10 minutes. Please do not share this code with anyone.
              </p>
              <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                If you didn't request this OTP, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #f8fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} EventCentral. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

