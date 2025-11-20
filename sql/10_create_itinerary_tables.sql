-- Create itinerary_activities table
CREATE TABLE IF NOT EXISTS app.itinerary_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  from_datetime TIMESTAMP NOT NULL,
  to_datetime TIMESTAMP,
  venue VARCHAR(500),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES app.executives(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create itinerary_links table for multiple links per activity
CREATE TABLE IF NOT EXISTS app.itinerary_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES app.itinerary_activities(id) ON DELETE CASCADE,
  link_text VARCHAR(255) NOT NULL,
  link_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_event_id ON app.itinerary_activities(event_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_from_datetime ON app.itinerary_activities(from_datetime);
CREATE INDEX IF NOT EXISTS idx_itinerary_links_activity_id ON app.itinerary_links(activity_id);

-- Add comments
COMMENT ON TABLE app.itinerary_activities IS 'Stores itinerary activities for events';
COMMENT ON TABLE app.itinerary_links IS 'Stores multiple links for each itinerary activity';

