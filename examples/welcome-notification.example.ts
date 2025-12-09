/**
 * Example: How to send a welcome notification
 * 
 * This shows how to use the generic notification service
 * for different notification types with different data structures
 */

import { sendWelcomeNotification } from '@/lib/n8n-otp-service';

// Example: Send welcome notification when a new member is created
export async function sendWelcomeToNewMember(member: {
  email: string;
  phone?: string;
  country_code?: string;
  name?: string;
  employee_id: string;
}) {
  const useN8N = process.env.USE_N8N_NOTIFICATIONS === 'true' && 
                 process.env.N8N_NOTIFICATION_WEBHOOK_URL;

  if (useN8N) {
    // Send via n8n
    // This will send:
    // {
    //   name: "John Doe",
    //   phone: "1234567890",
    //   countryCode: "+91",
    //   email: "john@example.com",
    //   type: "welcome",
    //   data: { emp_code: "134" }
    // }
    const result = await sendWelcomeNotification(
      member.email,
      member.phone,
      member.country_code,
      member.employee_id,
      member.name
    );

    if (!result.success) {
      console.error('Failed to send welcome notification via n8n:', result.message);
      // Could add fallback here if needed
    }

    return result;
  } else {
    // Direct sending (if n8n is disabled)
    // You could implement direct welcome email here
    console.log('n8n disabled, skipping welcome notification');
    return { success: false, message: 'n8n disabled' };
  }
}

// Usage in your code:
// await sendWelcomeToNewMember({
//   email: "john@example.com",
//   phone: "1234567890",
//   country_code: "+91",
//   name: "John Doe",
//   employee_id: "134"
// });



