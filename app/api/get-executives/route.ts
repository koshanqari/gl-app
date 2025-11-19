import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Query executives from app schema
    const result = await client.query(`
      SELECT id, email, name, phone, country_code, is_active, created_at, updated_at, last_login_at
      FROM app.executives
      ORDER BY created_at DESC;
    `);
    
    client.release();
    
    return NextResponse.json({
      status: 'success',
      count: result.rows.length,
      executives: result.rows,
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch executives',
      error: error.message,
    }, { status: 500 });
  }
}

