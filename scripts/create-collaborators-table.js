// Create collaborators table
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'golden_lotus_owner',
  host: '35.154.169.194',
  database: 'golden_lotus',
  password: 'ui1RVc0JS640',
  port: 5432,
});

async function createCollaboratorsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating collaborators table...');
    
    const sqlFile = path.join(__dirname, '../sql/09_create_collaborators_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Collaborators table created successfully!');
    
    // Verify the data
    const result = await client.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.organization,
        e.event_name,
        p.company_name as partner_name
      FROM app.collaborators c
      JOIN app.events e ON c.event_id = e.id
      JOIN app.partners p ON e.partner_id = p.id
      WHERE c.is_active = TRUE
      ORDER BY e.event_name, c.name
    `);
    
    console.log(`\n✅ Found ${result.rowCount} collaborators:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.email}) - ${row.organization} - Event: ${row.event_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Table already exists, skipping creation.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

createCollaboratorsTable();

