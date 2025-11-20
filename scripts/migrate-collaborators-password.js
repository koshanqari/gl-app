// Migrate collaborators table to use password_hash
const { Pool } = require('pg');

const pool = new Pool({
  user: 'golden_lotus_owner',
  host: '35.154.169.194',
  database: 'golden_lotus',
  password: 'ui1RVc0JS640',
  port: 5432,
});

async function migrateCollaboratorsPassword() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Migrating collaborators to use password_hash...');
    
    // Check if password column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'app' 
        AND table_name = 'collaborators' 
        AND column_name = 'password'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('⚠️  Found password column. Migrating to password_hash...');
      
      // Enable pgcrypto if not already enabled
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
      
      // Add password_hash column if it doesn't exist
      await client.query(`
        ALTER TABLE app.collaborators 
        ADD COLUMN IF NOT EXISTS password_hash TEXT;
      `);
      
      // Migrate existing passwords (if any plaintext passwords exist)
      // Note: This assumes existing passwords are plaintext - adjust if needed
      await client.query(`
        UPDATE app.collaborators
        SET password_hash = crypt(password, gen_salt('bf'))
        WHERE password_hash IS NULL AND password IS NOT NULL;
      `);
      
      // Drop old password column
      await client.query(`
        ALTER TABLE app.collaborators 
        DROP COLUMN IF EXISTS password;
      `);
      
      console.log('✅ Migration complete!');
    } else {
      console.log('✅ Table already uses password_hash. No migration needed.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '42703') {
      console.log('ℹ️  Column already migrated or doesn\'t exist.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrateCollaboratorsPassword();

