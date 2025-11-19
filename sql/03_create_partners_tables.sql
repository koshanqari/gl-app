-- Create Partners and Partner POCs tables
-- Set search path to 'app' schema
SET search_path TO app, public;

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  industry_type VARCHAR(100),
  company_size VARCHAR(50), -- Small/Medium/Large/Enterprise
  logo_url TEXT,
  website VARCHAR(255),
  
  -- Address Information
  address_lane VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  pincode VARCHAR(20),
  
  -- Tax Information
  tax_number VARCHAR(50),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE -- For soft delete
  
  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES executives(id)
);

-- Create partner_pocs table (Point of Contacts)
CREATE TABLE IF NOT EXISTS partner_pocs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  -- POC Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country_code VARCHAR(10) DEFAULT '+91',
  phone VARCHAR(15), -- digits only, no country code
  designation VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to partners table
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON partners
FOR EACH ROW
EXECUTE FUNCTION update_partners_updated_at();

-- Attach trigger to partner_pocs table
CREATE TRIGGER update_partner_pocs_updated_at
BEFORE UPDATE ON partner_pocs
FOR EACH ROW
EXECUTE FUNCTION update_partners_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON partners (is_active);
CREATE INDEX IF NOT EXISTS idx_partners_created_by ON partners (created_by);
CREATE INDEX IF NOT EXISTS idx_partners_company_name ON partners (company_name);
CREATE INDEX IF NOT EXISTS idx_partner_pocs_partner_id ON partner_pocs (partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_pocs_email ON partner_pocs (email);
CREATE INDEX IF NOT EXISTS idx_partner_pocs_is_primary ON partner_pocs (partner_id, is_primary) WHERE is_primary = true;

-- Add comments for documentation
COMMENT ON TABLE partners IS 'Partner companies and organizations';
COMMENT ON TABLE partner_pocs IS 'Points of contact for partner companies';
COMMENT ON COLUMN partners.company_name IS 'Company/Organization name';
COMMENT ON COLUMN partners.industry_type IS 'Industry category (e.g., Technology, Finance, Healthcare)';
COMMENT ON COLUMN partners.company_size IS 'Company size: Small/Medium/Large/Enterprise';
COMMENT ON COLUMN partners.tax_number IS 'Tax identification number (GST/VAT/TIN/EIN)';
COMMENT ON COLUMN partners.is_active IS 'For soft delete: true (active) or false (inactive)';
COMMENT ON COLUMN partners.created_by IS 'Executive who created this partner';
COMMENT ON COLUMN partner_pocs.is_primary IS 'Primary point of contact for the partner';
COMMENT ON COLUMN partner_pocs.country_code IS 'Country calling code (e.g., +91, +1)';
COMMENT ON COLUMN partner_pocs.phone IS 'Phone number without country code (digits only)';

-- Insert mock data for testing
WITH inserted_partners AS (
  INSERT INTO partners (company_name, address_lane, city, state, country, pincode, industry_type, company_size, website, tax_number, is_active, created_by) VALUES
  ('Tech Innovations Inc', '123 Silicon Valley Blvd', 'San Francisco', 'California', 'USA', '94105', 'Technology', 'Enterprise', 'https://techinnovations.com', '12-3456789', TRUE, (SELECT id FROM executives LIMIT 1)),
  ('Global Finance Corp', '456 Wall Street', 'New York', 'New York', 'USA', '10005', 'Finance', 'Large', 'https://globalfinance.com', '98-7654321', TRUE, (SELECT id FROM executives LIMIT 1)),
  ('Healthcare Solutions Ltd', '789 Medical Center Dr', 'Boston', 'Massachusetts', 'USA', '02115', 'Healthcare', 'Medium', 'https://healthcaresolutions.com', '11-2233445', TRUE, (SELECT id FROM executives LIMIT 1))
  RETURNING id, company_name
)
-- Insert POCs for the partners
INSERT INTO partner_pocs (partner_id, name, email, country_code, phone, designation, is_primary)
SELECT 
  id,
  CASE company_name
    WHEN 'Tech Innovations Inc' THEN 'John Doe'
    WHEN 'Global Finance Corp' THEN 'Michael Chen'
    WHEN 'Healthcare Solutions Ltd' THEN 'Sarah Williams'
  END,
  CASE company_name
    WHEN 'Tech Innovations Inc' THEN 'john.doe@techinnovations.com'
    WHEN 'Global Finance Corp' THEN 'm.chen@globalfinance.com'
    WHEN 'Healthcare Solutions Ltd' THEN 's.williams@healthcaresolutions.com'
  END,
  '+1',
  CASE company_name
    WHEN 'Tech Innovations Inc' THEN '4155550100'
    WHEN 'Global Finance Corp' THEN '2125550200'
    WHEN 'Healthcare Solutions Ltd' THEN '6175550300'
  END,
  CASE company_name
    WHEN 'Tech Innovations Inc' THEN 'Event Manager'
    WHEN 'Global Finance Corp' THEN 'Corporate Events Lead'
    WHEN 'Healthcare Solutions Ltd' THEN 'Operations Director'
  END,
  true
FROM inserted_partners;

-- Insert additional POCs for Tech Innovations Inc
INSERT INTO partner_pocs (partner_id, name, email, country_code, phone, designation, is_primary)
SELECT id, 'Jane Smith', 'jane.smith@techinnovations.com', '+1', '4155550101', 'HR Director', false
FROM partners WHERE company_name = 'Tech Innovations Inc';

-- Insert additional POCs for Healthcare Solutions Ltd
INSERT INTO partner_pocs (partner_id, name, email, country_code, phone, designation, is_primary)
SELECT id, 'David Brown', 'd.brown@healthcaresolutions.com', '+1', '6175550301', 'Event Coordinator', false
FROM partners WHERE company_name = 'Healthcare Solutions Ltd';

