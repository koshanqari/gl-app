-- Create travel_schedules table
CREATE TABLE IF NOT EXISTS app.travel_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  from_datetime TIMESTAMP NOT NULL,
  to_datetime TIMESTAMP,
  pickup_location VARCHAR(500),
  dropoff_location VARCHAR(500),
  vehicle_type VARCHAR(100),  -- Cab, Bus, Car, etc.
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES app.executives(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create travel_rsvps table to track member responses
CREATE TABLE IF NOT EXISTS app.travel_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_schedule_id UUID NOT NULL REFERENCES app.travel_schedules(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES app.members(id) ON DELETE CASCADE,
  response VARCHAR(10) NOT NULL CHECK (response IN ('yes', 'no', 'pending')),  -- yes, no, or pending (default)
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(travel_schedule_id, member_id)  -- One RSVP per member per schedule
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_travel_schedules_event_id ON app.travel_schedules(event_id);
CREATE INDEX IF NOT EXISTS idx_travel_schedules_from_datetime ON app.travel_schedules(from_datetime);
CREATE INDEX IF NOT EXISTS idx_travel_rsvps_schedule_id ON app.travel_rsvps(travel_schedule_id);
CREATE INDEX IF NOT EXISTS idx_travel_rsvps_member_id ON app.travel_rsvps(member_id);
CREATE INDEX IF NOT EXISTS idx_travel_rsvps_response ON app.travel_rsvps(response);

-- Add comments
COMMENT ON TABLE app.travel_schedules IS 'Stores travel schedules (cabs, buses, etc.) for events';
COMMENT ON TABLE app.travel_rsvps IS 'Stores member RSVP responses for travel schedules';


