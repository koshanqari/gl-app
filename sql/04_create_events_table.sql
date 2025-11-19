-- Create events table
CREATE TABLE IF NOT EXISTS app.events (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  partner_id UUID NOT NULL REFERENCES app.partners(id) ON DELETE CASCADE,
  
  -- Event Details
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),  -- Conference/Meeting/Exhibition/Incentive
  description TEXT,
  logo_url VARCHAR(500),
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Soft Delete
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES app.executives(id)
);

-- Indexes for better performance
CREATE INDEX idx_events_partner_id ON app.events(partner_id);
CREATE INDEX idx_events_is_active ON app.events(is_active);
CREATE INDEX idx_events_start_date ON app.events(start_date);

-- Insert mock data (using existing partner IDs from database)
-- First, get some partner IDs
DO $$
DECLARE
  partner1_id UUID;
  partner2_id UUID;
  partner3_id UUID;
  exec_id UUID;
BEGIN
  -- Get first 3 partner IDs
  SELECT id INTO partner1_id FROM app.partners WHERE is_active = TRUE ORDER BY created_at LIMIT 1;
  SELECT id INTO partner2_id FROM app.partners WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO partner3_id FROM app.partners WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 2;
  
  -- Get first executive ID for created_by
  SELECT id INTO exec_id FROM app.executives LIMIT 1;

  -- Insert events for partner 1 (if exists)
  IF partner1_id IS NOT NULL THEN
    INSERT INTO app.events (partner_id, event_name, event_type, description, start_date, end_date, created_by) VALUES
    (partner1_id, 'Annual Tech Summit 2024', 'Conference', 'A flagship technology conference bringing together industry leaders and innovators.', '2024-06-15', '2024-06-17', exec_id),
    (partner1_id, 'Product Launch Gala', 'Corporate Event', 'Exclusive product launch event for major stakeholders and media.', '2024-05-10', '2024-05-10', exec_id),
    (partner1_id, 'Q2 Team Building Retreat', 'Incentive', 'Team building activities and workshops for department heads.', '2024-04-20', '2024-04-22', exec_id);
  END IF;

  -- Insert events for partner 2 (if exists)
  IF partner2_id IS NOT NULL THEN
    INSERT INTO app.events (partner_id, event_name, event_type, description, start_date, end_date, created_by) VALUES
    (partner2_id, 'Global Finance Forum', 'Conference', 'International forum discussing global financial trends and opportunities.', '2024-07-10', '2024-07-12', exec_id),
    (partner2_id, 'Executive Leadership Retreat', 'Incentive', 'Strategic planning and leadership development for C-suite executives.', '2024-08-05', '2024-08-07', exec_id);
  END IF;

  -- Insert events for partner 3 (if exists)
  IF partner3_id IS NOT NULL THEN
    INSERT INTO app.events (partner_id, event_name, event_type, description, start_date, end_date, created_by) VALUES
    (partner3_id, 'Healthcare Innovation Summit', 'Conference', 'Exploring cutting-edge healthcare technologies and practices.', '2024-09-20', '2024-09-22', exec_id),
    (partner3_id, 'Annual Medical Conference', 'Conference', 'Comprehensive medical conference with expert speakers and workshops.', '2024-10-15', '2024-10-17', exec_id);
  END IF;
END $$;

-- Verify the data
SELECT 
  e.id,
  e.event_name,
  e.event_type,
  p.company_name as partner_name,
  e.start_date,
  e.end_date
FROM app.events e
JOIN app.partners p ON e.partner_id = p.id
WHERE e.is_active = TRUE
ORDER BY p.company_name, e.start_date;

