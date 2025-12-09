-- Migrate existing activities to default groups
-- Creates Day 1, Day 2, etc. groups based on activity dates and assigns activities

DO $$
DECLARE
    event_record RECORD;
    activity_record RECORD;
    date_key DATE;
    day_number INT;
    new_group_id UUID;
    activity_dates DATE[];
    current_date DATE;
    new_group_name TEXT;
    date_index INT;
BEGIN
    -- Loop through all active events
    FOR event_record IN 
        SELECT id, event_name FROM app.events WHERE is_active = TRUE
    LOOP
        -- Get unique activity dates for this event, sorted
        SELECT ARRAY_AGG(DISTINCT DATE(from_datetime) ORDER BY DATE(from_datetime))
        INTO activity_dates
        FROM app.itinerary_activities
        WHERE event_id = event_record.id 
          AND is_active = TRUE
          AND group_id IS NULL;
        
        -- If no activities, skip
        IF activity_dates IS NULL OR array_length(activity_dates, 1) IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Create groups for each date (Day 1, Day 2, etc.)
        date_index := 1;
        FOREACH current_date IN ARRAY activity_dates
        LOOP
            day_number := date_index;
            new_group_name := 'Day ' || day_number::TEXT;
            date_index := date_index + 1;
            
            -- Check if group already exists
            SELECT id INTO new_group_id
            FROM app.itinerary_groups
            WHERE event_id = event_record.id 
              AND group_name = new_group_name
              AND is_active = TRUE
            LIMIT 1;
            
            -- Create group if it doesn't exist
            IF new_group_id IS NULL THEN
                INSERT INTO app.itinerary_groups 
                    (event_id, group_name, group_order, start_date, is_active)
                VALUES 
                    (event_record.id, new_group_name, day_number, current_date, TRUE)
                RETURNING id INTO new_group_id;
            END IF;
            
            -- Update activities for this date to use this group
            UPDATE app.itinerary_activities
            SET group_id = new_group_id
            WHERE event_id = event_record.id
              AND DATE(from_datetime) = current_date
              AND is_active = TRUE
              AND group_id IS NULL;
        END LOOP;
        
        RAISE NOTICE 'Migrated activities for event: %', event_record.event_name;
    END LOOP;
    
    RAISE NOTICE 'Migration completed';
END $$;

-- Verify migration
SELECT 
    e.event_name,
    COUNT(DISTINCT g.id) as groups_created,
    COUNT(DISTINCT a.id) as activities_assigned
FROM app.events e
LEFT JOIN app.itinerary_groups g ON g.event_id = e.id AND g.is_active = TRUE
LEFT JOIN app.itinerary_activities a ON a.group_id = g.id AND a.is_active = TRUE
WHERE e.is_active = TRUE
GROUP BY e.id, e.event_name
ORDER BY e.event_name;

