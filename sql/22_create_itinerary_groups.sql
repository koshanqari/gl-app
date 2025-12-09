-- Create itinerary_groups table and update itinerary_activities

-- 1. Create itinerary_groups table
CREATE TABLE IF NOT EXISTS app.itinerary_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
    group_name VARCHAR(255) NOT NULL,
    group_order INT NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES app.executives(id),
    
    CONSTRAINT unique_event_group_order UNIQUE (event_id, group_order)
);

-- Add comment
COMMENT ON TABLE app.itinerary_groups IS 'Groups for organizing itinerary activities (e.g., Day 1, Day 2, Pre-Event, Post Event)';

-- 2. Add group_id to itinerary_activities
ALTER TABLE app.itinerary_activities
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES app.itinerary_groups(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_group_id ON app.itinerary_activities(group_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_groups_event_id ON app.itinerary_groups(event_id);

-- 3. Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION app.update_itinerary_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_itinerary_groups_updated_at ON app.itinerary_groups;
CREATE TRIGGER trigger_update_itinerary_groups_updated_at
    BEFORE UPDATE ON app.itinerary_groups
    FOR EACH ROW
    EXECUTE FUNCTION app.update_itinerary_groups_updated_at();

-- Verify
SELECT 'itinerary_groups table created' as status;
SELECT 'group_id column added to itinerary_activities' as status;

