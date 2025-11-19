import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Read and execute the SQL file
    const sqlPath = join(process.cwd(), 'sql', '01_create_executives_table.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Fetch and return the created executives
    const result = await client.query('SELECT id, email, name, phone, is_active, created_at FROM app.executives ORDER BY created_at');
    
    return NextResponse.json({
      status: 'success',
      message: 'Executives table created and populated successfully',
      executives: result.rows,
    }, { status: 200 });
    
  } catch (error: any) {
    // Rollback on error
    await client.query('ROLLBACK');
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to setup executives table',
      error: error.message,
    }, { status: 500 });
    
  } finally {
    client.release();
  }
}

