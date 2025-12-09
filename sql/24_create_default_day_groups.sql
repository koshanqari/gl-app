-- Create default Day 1, Day 2, etc. groups for all events based on their date range
-- This ensures all events have groups even if they don't have activities yet

DO $$
DECLARE
    event_record RECORD;
    day_number INT;
    group_date DATE;
    group_exists BOOLEAN;
    event_start_date DATE;
    event_end_date DATE;
    days_diff INT;
BEGIN
    -- Loop through all active events
    FOR event_record IN 
        SELECT id, event_name, start_date, end_date 
        FROM app.events 
        WHERE is_active = TRUE
    LOOP
        event_start_date := event_record.start_date;
        event_end_date := COALESCE(event_record.end_date, event_record.start_date);
        
        -- If no dates, skip
        IF event_start_date IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Calculate number of days
        days_diff := (event_end_date - event_start_date)::INT + 1;
        
        -- Create groups for each day (Day 1, Day 2, etc.)
        FOR day_number IN 1..GREATEST(days_diff, 1)
        LOOP
            group_date := event_start_date + (day_number - 1) * INTERVAL '1 day';
            
            -- Check if group already exists
            SELECT EXISTS(
                SELECT 1 
                FROM app.itinerary_groups
                WHERE event_id = event_record.id 
                  AND group_name = 'Day ' || day_number::TEXT
                  AND is_active = TRUE
            ) INTO group_exists;
            
            -- Create group if it doesn't exist
            IF NOT group_exists THEN
                INSERT INTO app.itinerary_groups 
                    (event_id, group_name, group_order, start_date, is_active)
                VALUES 
                    (event_record.id, 'Day ' || day_number::TEXT, day_number, group_date, TRUE);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Created groups for event: %', event_record.event_name;
    END LOOP;
    
    RAISE NOTICE 'Default groups creation completed';
END $$;

-- Verify groups created
SELECT 
    e.event_name,
    COUNT(DISTINCT g.id) as total_groups,
    STRING_AGG(g.group_name, ', ' ORDER BY g.group_order) as groups
FROM app.events e
LEFT JOIN app.itinerary_groups g ON g.event_id = e.id AND g.is_active = TRUE
WHERE e.is_active = TRUE
GROUP BY e.id, e.event_name
ORDER BY e.event_name;

