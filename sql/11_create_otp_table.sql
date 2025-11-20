-- Create OTP table for temporary OTP storage
CREATE TABLE IF NOT EXISTS app.otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_otps_email ON app.otps(email);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON app.otps(expires_at);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION app.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM app.otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

