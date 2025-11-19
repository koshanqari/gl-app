import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Query to get all tables in the public schema
    const result = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    client.release();
    
    return NextResponse.json({
      status: 'success',
      count: result.rows.length,
      tables: result.rows,
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch tables',
      error: error.message,
    }, { status: 500 });
  }
}

