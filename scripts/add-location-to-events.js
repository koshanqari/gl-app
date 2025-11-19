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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add location to events...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../sql/08_add_location_to_events.sql'),
      'utf8'
    );
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

