// Create OTP table
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'golden_lotus_owner',
  password: 'ui1RVc0JS640',
  host: '35.154.169.194',
  port: 5432,
  database: 'golden_lotus',
});

async function createOTPTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating OTP table...');
    
    const sqlFile = path.join(__dirname, '../sql/11_create_otp_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ OTP table created successfully!');
    
    // Verify the table
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'app' 
        AND table_name = 'otps'
    `);
    
    if (tablesResult.rowCount > 0) {
      console.log(`\n✅ Found table: app.otps`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Table already exists, skipping creation.');
    } else {
      console.error('Full error:', error);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

createOTPTable();

