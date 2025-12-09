# n8n Notification Service - Usage Examples

## Generic Notification Format

All notifications use this structure:
```typescript
{
  name: string,
  phone?: string,
  countryCode?: string,
  email: string,
  type: string,  // "OTP", "welcome", "Event Reminder", etc.
  data: Record<string, any>  // Any JSON structure you need
}
```

## Example 1: OTP Notification

```typescript
import { sendOTPNotification } from '@/lib/n8n-otp-service';

await sendOTPNotification(
  "john@example.com",
  "1234567890",
  "+91",
  "123456",
  "John Doe"
);

// Sends to n8n:
// {
//   name: "John Doe",
//   phone: "1234567890",
//   countryCode: "+91",
//   email: "john@example.com",
//   type: "OTP",
//   data: { otp: "123456" }
// }
```

## Example 2: Welcome Notification

```typescript
import { sendWelcomeNotification } from '@/lib/n8n-otp-service';

await sendWelcomeNotification(
  "john@example.com",
  "1234567890",
  "+91",
  "134",
  "John Doe"
);

// Sends to n8n:
// {
//   name: "John Doe",
//   phone: "1234567890",
//   countryCode: "+91",
//   email: "john@example.com",
//   type: "welcome",
//   data: { emp_code: "134" }
// }
```

## Example 3: Custom Notification Type

```typescript
import { sendNotificationViaN8N } from '@/lib/n8n-otp-service';

// Any type with any data structure
await sendNotificationViaN8N({
  name: "John Doe",
  phone: "1234567890",
  countryCode: "+91",
  email: "john@example.com",
  type: "Event Reminder",
  data: {
    eventName: "Annual Day",
    date: "2025-11-20",
    venue: "Convention Center",
    customField: "any value"
  }
});
```

## Example 4: Travel Update

```typescript
await sendNotificationViaN8N({
  name: member.name,
  phone: member.phone,
  countryCode: member.country_code,
  email: member.email,
  type: "Travel Update",
  data: {
    schedule: "Airport to Hotel - Morning Cab",
    time: "8:00 AM",
    pickupLocation: "Airport Terminal 2",
    dropoffLocation: "Hotel Grand Plaza"
  }
});
```

## Adding New Notification Types

**No code changes needed!** Just:

1. Use `sendNotificationViaN8N()` with your new type
2. Configure the workflow in n8n to handle that type
3. Use whatever data structure you need in the `data` field

Example:
```typescript
await sendNotificationViaN8N({
  name: "John",
  email: "john@example.com",
  type: "Room Assignment",  // New type!
  data: {
    roomNumber: "101",
    roomType: "Deluxe",
    checkIn: "2025-11-20",
    checkOut: "2025-11-22"
  }
});
```

## n8n Workflow Setup

In n8n, use a Switch node to route by `type`:

```
Webhook → Switch (by type)
  ├─ "OTP" → Send OTP Email/SMS
  ├─ "welcome" → Send Welcome Email/SMS
  ├─ "Event Reminder" → Send Event Reminder
  └─ Default → Log unknown type
```

Each branch can access:
- `$json.name`
- `$json.phone`
- `$json.email`
- `$json.type`
- `$json.data.otp` (for OTP)
- `$json.data.emp_code` (for welcome)
- `$json.data.*` (any field in data)


