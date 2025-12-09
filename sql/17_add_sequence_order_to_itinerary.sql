-- Add sequence_order column to itinerary_activities table
-- This enables day-based ordering without strict time requirements

ALTER TABLE app.itinerary_activities
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 0;

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_sequence 
ON app.itinerary_activities(event_id, from_datetime, sequence_order);

-- Update existing activities to have sequence order based on time
UPDATE app.itinerary_activities
SET sequence_order = subq.row_num
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY event_id, DATE(from_datetime) 
      ORDER BY from_datetime
    ) as row_num
  FROM app.itinerary_activities
) subq
WHERE app.itinerary_activities.id = subq.id;

-- Add comment
COMMENT ON COLUMN app.itinerary_activities.sequence_order IS 'Order of activity within a day (1, 2, 3...). Used for narrative-style itineraries.';

