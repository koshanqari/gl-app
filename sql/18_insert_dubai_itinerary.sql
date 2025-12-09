-- Insert sample Dubai trip itinerary for the Annual Day event
-- This creates a 3-day itinerary similar to the example provided

DO $$
DECLARE
  event_id_var UUID;
  day1_date DATE;
  day2_date DATE;
  day3_date DATE;
BEGIN
  -- Get the Annual Day event ID (or any active event)
  SELECT id, start_date INTO event_id_var, day1_date 
  FROM app.events 
  WHERE is_active = TRUE 
    AND event_name ILIKE '%annual%' 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- If no Annual Day event found, try to get any active event
  IF event_id_var IS NULL THEN
    SELECT id, start_date INTO event_id_var, day1_date
    FROM app.events
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF event_id_var IS NULL THEN
    RAISE NOTICE 'No active event found. Please create an event first.';
    RETURN;
  END IF;

  -- Calculate dates for Day 2 and Day 3
  day2_date := day1_date + INTERVAL '1 day';
  day3_date := day1_date + INTERVAL '2 days';

  RAISE NOTICE 'Creating itinerary for event: %, Day 1: %, Day 2: %, Day 3: %', event_id_var, day1_date, day2_date, day3_date;

  -- Clear existing itinerary for this event (optional - comment out if you want to keep existing)
  DELETE FROM app.itinerary_links WHERE activity_id IN (
    SELECT id FROM app.itinerary_activities WHERE event_id = event_id_var
  );
  DELETE FROM app.itinerary_activities WHERE event_id = event_id_var;

  -- =====================
  -- DAY 1 ACTIVITIES
  -- =====================
  
  INSERT INTO app.itinerary_activities (event_id, name, from_datetime, venue, description, sequence_order)
  VALUES 
    (event_id_var, 'Meet and Greet at International HUB', day1_date::timestamp + TIME '00:00:00', 'India - International HUB', 'Arrival in Dubai', 1),
    (event_id_var, 'Airport Pickup', day1_date::timestamp + TIME '00:00:00', 'Dubai International Airport', 'Meet and greet at the airport - as per arrival time', 2),
    (event_id_var, 'Lunch at Indian Restaurant', day1_date::timestamp + TIME '13:00:00', 'Indian Restaurant', 'Proceed to Lunch at Indian restaurant', 3),
    (event_id_var, 'Hotel Check-in', day1_date::timestamp + TIME '15:00:00', 'Hotel', 'Check in at hotel (standard check in time is 3PM)', 4),
    (event_id_var, 'City Tour of Dubai', day1_date::timestamp + TIME '16:30:00', 'Various Locations', 'Proceed for City tour of Dubai includes Jumeirah Mosque, Jumeirah beach, Burj Al Arab, Sheikh Zayed road', 5),
    (event_id_var, 'Burj Khalifa & Dubai Mall', day1_date::timestamp + TIME '18:30:00', 'Burj Khalifa & Dubai Mall', 'Get transferred to visit Burj Khalifa for photo stop and Dubai mall to enjoy Dubai Fountain Show', 6),
    (event_id_var, 'Dinner at Hotel Banquet', day1_date::timestamp + TIME '20:30:00', 'Hotel Banquet', 'Dinner at the hotel banquet (Supplement cost for Cocktails available)', 7),
    (event_id_var, 'Overnight at Hotel', day1_date::timestamp + TIME '00:00:00', 'Hotel', 'Overnight at the hotel', 8);

  -- =====================
  -- DAY 2 ACTIVITIES
  -- =====================
  
  INSERT INTO app.itinerary_activities (event_id, name, from_datetime, venue, description, sequence_order)
  VALUES 
    (event_id_var, 'Breakfast at Hotel', day2_date::timestamp + TIME '07:30:00', 'Hotel Restaurant', 'Breakfast at the hotel', 1),
    (event_id_var, 'City Tour - Gold Souk & Mall of Emirates', day2_date::timestamp + TIME '10:00:00', 'Gold Souk & Mall of Emirates', 'Later proceed to City tour including Gold souk with Visit Mall of Emirates', 2),
    (event_id_var, 'Lunch at Indian Restaurant', day2_date::timestamp + TIME '13:00:00', 'Indian Restaurant', 'Lunch at Indian restaurant', 3),
    (event_id_var, 'Desert Safari with Dune Bashing', day2_date::timestamp + TIME '15:30:00', 'Desert', 'Proceed to Desert Safari with Dune Bashing in Land Cruiser', 4),
    (event_id_var, 'Entertainment at Safari Camp', day2_date::timestamp + TIME '18:00:00', 'Safari Camp', 'Entertainment at Safari Camp including belly dancing, henna, camel rides', 5),
    (event_id_var, 'Dinner at Safari Camp', day2_date::timestamp + TIME '19:30:00', 'Safari Camp', 'Dinner at Safari Camp (Supplement cost for Cocktails available)', 6),
    (event_id_var, 'Return to City', day2_date::timestamp + TIME '21:00:00', 'En Route', 'Back to City', 7),
    (event_id_var, 'Overnight at Hotel', day2_date::timestamp + TIME '00:00:00', 'Hotel', 'Overnight at the hotel', 8);

  -- =====================
  -- DAY 3 ACTIVITIES
  -- =====================
  
  INSERT INTO app.itinerary_activities (event_id, name, from_datetime, venue, description, sequence_order)
  VALUES 
    (event_id_var, 'Breakfast at Hotel', day3_date::timestamp + TIME '07:30:00', 'Hotel Restaurant', 'Breakfast at the hotel', 1),
    (event_id_var, 'Hotel Checkout & Shopping', day3_date::timestamp + TIME '10:00:00', 'Hotel / Shopping Mall', 'Checkout and proceed to Shopping', 2),
    (event_id_var, 'Lunch at Indian Restaurant', day3_date::timestamp + TIME '13:00:00', 'Indian Restaurant', 'Lunch in Indian restaurant (Supplement cost available)', 3),
    (event_id_var, 'Airport Transfer', day3_date::timestamp + TIME '00:00:00', 'Dubai International Airport', 'Proceed to airport as per flight times. TOUR ENDS', 4);

  RAISE NOTICE 'Dubai itinerary created successfully with % activities', 
    (SELECT COUNT(*) FROM app.itinerary_activities WHERE event_id = event_id_var);

END $$;

-- Verify the insertion
SELECT 
  DATE(from_datetime) as day,
  sequence_order,
  name,
  CASE 
    WHEN EXTRACT(HOUR FROM from_datetime) = 0 AND EXTRACT(MINUTE FROM from_datetime) = 0 
    THEN 'As per schedule'
    ELSE TO_CHAR(from_datetime, 'HH12:MI AM')
  END as time,
  venue
FROM app.itinerary_activities
WHERE is_active = TRUE
ORDER BY from_datetime, sequence_order;


