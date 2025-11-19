-- Create members table
CREATE TABLE IF NOT EXISTS app.members (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
  
  -- Basic Information
  employee_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  -- Phone (standardized with country code)
  country_code VARCHAR(10) DEFAULT '+91' NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- KYC Information
  kyc_document_type VARCHAR(50),  -- aadhaar, pan, passport, driving_license, voter_id, other
  kyc_document_number VARCHAR(100),
  kyc_document_url VARCHAR(500),
  
  -- Soft Delete
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_members_event_id ON app.members(event_id);
CREATE INDEX idx_members_employee_id ON app.members(employee_id);
CREATE INDEX idx_members_is_active ON app.members(is_active);
CREATE INDEX idx_members_email ON app.members(email);

-- Unique constraint: one employee_id per event
CREATE UNIQUE INDEX idx_members_event_employee ON app.members(event_id, employee_id) WHERE is_active = TRUE;

-- Insert mock data for existing events
DO $$
DECLARE
  event1_id UUID;
  event2_id UUID;
  event3_id UUID;
BEGIN
  -- Get first 3 event IDs
  SELECT id INTO event1_id FROM app.events WHERE is_active = TRUE ORDER BY created_at LIMIT 1;
  SELECT id INTO event2_id FROM app.events WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO event3_id FROM app.events WHERE is_active = TRUE ORDER BY created_at LIMIT 1 OFFSET 2;

  -- Insert members for event 1 (if exists)
  IF event1_id IS NOT NULL THEN
    INSERT INTO app.members (event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url) VALUES
    (event1_id, 'EMP001', 'Alice Johnson', 'alice.johnson@company.com', '+91', '9876543210', 'aadhaar', '1234-5678-9012', 'https://example.com/documents/alice_aadhaar.pdf'),
    (event1_id, 'EMP002', 'Bob Smith', 'bob.smith@company.com', '+91', '9876543211', 'pan', 'ABCDE1234F', 'https://example.com/documents/bob_pan.pdf'),
    (event1_id, 'EMP003', 'Carol White', 'carol.white@company.com', '+91', '9876543212', 'passport', 'P1234567', 'https://example.com/documents/carol_passport.pdf'),
    (event1_id, 'EMP004', 'David Brown', 'david.brown@company.com', '+91', '9876543213', 'aadhaar', '2345-6789-0123', 'https://example.com/documents/david_aadhaar.pdf'),
    (event1_id, 'EMP005', 'Emma Davis', 'emma.davis@company.com', '+91', '9876543214', NULL, NULL, NULL);
  END IF;

  -- Insert members for event 2 (if exists)
  IF event2_id IS NOT NULL THEN
    INSERT INTO app.members (event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url) VALUES
    (event2_id, 'EMP101', 'Frank Wilson', 'frank.wilson@company.com', '+91', '9876543220', 'pan', 'FGHIJ5678K', 'https://example.com/documents/frank_pan.pdf'),
    (event2_id, 'EMP102', 'Grace Lee', 'grace.lee@company.com', '+91', '9876543221', 'aadhaar', '3456-7890-1234', 'https://example.com/documents/grace_aadhaar.pdf'),
    (event2_id, 'EMP103', 'Henry Taylor', 'henry.taylor@company.com', '+91', '9876543222', 'driving_license', 'DL123456789', NULL);
  END IF;

  -- Insert members for event 3 (if exists)
  IF event3_id IS NOT NULL THEN
    INSERT INTO app.members (event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url) VALUES
    (event3_id, 'EMP201', 'Isabel Martinez', 'isabel.martinez@company.com', '+91', '9876543230', 'passport', 'P2345678', 'https://example.com/documents/isabel_passport.pdf'),
    (event3_id, 'EMP202', 'Jack Anderson', 'jack.anderson@company.com', '+91', '9876543231', 'aadhaar', '4567-8901-2345', 'https://example.com/documents/jack_aadhaar.pdf'),
    (event3_id, 'EMP203', 'Karen Thomas', 'karen.thomas@company.com', '+91', '9876543232', NULL, NULL, NULL),
    (event3_id, 'EMP204', 'Luke Jackson', 'luke.jackson@company.com', '+91', '9876543233', 'voter_id', 'VOTER123456', NULL);
  END IF;
END $$;

-- Verify the data
SELECT 
  m.id,
  m.employee_id,
  m.name,
  m.email,
  m.country_code,
  m.phone,
  m.kyc_document_type,
  e.event_name,
  p.company_name as partner_name
FROM app.members m
JOIN app.events e ON m.event_id = e.id
JOIN app.partners p ON e.partner_id = p.id
WHERE m.is_active = TRUE
ORDER BY e.event_name, m.employee_id;

