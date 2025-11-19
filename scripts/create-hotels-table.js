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

async function createHotelsTable() {
  const client = await pool.connect();
  try {
    console.log('\n🏨 Creating hotels tables...\n');
    
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../sql/06_create_hotels_table.sql')
    ).toString();
    
    await client.query(sql);
    
    console.log('✅ Hotels tables created successfully!');
    console.log('✅ Hotel POCs table created!');
    console.log('✅ Hotel services table created!');
    console.log('✅ Mock data inserted!\n');
    
  } catch (error) {
    console.error('❌ Error creating hotels tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createHotelsTable();

