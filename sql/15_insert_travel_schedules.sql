-- Insert sample travel schedules for GrowthCJokey's Annual Day
-- This script creates travel schedules (cabs, buses) for the event

-- First, get the event ID (assuming the event exists)
DO $$
DECLARE
  event_id_var UUID;
  exec_id UUID;
  member_ids UUID[];
BEGIN
  -- Get event ID for GrowthCJokey's Annual Day (or first active event if not found)
  SELECT id INTO event_id_var 
  FROM app.events 
  WHERE event_name ILIKE '%growthcjokey%' OR event_name ILIKE '%annual%day%'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If not found, get first active event
  IF event_id_var IS NULL THEN
    SELECT id INTO event_id_var 
    FROM app.events 
    WHERE is_active = TRUE 
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Get executive ID for created_by
  SELECT id INTO exec_id 
  FROM app.executives 
  WHERE is_active = TRUE 
  ORDER BY created_at 
  LIMIT 1;
  
  -- Get some member IDs for RSVPs
  SELECT ARRAY_AGG(id) INTO member_ids
  FROM app.members
  WHERE event_id = event_id_var AND is_active = TRUE
  LIMIT 10;
  
  -- Only proceed if we have an event
  IF event_id_var IS NOT NULL THEN
    -- Insert travel schedules
    INSERT INTO app.travel_schedules (
      event_id, name, from_datetime, to_datetime, 
      pickup_location, dropoff_location, vehicle_type, description, created_by
    ) VALUES
    -- Morning pickup from airport to hotel
    (
      event_id_var,
      'Airport to Hotel - Morning Cab',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '08:00:00',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '09:00:00',
      'Airport Terminal 2',
      'Hotel Grand Plaza',
      'Cab',
      'Morning pickup for early arrivals',
      exec_id
    ),
    -- Afternoon pickup from airport to hotel
    (
      event_id_var,
      'Airport to Hotel - Afternoon Cab',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '14:00:00',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '15:00:00',
      'Airport Terminal 2',
      'Hotel Grand Plaza',
      'Cab',
      'Afternoon pickup for standard arrivals',
      exec_id
    ),
    -- Evening pickup from airport to hotel
    (
      event_id_var,
      'Airport to Hotel - Evening Cab',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '20:00:00',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '21:00:00',
      'Airport Terminal 2',
      'Hotel Grand Plaza',
      'Cab',
      'Evening pickup for late arrivals',
      exec_id
    ),
    -- Hotel to event venue - Morning
    (
      event_id_var,
      'Hotel to Event Venue - Morning Bus',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + TIME '08:00:00',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + TIME '08:30:00',
      'Hotel Grand Plaza',
      'Convention Center',
      'Bus',
      'Morning transportation to event venue',
      exec_id
    ),
    -- Hotel to event venue - Afternoon
    (
      event_id_var,
      'Hotel to Event Venue - Afternoon Bus',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + TIME '13:00:00',
      (SELECT start_date FROM app.events WHERE id = event_id_var)::timestamp + TIME '13:30:00',
      'Hotel Grand Plaza',
      'Convention Center',
      'Bus',
      'Afternoon transportation to event venue',
      exec_id
    ),
    -- Event venue to hotel - Evening
    (
      event_id_var,
      'Event Venue to Hotel - Evening Bus',
      (SELECT end_date FROM app.events WHERE id = event_id_var)::timestamp + TIME '18:00:00',
      (SELECT end_date FROM app.events WHERE id = event_id_var)::timestamp + TIME '18:30:00',
      'Convention Center',
      'Hotel Grand Plaza',
      'Bus',
      'Evening return transportation to hotel',
      exec_id
    ),
    -- Hotel to airport - Departure day
    (
      event_id_var,
      'Hotel to Airport - Departure Cab',
      (SELECT end_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '10:00:00',
      (SELECT end_date FROM app.events WHERE id = event_id_var)::timestamp + INTERVAL '1 day' + TIME '11:00:00',
      'Hotel Grand Plaza',
      'Airport Terminal 2',
      'Cab',
      'Departure day transportation to airport',
      exec_id
    );
    
    -- Create some sample RSVPs (if members exist)
    IF member_ids IS NOT NULL AND array_length(member_ids, 1) > 0 THEN
      -- Get the travel schedule IDs we just created
      INSERT INTO app.travel_rsvps (travel_schedule_id, member_id, response, responded_at)
      SELECT 
        ts.id,
        unnest(member_ids[1:LEAST(5, array_length(member_ids, 1))]),
        CASE (random() * 3)::int
          WHEN 0 THEN 'yes'
          WHEN 1 THEN 'maybe'
          ELSE 'no'
        END,
        CASE 
          WHEN random() > 0.3 THEN NOW() - (random() * INTERVAL '2 days')
          ELSE NULL
        END
      FROM app.travel_schedules ts
      WHERE ts.event_id = event_id_var 
        AND ts.is_active = TRUE
        AND ts.name LIKE '%Morning%'
      LIMIT 15;
    END IF;
    
    RAISE NOTICE 'Travel schedules created successfully for event: %', event_id_var;
  ELSE
    RAISE NOTICE 'No active event found. Please create an event first.';
  END IF;
END $$;

-- Verify the insertion
SELECT 
  ts.name,
  ts.from_datetime,
  ts.vehicle_type,
  ts.pickup_location,
  ts.dropoff_location,
  COUNT(tr.id) FILTER (WHERE tr.response = 'yes') as yes_count,
  COUNT(tr.id) FILTER (WHERE tr.response = 'no') as no_count,
  COUNT(tr.id) FILTER (WHERE tr.response = 'maybe') as maybe_count
FROM app.travel_schedules ts
LEFT JOIN app.travel_rsvps tr ON ts.id = tr.travel_schedule_id
WHERE ts.is_active = TRUE
GROUP BY ts.id, ts.name, ts.from_datetime, ts.vehicle_type, ts.pickup_location, ts.dropoff_location
ORDER BY ts.from_datetime;

