import pool from '@/lib/db';

// OTP expiration time: 10 minutes
const OTP_EXPIRY_MINUTES = 10;
// Max attempts: 5
const MAX_ATTEMPTS = 5;
// Resend cooldown: 2 minutes
const RESEND_COOLDOWN_MINUTES = 2;

/**
 * Normalize email address (lowercase and trim)
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP for an email in database
 */
export async function storeOTP(email: string, otp: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  const client = await pool.connect();
  
  try {
    // Delete any existing OTP for this email
    await client.query(
      'DELETE FROM app.otps WHERE email = $1',
      [normalizedEmail]
    );

    // Insert new OTP
    const insertResult = await client.query(
      `INSERT INTO app.otps (email, otp, expires_at, attempts)
       VALUES ($1, $2, NOW() + INTERVAL '${OTP_EXPIRY_MINUTES} minutes', 0)
       RETURNING expires_at`,
      [normalizedEmail, otp]
    );

    const expiresAt = insertResult.rows[0].expires_at;
    console.log('[OTP] Stored OTP for:', normalizedEmail, 'Expires at:', expiresAt);
  } catch (error) {
    console.error('[OTP] Error storing OTP:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Verify OTP for an email from database
 */
export async function verifyOTP(email: string, otp: string): Promise<{ valid: boolean; message?: string }> {
  const normalizedEmail = normalizeEmail(email);
  const client = await pool.connect();

  try {
    // Get the OTP record and check expiration in the same query using PostgreSQL NOW()
    // Using TIMESTAMPTZ ensures proper timezone handling
    const result = await client.query(
      `SELECT otp, expires_at, attempts, 
              CASE WHEN expires_at < NOW() THEN true ELSE false END as is_expired
       FROM app.otps WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      console.log('[OTP] OTP not found for:', normalizedEmail);
      return { valid: false, message: 'OTP not found. Please request a new OTP.' };
    }

    const stored = result.rows[0];

    // Check if expired (using database comparison)
    if (stored.is_expired) {
      await client.query('DELETE FROM app.otps WHERE email = $1', [normalizedEmail]);
      const now = await client.query('SELECT NOW() as current_time');
      console.log('[OTP] OTP expired for:', normalizedEmail);
      console.log('[OTP] Expires at:', stored.expires_at);
      console.log('[OTP] Current time:', now.rows[0].current_time);
      return { valid: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    console.log('[OTP] OTP not expired. Expires at:', stored.expires_at);

    // Check attempts
    if (stored.attempts >= MAX_ATTEMPTS) {
      await client.query('DELETE FROM app.otps WHERE email = $1', [normalizedEmail]);
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Verify OTP
    if (stored.otp !== otp) {
      // Increment attempts
      await client.query(
        'UPDATE app.otps SET attempts = attempts + 1 WHERE email = $1',
        [normalizedEmail]
      );
      const remainingAttempts = MAX_ATTEMPTS - stored.attempts - 1;
      return { valid: false, message: `Invalid OTP. ${remainingAttempts} attempts remaining.` };
    }

    // OTP is valid, delete it
    await client.query('DELETE FROM app.otps WHERE email = $1', [normalizedEmail]);
    console.log('[OTP] OTP verified successfully for:', normalizedEmail);
    return { valid: true };
  } catch (error) {
    console.error('[OTP] Error verifying OTP:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if OTP can be resent (cooldown period)
 */
export async function canResendOTP(email: string): Promise<{ canResend: boolean; remainingSeconds?: number }> {
  const normalizedEmail = normalizeEmail(email);
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT created_at FROM app.otps WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return { canResend: true };
    }

    const createdAt = new Date(result.rows[0].created_at);
    const now = new Date();
    const timeSinceCreation = (now.getTime() - createdAt.getTime()) / 1000; // seconds
    const remainingCooldown = RESEND_COOLDOWN_MINUTES * 60 - timeSinceCreation;

    if (remainingCooldown > 0) {
      return {
        canResend: false,
        remainingSeconds: Math.ceil(remainingCooldown),
      };
    }

    return { canResend: true };
  } catch (error) {
    console.error('[OTP] Error checking resend:', error);
    return { canResend: true }; // Allow resend on error
  } finally {
    client.release();
  }
}

/**
 * Clean up expired OTPs from database
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT app.cleanup_expired_otps()');
  } catch (error) {
    console.error('[OTP] Error cleaning up expired OTPs:', error);
    // Fallback: manual cleanup if function doesn't exist
    try {
      await client.query('DELETE FROM app.otps WHERE expires_at < NOW()');
    } catch (fallbackError) {
      console.error('[OTP] Error in fallback cleanup:', fallbackError);
    }
  } finally {
    client.release();
  }
}
