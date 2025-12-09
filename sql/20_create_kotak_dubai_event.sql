-- Create Kotak Life partner and Dubai Agency FLY event
-- Run this script to populate the event data

-- Get the partner ID for use in subsequent queries
DO $$
DECLARE
    partner_id UUID;
    event_id UUID;
BEGIN
    -- Get or create partner
    SELECT id INTO partner_id FROM app.partners WHERE company_name = 'Kotak Life' LIMIT 1;
    
    IF partner_id IS NULL THEN
        INSERT INTO app.partners (company_name, industry_type, is_active)
        VALUES ('Kotak Life', 'Insurance & Financial Services', TRUE)
        RETURNING id INTO partner_id;
    END IF;
    
    RAISE NOTICE 'Partner ID: %', partner_id;

    -- 2. Create Event: Dubai Agency FLY Jul'25
    INSERT INTO app.events (
        partner_id, 
        event_name, 
        event_type, 
        start_date, 
        end_date, 
        location, 
        description,
        send_registration_notification,
        is_active
    )
    VALUES (
        partner_id,
        'Dubai Agency FLY Jul''25',
        'Incentive Trip',
        '2026-02-19',
        '2026-02-21',
        'Dubai, UAE',
        'Tied Agency FLY Jul''25 Dubai - A 3-day package tour for 325 guests from 7 hubs across India. Includes city tours, Burj Khalifa visit, Desert Safari, and more.',
        TRUE,
        TRUE
    )
    RETURNING id INTO event_id;
    
    RAISE NOTICE 'Event ID: %', event_id;

    -- 3. Create Itinerary Activities

    -- DAY 1 Activities
    INSERT INTO app.itinerary_activities (event_id, name, from_datetime, to_datetime, venue, description, sequence_order)
    VALUES 
    (event_id, 'Meet and Greet at India Hub', '2026-02-19 06:00:00', '2026-02-19 08:00:00', 'International Airport (Hub City)', 'Meet and greet at the India – International HUB for departure to Dubai', 1),
    (event_id, 'Arrival in Dubai', '2026-02-19 12:00:00', '2026-02-19 13:00:00', 'Dubai International Airport', 'Arrival in Dubai with meet and greet at the airport', 2),
    (event_id, 'Lunch', '2026-02-19 13:30:00', '2026-02-19 15:00:00', 'Indian Restaurant', 'Proceed to Lunch at Indian restaurant', 3),
    (event_id, 'Hotel Check-in', '2026-02-19 15:00:00', '2026-02-19 16:00:00', 'Hotel', 'Check in at hotel (standard check in time is 3PM)', 4),
    (event_id, 'Dubai City Tour', '2026-02-19 16:30:00', '2026-02-19 19:00:00', 'Dubai City', 'City tour of Dubai includes Jumeirah Mosque, Jumeirah beach, Burj Al Arab, Sheikh Zayed Road', 5),
    (event_id, 'Burj Khalifa & Dubai Mall', '2026-02-19 19:30:00', '2026-02-19 21:00:00', 'Burj Khalifa & Dubai Mall', 'Photo stop at Burj Khalifa and enjoy Dubai Fountain Show at Dubai Mall', 6),
    (event_id, 'Dinner at Hotel Banquet', '2026-02-19 21:30:00', '2026-02-19 23:00:00', 'Hotel Banquet', 'Dinner at the hotel banquet', 7);

    -- DAY 2 Activities
    INSERT INTO app.itinerary_activities (event_id, name, from_datetime, to_datetime, venue, description, sequence_order)
    VALUES 
    (event_id, 'Breakfast', '2026-02-20 07:30:00', '2026-02-20 09:00:00', 'Hotel Restaurant', 'Breakfast at the hotel', 1),
    (event_id, 'City Tour & Gold Souk', '2026-02-20 09:30:00', '2026-02-20 12:30:00', 'Gold Souk & Mall of Emirates', 'City tour including Gold Souk with visit to Mall of Emirates', 2),
    (event_id, 'Lunch', '2026-02-20 13:00:00', '2026-02-20 14:30:00', 'Indian Restaurant', 'Lunch at Indian restaurant', 3),
    (event_id, 'Desert Safari', '2026-02-20 15:00:00', '2026-02-20 18:00:00', 'Dubai Desert', 'Desert Safari with Dune Bashing in Land Cruiser', 4),
    (event_id, 'Entertainment at Safari Camp', '2026-02-20 18:00:00', '2026-02-20 20:00:00', 'Safari Camp', 'Entertainment at Safari Camp', 5),
    (event_id, 'Dinner at Safari Camp', '2026-02-20 20:00:00', '2026-02-20 22:00:00', 'Safari Camp', 'Dinner at Safari Camp with entertainment', 6);

    -- DAY 3 Activities
    INSERT INTO app.itinerary_activities (event_id, name, from_datetime, to_datetime, venue, description, sequence_order)
    VALUES 
    (event_id, 'Breakfast', '2026-02-21 07:30:00', '2026-02-21 09:00:00', 'Hotel Restaurant', 'Breakfast at the hotel', 1),
    (event_id, 'Hotel Checkout', '2026-02-21 09:00:00', '2026-02-21 10:00:00', 'Hotel', 'Checkout from the hotel', 2),
    (event_id, 'Shopping', '2026-02-21 10:00:00', '2026-02-21 13:00:00', 'Dubai Shopping Areas', 'Proceed to shopping', 3),
    (event_id, 'Lunch', '2026-02-21 13:00:00', '2026-02-21 14:30:00', 'Indian Restaurant', 'Lunch at Indian restaurant', 4),
    (event_id, 'Transfer to Airport', '2026-02-21 15:00:00', '2026-02-21 17:00:00', 'Dubai International Airport', 'Proceed to airport as per flight times. TOUR ENDS', 5);

    -- 4. Create Travel Schedules for each hub
    -- Columns: event_id, name, from_datetime, to_datetime, pickup_location, dropoff_location, vehicle_type, description
    INSERT INTO app.travel_schedules (event_id, name, from_datetime, to_datetime, pickup_location, dropoff_location, vehicle_type, description)
    VALUES 
    -- Mumbai Hub (94 pax)
    (event_id, 'Mumbai to Dubai - Departure', '2026-02-19 06:00:00', '2026-02-19 12:00:00', 'Mumbai International Airport', 'Dubai International Airport', 'Flight', 'Flight from Mumbai to Dubai for 94 guests'),
    (event_id, 'Dubai to Mumbai - Return', '2026-02-21 18:00:00', '2026-02-21 23:00:00', 'Dubai International Airport', 'Mumbai International Airport', 'Flight', 'Return flight from Dubai to Mumbai'),
    
    -- Delhi Hub (77 pax)
    (event_id, 'Delhi to Dubai - Departure', '2026-02-19 06:00:00', '2026-02-19 12:00:00', 'Delhi International Airport', 'Dubai International Airport', 'Flight', 'Flight from Delhi to Dubai for 77 guests'),
    (event_id, 'Dubai to Delhi - Return', '2026-02-21 18:00:00', '2026-02-21 23:00:00', 'Dubai International Airport', 'Delhi International Airport', 'Flight', 'Return flight from Dubai to Delhi'),
    
    -- Kolkata Hub (52 pax)
    (event_id, 'Kolkata to Dubai - Departure', '2026-02-19 06:00:00', '2026-02-19 12:00:00', 'Kolkata International Airport', 'Dubai International Airport', 'Flight', 'Flight from Kolkata to Dubai for 52 guests'),
    (event_id, 'Dubai to Kolkata - Return', '2026-02-21 18:00:00', '2026-02-21 23:00:00', 'Dubai International Airport', 'Kolkata International Airport', 'Flight', 'Return flight from Dubai to Kolkata'),
    
    -- Ahmedabad Hub (46 pax)
    (event_id, 'Ahmedabad to Dubai - Departure', '2026-02-19 06:00:00', '2026-02-19 12:00:00', 'Ahmedabad International Airport', 'Dubai International Airport', 'Flight', 'Flight from Ahmedabad to Dubai for 46 guests'),
    (event_id, 'Dubai to Ahmedabad - Return', '2026-02-21 18:00:00', '2026-02-21 23:00:00', 'Dubai International Airport', 'Ahmedabad International Airport', 'Flight', 'Return flight from Dubai to Ahmedabad'),
    
    -- Hyderabad Hub (40 pax)
    (event_id, 'Hyderabad to Dubai - Departure', '2026-02-19 06:00:00', '2026-02-19 12:00:00', 'Hyderabad International Airport', 'Dubai International Airport', 'Flight', 'Flight from Hyderabad to Dubai for 40 guests'),
    (event_id, 'Dubai to Hyderabad - Return', '2026-02-21 18:00:00', '2026-02-21 23:00:00', 'Dubai International Airport', 'Hyderabad International Airport', 'Flight', 'Return flight from Dubai to Hyderabad'),
    
    -- Bangalore Hub (10 pax)
    (event_id, 'Bangalore to Dubai - Departure', '2026-02-19 06:00:00', '2026-02-19 12:00:00', 'Bangalore International Airport', 'Dubai International Airport', 'Flight', 'Flight from Bangalore to Dubai for 10 guests'),
    (event_id, 'Dubai to Bangalore - Return', '2026-02-21 18:00:00', '2026-02-21 23:00:00', 'Dubai International Airport', 'Bangalore International Airport', 'Flight', 'Return flight from Dubai to Bangalore'),
    
    -- Chennai Hub (6 pax)
    (event_id, 'Chennai to Dubai - Departure', '2026-02-19 06:00:00', '2026-02-19 12:00:00', 'Chennai International Airport', 'Dubai International Airport', 'Flight', 'Flight from Chennai to Dubai for 6 guests'),
    (event_id, 'Dubai to Chennai - Return', '2026-02-21 18:00:00', '2026-02-21 23:00:00', 'Dubai International Airport', 'Chennai International Airport', 'Flight', 'Return flight from Dubai to Chennai');

    RAISE NOTICE 'Successfully created Kotak Life partner and Dubai Agency FLY event with itinerary and travel schedules';
    
END $$;

-- Verify the data
SELECT 'Partner' as type, company_name as name, id FROM app.partners WHERE company_name = 'Kotak Life';
SELECT 'Event' as type, event_name as name, id FROM app.events WHERE event_name = 'Dubai Agency FLY Jul''25';

