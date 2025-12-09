-- Update travel schedules for Dubai event to simplified 4 schedules
-- 1. Home state to Dubai (flight)
-- 2. Dubai to hotel (cab)
-- 3. Hotel to airport (cab)
-- 4. Airport to home state (flight)

BEGIN;

-- Get Dubai event ID
DO $$
DECLARE
    dubai_event_id UUID;
BEGIN
    SELECT id INTO dubai_event_id
    FROM app.events
    WHERE event_name = 'Dubai Agency FLY Jul''25'
    LIMIT 1;
    
    IF dubai_event_id IS NULL THEN
        RAISE EXCEPTION 'Dubai event not found';
    END IF;
    
    -- Soft delete all existing travel schedules
    UPDATE app.travel_schedules
    SET is_active = FALSE, updated_at = NOW()
    WHERE event_id = dubai_event_id;
    
    -- Insert new simplified travel schedules
    INSERT INTO app.travel_schedules 
        (event_id, name, vehicle_type, pickup_location, dropoff_location, 
         from_datetime, to_datetime, description, is_active, created_at, updated_at)
    VALUES
        -- 1. Home state to Dubai (flight)
        (
            dubai_event_id,
            'Home State to Dubai',
            'Flight',
            'Home State',
            'Dubai Airport',
            '2026-02-19 00:00:00'::TIMESTAMP, -- Day 1
            '2026-02-19 23:59:59'::TIMESTAMP,
            'Flight from your home state to Dubai',
            TRUE,
            NOW(),
            NOW()
        ),
        -- 2. Dubai to hotel (cab)
        (
            dubai_event_id,
            'Dubai Airport to Hotel',
            'Cab',
            'Dubai Airport',
            'Hotel',
            '2026-02-19 00:00:00'::TIMESTAMP, -- Day 1
            NULL,
            'Cab transfer from Dubai Airport to Hotel',
            TRUE,
            NOW(),
            NOW()
        ),
        -- 3. Hotel to airport (cab)
        (
            dubai_event_id,
            'Hotel to Dubai Airport',
            'Cab',
            'Hotel',
            'Dubai Airport',
            '2026-02-21 00:00:00'::TIMESTAMP, -- Day 3 (checkout day)
            NULL,
            'Cab transfer from Hotel to Dubai Airport',
            TRUE,
            NOW(),
            NOW()
        ),
        -- 4. Airport to home state (flight)
        (
            dubai_event_id,
            'Dubai to Home State',
            'Flight',
            'Dubai Airport',
            'Home State',
            '2026-02-21 00:00:00'::TIMESTAMP, -- Day 3
            '2026-02-21 23:59:59'::TIMESTAMP,
            'Flight from Dubai Airport to your home state',
            TRUE,
            NOW(),
            NOW()
        );
    
    RAISE NOTICE 'Updated travel schedules for Dubai event';
END $$;

-- Verify
SELECT 
    ts.name,
    ts.vehicle_type,
    ts.pickup_location,
    ts.dropoff_location,
    ts.from_datetime
FROM app.travel_schedules ts
JOIN app.events e ON ts.event_id = e.id
WHERE e.event_name = 'Dubai Agency FLY Jul''25'
  AND ts.is_active = TRUE
ORDER BY ts.from_datetime, ts.created_at;

COMMIT;

