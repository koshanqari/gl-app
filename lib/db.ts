import { Pool } from 'pg';

// Database connection configuration from environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return {
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0].now,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Database connection failed',
      error: error.message,
    };
  }
}

// Export the pool for use in other modules
export default pool;

