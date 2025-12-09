-- Update Dubai event dates and groups to match itinerary
-- Event: Dubai Agency FLY Jul'25
-- Dates: 19th - 24th February 2026
-- Groups: Day 1 (Feb 19), Day 2 (Feb 20), Day 3 (Feb 21), Day 4 (Feb 22), Day 5 (Feb 23), Day 6 (Feb 24)

BEGIN;

-- Update event dates
UPDATE app.events 
SET start_date = '2026-02-19', end_date = '2026-02-24'
WHERE event_name = 'Dubai Agency FLY Jul''25';

-- Update existing group dates
UPDATE app.itinerary_groups
SET start_date = CASE 
  WHEN group_name = 'Day 1' THEN '2026-02-19'::DATE
  WHEN group_name = 'Day 2' THEN '2026-02-20'::DATE
  WHEN group_name = 'Day 3' THEN '2026-02-21'::DATE
  ELSE start_date
END
WHERE event_id = (SELECT id FROM app.events WHERE event_name = 'Dubai Agency FLY Jul''25')
  AND group_name IN ('Day 1', 'Day 2', 'Day 3');

-- Create additional groups if needed (Day 4, 5, 6)
INSERT INTO app.itinerary_groups (event_id, group_name, group_order, start_date, is_active)
SELECT 
  e.id,
  'Day ' || day_num::TEXT,
  day_num,
  '2026-02-19'::DATE + (day_num - 1) * INTERVAL '1 day',
  TRUE
FROM app.events e
CROSS JOIN generate_series(4, 6) AS day_num
WHERE e.event_name = 'Dubai Agency FLY Jul''25'
  AND NOT EXISTS (
    SELECT 1 FROM app.itinerary_groups g 
    WHERE g.event_id = e.id 
      AND g.group_name = 'Day ' || day_num::TEXT
      AND g.is_active = TRUE
  );

COMMIT;

-- Verify
SELECT 
  e.event_name,
  e.start_date,
  e.end_date,
  g.group_name,
  g.group_order,
  g.start_date as group_date
FROM app.events e
LEFT JOIN app.itinerary_groups g ON g.event_id = e.id AND g.is_active = TRUE
WHERE e.event_name = 'Dubai Agency FLY Jul''25'
ORDER BY g.group_order;


