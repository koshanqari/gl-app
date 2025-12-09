-- Add notification settings to events table
-- This allows per-event control of notifications

ALTER TABLE app.events
ADD COLUMN IF NOT EXISTS send_registration_notification BOOLEAN DEFAULT TRUE;

-- Add comment
COMMENT ON COLUMN app.events.send_registration_notification IS 'Whether to send n8n notification when a member registers for this event';

-- Verify
SELECT id, event_name, send_registration_notification 
FROM app.events 
WHERE is_active = TRUE 
LIMIT 5;

