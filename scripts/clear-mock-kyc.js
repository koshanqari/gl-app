// Clear mock KYC URLs from database
const { Pool } = require('pg');

const pool = new Pool({
  user: 'golden_lotus_owner',
  host: '35.154.169.194',
  database: 'golden_lotus',
  password: 'ui1RVc0JS640',
  port: 5432,
});

async function clearMockKYCData() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Clearing mock KYC URLs (example.com)...');
    
    const result = await client.query(`
      UPDATE app.members
      SET kyc_document_url = NULL
      WHERE kyc_document_url LIKE '%example.com%'
      RETURNING id, employee_id, name, kyc_document_type
    `);
    
    console.log(`✅ Cleared ${result.rowCount} mock KYC URLs`);
    
    if (result.rowCount > 0) {
      console.log('\nUpdated members:');
      result.rows.forEach(row => {
        console.log(`  - ${row.employee_id}: ${row.name} (${row.kyc_document_type || 'no type'})`);
      });
    }
    
    console.log('\n✅ Done! You can now upload real documents for these members.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

clearMockKYCData();

