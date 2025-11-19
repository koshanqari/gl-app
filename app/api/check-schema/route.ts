import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Check if app schema exists
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'app';
    `);
    
    // List all schemas
    const allSchemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name;
    `);
    
    // Check if executives table exists in any schema
    const tableResult = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'executives';
    `);
    
    client.release();
    
    return NextResponse.json({
      status: 'success',
      app_schema_exists: schemaResult.rows.length > 0,
      all_schemas: allSchemasResult.rows,
      executives_table: tableResult.rows,
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check schema',
      error: error.message,
    }, { status: 500 });
  }
}

