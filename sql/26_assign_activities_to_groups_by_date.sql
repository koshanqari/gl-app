-- Assign activities to groups based on their from_datetime matching group start_date
-- This will match activities to Day 1, Day 2, etc. based on the activity date

UPDATE app.itinerary_activities a
SET group_id = (
  SELECT g.id
  FROM app.itinerary_groups g
  WHERE g.event_id = a.event_id
    AND g.is_active = TRUE
    AND DATE(a.from_datetime) = g.start_date
  ORDER BY g.group_order
  LIMIT 1
)
WHERE a.is_active = TRUE
  AND a.group_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM app.itinerary_groups g
    WHERE g.event_id = a.event_id
      AND g.is_active = TRUE
      AND DATE(a.from_datetime) = g.start_date
  );

-- Verify assignments
SELECT 
  e.event_name,
  COUNT(*) FILTER (WHERE a.group_id IS NOT NULL) as assigned_count,
  COUNT(*) FILTER (WHERE a.group_id IS NULL) as unassigned_count,
  COUNT(*) as total_activities
FROM app.events e
JOIN app.itinerary_activities a ON a.event_id = e.id AND a.is_active = TRUE
WHERE e.event_name = 'Dubai Agency FLY Jul''25'
GROUP BY e.id, e.event_name;

