-- Create room_assignments table
CREATE TABLE IF NOT EXISTS app.room_assignments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES app.members(id) ON DELETE CASCADE,
  
  -- Room Details
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(50),  -- Single, Double, Triple, Suite, Other
  
  -- Special Requests
  special_requests TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'assigned',  -- assigned, unassigned
  
  -- Soft Delete
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES app.executives(id)
);

-- One member can only have one active room assignment per event (partial unique index)
CREATE UNIQUE INDEX unique_member_room_per_event ON app.room_assignments(event_id, member_id) WHERE is_active = TRUE;

-- Indexes for better performance
CREATE INDEX idx_room_assignments_event_id ON app.room_assignments(event_id);
CREATE INDEX idx_room_assignments_member_id ON app.room_assignments(member_id);
CREATE INDEX idx_room_assignments_room_number ON app.room_assignments(event_id, room_number);
CREATE INDEX idx_room_assignments_is_active ON app.room_assignments(is_active);

-- Insert mock room assignments for Annual Tech Summit 2024
-- Demonstrating automatic sharing: Multiple members in same room
-- Only 5 members exist: EMP001-EMP005
INSERT INTO app.room_assignments (event_id, member_id, room_number, room_type, special_requests, status, created_by)
VALUES
-- Room 205: Alice and Bob sharing (Double room)
(
  (SELECT id FROM app.events WHERE event_name = 'Annual Tech Summit 2024'),
  (SELECT id FROM app.members WHERE employee_id = 'EMP001'),  -- Alice Johnson
  '205',
  'Double',
  'High floor preferred',
  'assigned',
  (SELECT id FROM app.executives WHERE email = 'mailtoqari@gmail.com')
),
(
  (SELECT id FROM app.events WHERE event_name = 'Annual Tech Summit 2024'),
  (SELECT id FROM app.members WHERE employee_id = 'EMP002'),  -- Bob Smith
  '205',
  'Double',
  NULL,
  'assigned',
  (SELECT id FROM app.executives WHERE email = 'mailtoqari@gmail.com')
),

-- Room 308: Carol and David sharing (Double room)
(
  (SELECT id FROM app.events WHERE event_name = 'Annual Tech Summit 2024'),
  (SELECT id FROM app.members WHERE employee_id = 'EMP003'),  -- Carol White
  '308',
  'Double',
  'Near elevator',
  'assigned',
  (SELECT id FROM app.executives WHERE email = 'mailtoqari@gmail.com')
),
(
  (SELECT id FROM app.events WHERE event_name = 'Annual Tech Summit 2024'),
  (SELECT id FROM app.members WHERE employee_id = 'EMP004'),  -- David Brown
  '308',
  'Double',
  NULL,
  'assigned',
  (SELECT id FROM app.executives WHERE email = 'mailtoqari@gmail.com')
);

-- Member without room assignment: Emma Davis (EMP005)

-- Verify insertion with automatic sharing computation
SELECT 
  e.event_name,
  m.employee_id,
  m.name,
  ra.room_number,
  ra.room_type,
  -- Count roommates (including self)
  (SELECT COUNT(*) 
   FROM app.room_assignments ra2 
   WHERE ra2.event_id = ra.event_id 
     AND ra2.room_number = ra.room_number 
     AND ra2.is_active = TRUE
  ) as total_in_room,
  -- Get roommate names (excluding self)
  (SELECT STRING_AGG(m2.name, ', ')
   FROM app.room_assignments ra2
   JOIN app.members m2 ON ra2.member_id = m2.id
   WHERE ra2.event_id = ra.event_id
     AND ra2.room_number = ra.room_number
     AND ra2.member_id != ra.member_id
     AND ra2.is_active = TRUE
  ) as sharing_with
FROM app.room_assignments ra
JOIN app.members m ON ra.member_id = m.id
JOIN app.events e ON ra.event_id = e.id
WHERE ra.is_active = TRUE
ORDER BY ra.room_number, m.employee_id;

