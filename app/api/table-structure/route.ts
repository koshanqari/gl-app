import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    
    if (!tableName) {
      return NextResponse.json({
        status: 'error',
        message: 'Table name is required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    // Query to get table structure
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    // Query to get primary keys
    const pkResult = await client.query(`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary;
    `, [tableName]);
    
    // Query to get foreign keys
    const fkResult = await client.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1;
    `, [tableName]);
    
    client.release();
    
    return NextResponse.json({
      status: 'success',
      table: tableName,
      columns: result.rows,
      primary_keys: pkResult.rows,
      foreign_keys: fkResult.rows,
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch table structure',
      error: error.message,
    }, { status: 500 });
  }
}

