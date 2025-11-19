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

async function createRoomAssignmentsTable() {
  const client = await pool.connect();
  try {
    console.log('\n🛏️  Creating room_assignments table...\n');
    
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../sql/07_create_room_assignments_table.sql')
    ).toString();
    
    await client.query(sql);
    
    console.log('✅ Room assignments table created successfully!');
    console.log('✅ Mock data inserted with automatic sharing!\n');
    
    console.log('📊 Automatic "Sharing With" Demo:');
    console.log('   - Room 205: Alice (EMP001) + Bob (EMP002) - sharing automatically computed!');
    console.log('   - Room 308: Carol (EMP003) + David (EMP004) - sharing automatically computed!');
    console.log('   - Unassigned: Emma Davis (EMP005)\n');
    console.log('💡 Key Feature: Assign same room number → sharing_with computed automatically!');
    
  } catch (error) {
    console.error('❌ Error creating room_assignments table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createRoomAssignmentsTable();

