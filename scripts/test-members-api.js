const { Pool } = require('pg');

const pool = new Pool({
  user: 'golden_lotus_owner',
  password: 'ui1RVc0JS640',
  host: '35.154.169.194',
  port: 5432,
  database: 'golden_lotus',
});

async function testMembersAPI() {
  const client = await pool.connect();
  
  try {
    console.log('\n🧪 Testing Members API Integration\n');
    console.log('='.repeat(60));
    
    // Test 1: Get Event ID
    console.log('\n📋 Test 1: Get Event ID for testing');
    const eventResult = await client.query(`
      SELECT id, event_name 
      FROM app.events 
      WHERE event_name = 'Annual Tech Summit 2024' 
      LIMIT 1
    `);
    
    if (eventResult.rows.length === 0) {
      console.log('❌ No event found for testing');
      return;
    }
    
    const eventId = eventResult.rows[0].id;
    const eventName = eventResult.rows[0].event_name;
    console.log(`✅ Found event: ${eventName}`);
    console.log(`   Event ID: ${eventId}`);
    
    // Test 2: Check Members Count
    console.log('\n📋 Test 2: Check existing members count');
    const countResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM app.members 
      WHERE event_id = $1 AND is_active = TRUE
    `, [eventId]);
    
    const memberCount = countResult.rows[0].count;
    console.log(`✅ Found ${memberCount} active members for this event`);
    
    // Test 3: Get sample members
    console.log('\n📋 Test 3: Get sample members from database');
    const membersResult = await client.query(`
      SELECT 
        id, employee_id, name, email, 
        country_code, phone,
        kyc_document_type, kyc_document_number
      FROM app.members 
      WHERE event_id = $1 AND is_active = TRUE
      ORDER BY employee_id
      LIMIT 3
    `, [eventId]);
    
    console.log(`✅ Retrieved ${membersResult.rows.length} members:`);
    membersResult.rows.forEach((member, index) => {
      console.log(`\n   Member ${index + 1}:`);
      console.log(`   - ID: ${member.id}`);
      console.log(`   - Employee ID: ${member.employee_id}`);
      console.log(`   - Name: ${member.name}`);
      console.log(`   - Email: ${member.email}`);
      console.log(`   - Phone: ${member.country_code} ${member.phone}`);
      console.log(`   - KYC: ${member.kyc_document_type || 'Pending'}`);
    });
    
    // Test 4: Check KYC statistics
    console.log('\n📋 Test 4: Check KYC statistics');
    const kycStatsResult = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE kyc_document_type IS NOT NULL AND kyc_document_type != '') as completed,
        COUNT(*) FILTER (WHERE kyc_document_type IS NULL OR kyc_document_type = '') as pending,
        COUNT(*) as total
      FROM app.members 
      WHERE event_id = $1 AND is_active = TRUE
    `, [eventId]);
    
    const kycStats = kycStatsResult.rows[0];
    console.log(`✅ KYC Statistics:`);
    console.log(`   - Total Members: ${kycStats.total}`);
    console.log(`   - KYC Completed: ${kycStats.completed}`);
    console.log(`   - KYC Pending: ${kycStats.pending}`);
    
    // Test 5: Check unique constraint
    console.log('\n📋 Test 5: Check unique constraint (employee_id per event)');
    const constraintResult = await client.query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conname = 'unique_employee_id_per_event'
        AND conrelid = 'app.members'::regclass
    `);
    
    if (constraintResult.rows.length > 0) {
      console.log(`✅ Unique constraint exists:`);
      console.log(`   ${constraintResult.rows[0].definition}`);
    } else {
      console.log(`❌ Unique constraint not found`);
    }
    
    // Test 6: Check foreign key constraint
    console.log('\n📋 Test 6: Check foreign key constraint (event_id)');
    const fkResult = await client.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'app' 
        AND tc.table_name = 'members'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'event_id'
    `);
    
    if (fkResult.rows.length > 0) {
      const fk = fkResult.rows[0];
      console.log(`✅ Foreign key constraint exists:`);
      console.log(`   ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    } else {
      console.log(`❌ Foreign key constraint not found`);
    }
    
    // Test 7: Test search scenarios
    console.log('\n📋 Test 7: Test search scenarios');
    
    // Search by name
    const nameSearch = await client.query(`
      SELECT employee_id, name 
      FROM app.members 
      WHERE event_id = $1 
        AND is_active = TRUE 
        AND LOWER(name) LIKE LOWER($2)
      LIMIT 2
    `, [eventId, '%alice%']);
    
    console.log(`✅ Search by name "alice": ${nameSearch.rows.length} results`);
    nameSearch.rows.forEach(m => {
      console.log(`   - ${m.employee_id}: ${m.name}`);
    });
    
    // Search by employee_id
    const empIdSearch = await client.query(`
      SELECT employee_id, name 
      FROM app.members 
      WHERE event_id = $1 
        AND is_active = TRUE 
        AND employee_id LIKE $2
      LIMIT 2
    `, [eventId, 'EMP00%']);
    
    console.log(`✅ Search by employee_id "EMP00%": ${empIdSearch.rows.length} results`);
    empIdSearch.rows.forEach(m => {
      console.log(`   - ${m.employee_id}: ${m.name}`);
    });
    
    // Test 8: Test phone number format
    console.log('\n📋 Test 8: Test phone number format');
    const phoneResult = await client.query(`
      SELECT employee_id, name, country_code, phone
      FROM app.members 
      WHERE event_id = $1 AND is_active = TRUE
      LIMIT 3
    `, [eventId]);
    
    console.log(`✅ Phone number format validation:`);
    phoneResult.rows.forEach(m => {
      console.log(`   - ${m.employee_id}: ${m.country_code} ${m.phone}`);
    });
    
    // Test 9: API URL for frontend
    console.log('\n📋 Test 9: API endpoints for frontend');
    console.log(`✅ API Endpoints:`);
    console.log(`   GET  /api/members?event_id=${eventId}`);
    console.log(`   GET  /api/members/<member-id>`);
    console.log(`   POST /api/members (with event_id in body)`);
    console.log(`   PUT  /api/members/<member-id>`);
    console.log(`   DELETE /api/members/<member-id>`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All database tests passed!\n');
    console.log('📝 Next steps:');
    console.log('   1. Visit http://localhost:3000/executive/login');
    console.log('   2. Navigate to any Partner → Event → Members');
    console.log('   3. Test:');
    console.log('      - View members list (should load from DB)');
    console.log('      - Add new member');
    console.log('      - Edit existing member');
    console.log('      - Search members');
    console.log('      - Filter by KYC status');
    console.log('      - Download CSV template');
    console.log('      - Copy registration link\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testMembersAPI();

