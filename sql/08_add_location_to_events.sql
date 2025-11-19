-- Add location field to events table
ALTER TABLE app.events 
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Update existing events with default location
UPDATE app.events 
SET location = 'To Be Announced'
WHERE location IS NULL;

-- Verify the update
SELECT id, event_name, location, start_date FROM app.events LIMIT 5;

