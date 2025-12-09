-- Migration: Allow NULL for room_number in room_assignments table
-- This allows clearing room assignments via CSV upload

ALTER TABLE app.room_assignments 
ALTER COLUMN room_number DROP NOT NULL;

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'app' 
  AND table_name = 'room_assignments' 
  AND column_name = 'room_number';

