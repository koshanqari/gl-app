-- Migration: Drop redundant status column from room_assignments
-- Status can be derived from room_number: NULL = unassigned, NOT NULL = assigned

-- Drop the status column
ALTER TABLE app.room_assignments 
DROP COLUMN IF EXISTS status;

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'app' 
  AND table_name = 'room_assignments'
ORDER BY ordinal_position;


