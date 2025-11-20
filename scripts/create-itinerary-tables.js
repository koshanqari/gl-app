// Create itinerary tables
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

async function createItineraryTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating itinerary tables...');
    
    const sqlFile = path.join(__dirname, '../sql/10_create_itinerary_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Itinerary tables created successfully!');
    
    // Verify the tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'app' 
        AND table_name IN ('itinerary_activities', 'itinerary_links')
      ORDER BY table_name
    `);
    
    console.log(`\n✅ Found ${tablesResult.rowCount} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`  - app.${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Tables already exist, skipping creation.');
    } else {
      console.error('Full error:', error);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

createItineraryTables();

