-- Enable pgcrypto extension for password hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create collaborators table
CREATE TABLE IF NOT EXISTS app.collaborators (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  organization VARCHAR(255) NOT NULL,
  
  -- Permissions (stored as JSONB for flexibility)
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Soft Delete
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_collaborators_event_id ON app.collaborators(event_id);
CREATE INDEX idx_collaborators_email ON app.collaborators(email);
CREATE INDEX idx_collaborators_is_active ON app.collaborators(is_active);

-- Unique constraint: one email per event
CREATE UNIQUE INDEX idx_collaborators_event_email ON app.collaborators(event_id, email) WHERE is_active = TRUE;

-- Insert mock data for existing events
DO $$
DECLARE
  event1_id UUID;
  event2_id UUID;
BEGIN
  -- Get first 2 event IDs
  SELECT id INTO event1_id FROM app.events WHERE is_active = TRUE ORDER BY created_at LIMIT 1;
  SELECT id INTO event2_id FROM app.events WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 1;

  -- Insert collaborators for event 1 (if exists)
  IF event1_id IS NOT NULL THEN
    INSERT INTO app.collaborators (event_id, name, email, password_hash, organization, permissions) VALUES
    (
      event1_id,
      'Hotel Manager',
      'manager@grandplaza.com',
      crypt('hotel123', gen_salt('bf')),
      'Grand Plaza Hotel',
      '{"overview": false, "members": false, "stay": true, "crew": false, "itinerary": false, "travel": false, "meals": false, "event_profile": false}'::jsonb
    ),
    (
      event1_id,
      'HR Coordinator',
      'hr@company.com',
      crypt('hr2024', gen_salt('bf')),
      'HR Department',
      '{"overview": true, "members": true, "stay": false, "crew": false, "itinerary": false, "travel": false, "meals": false, "event_profile": false}'::jsonb
    );
  END IF;

  -- Insert collaborators for event 2 (if exists)
  IF event2_id IS NOT NULL THEN
    INSERT INTO app.collaborators (event_id, name, email, password_hash, organization, permissions) VALUES
    (
      event2_id,
      'Catering Manager',
      'catering@foodservice.com',
      crypt('cater123', gen_salt('bf')),
      'Food Service Inc',
      '{"overview": false, "members": false, "stay": false, "crew": false, "itinerary": true, "travel": false, "meals": true, "event_profile": false}'::jsonb
    );
  END IF;
END $$;

-- Verify the data
SELECT 
  c.id,
  c.name,
  c.email,
  c.organization,
  e.event_name,
  p.company_name as partner_name
FROM app.collaborators c
JOIN app.events e ON c.event_id = e.id
JOIN app.partners p ON e.partner_id = p.id
WHERE c.is_active = TRUE
ORDER BY e.event_name, c.name;

