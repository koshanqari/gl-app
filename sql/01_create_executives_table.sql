-- Create executives table in app schema
CREATE TABLE IF NOT EXISTS app.executives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_executives_email ON app.executives(email);

-- Enable pgcrypto extension for password hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert mock data with hashed password "intellsys"
INSERT INTO app.executives (email, name, phone, password_hash) VALUES
    ('executive@goldenlotus.com', 'John Executive', '+1234567890', crypt('intellsys', gen_salt('bf'))),
    ('admin@goldenlotus.com', 'Sarah Admin', '+1234567891', crypt('intellsys', gen_salt('bf'))),
    ('ceo@goldenlotus.com', 'Michael Chen', '+1234567892', crypt('intellsys', gen_salt('bf')))
ON CONFLICT (email) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_executives_updated_at ON app.executives;
CREATE TRIGGER update_executives_updated_at
    BEFORE UPDATE ON app.executives
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

