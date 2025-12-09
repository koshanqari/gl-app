-- Migration to update RSVP responses from 'yes', 'no', 'pending' to 'yes', 'maybe', 'no'
-- This changes 'pending' to 'maybe' for existing records and updates the constraint

-- Step 1: Drop the old check constraint first
ALTER TABLE app.travel_rsvps
DROP CONSTRAINT IF EXISTS travel_rsvps_response_check;

-- Step 2: Update existing 'pending' responses to 'maybe'
UPDATE app.travel_rsvps
SET response = 'maybe'
WHERE response = 'pending';

-- Step 3: Add new check constraint with 'yes', 'maybe', 'no'
ALTER TABLE app.travel_rsvps
ADD CONSTRAINT travel_rsvps_response_check 
CHECK (response IN ('yes', 'maybe', 'no'));

-- Step 4: Update the default if needed (we'll handle defaults in application code)
-- Note: We're not setting a default in the database, but the application will use 'maybe' as the default

-- Verify the changes
SELECT 
  response,
  COUNT(*) as count
FROM app.travel_rsvps
GROUP BY response
ORDER BY response;

