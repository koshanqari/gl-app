-- Update partners table to use is_active instead of status
-- Set search path to 'app' schema
SET search_path TO app, public;

-- Drop the status column and add is_active
ALTER TABLE partners DROP COLUMN IF EXISTS status;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing data (if any had status = 'inactive', set is_active = false)
-- UPDATE partners SET is_active = (status = 'active');

-- Update the index
DROP INDEX IF EXISTS idx_partners_status;
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON partners (is_active);

-- Update comment
COMMENT ON COLUMN partners.is_active IS 'For soft delete: true (active) or false (inactive)';

