-- Migration: Add country_code field and update phone field
-- Set search path to 'app' schema
SET search_path TO app, public;

-- First, backup existing phone data to a temp column
ALTER TABLE executives ADD COLUMN IF NOT EXISTS phone_backup VARCHAR(20);
UPDATE executives SET phone_backup = phone WHERE phone IS NOT NULL;

-- Add country_code column
ALTER TABLE executives 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+91';

-- Extract country code from existing phone data
UPDATE executives
SET country_code = CASE 
    WHEN phone_backup ~ '^\+\d{1,4}' THEN substring(phone_backup from '^\+\d{1,4}')
    ELSE '+91'
  END
WHERE phone_backup IS NOT NULL AND phone_backup != '';

-- Update phone column to contain only digits (no country code)
UPDATE executives
SET phone = CASE
    WHEN phone_backup ~ '^\+\d{1,4}' THEN regexp_replace(substring(phone_backup from '\+\d{1,4}(.*)'), '[^0-9]', '', 'g')
    ELSE regexp_replace(phone_backup, '[^0-9]', '', 'g')
  END
WHERE phone_backup IS NOT NULL AND phone_backup != '';

-- Drop the backup column
ALTER TABLE executives DROP COLUMN IF EXISTS phone_backup;

-- Add comments
COMMENT ON COLUMN executives.country_code IS 'Country calling code (e.g., +91, +1)';
COMMENT ON COLUMN executives.phone IS 'Phone number without country code (digits only)';

