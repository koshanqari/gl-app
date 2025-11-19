import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch executive profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        status: 'error',
        message: 'Executive ID is required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT id, email, name, country_code, phone, is_active, created_at, updated_at, last_login_at
        FROM app.executives
        WHERE id = $1;
      `, [id]);
      
      client.release();
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Executive not found',
        }, { status: 404 });
      }
      
      return NextResponse.json({
        status: 'success',
        executive: result.rows[0],
      }, { status: 200 });
      
    } catch (dbError: any) {
      client.release();
      throw dbError;
    }
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch profile',
      error: error.message,
    }, { status: 500 });
  }
}

// PUT - Update executive profile
export async function PUT(request: Request) {
  try {
    const { id, email, name, country_code, phone } = await request.json();
    
    // Validate required fields
    if (!id || !email || !name) {
      return NextResponse.json({
        status: 'error',
        message: 'ID, email, and name are required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE app.executives 
        SET email = $1, 
            name = $2, 
            country_code = $3,
            phone = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, email, name, country_code, phone, is_active, created_at, updated_at, last_login_at;
      `, [email, name, country_code || '+91', phone || null, id]);
      
      client.release();
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Executive not found',
        }, { status: 404 });
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'Profile updated successfully',
        executive: result.rows[0],
      }, { status: 200 });
      
    } catch (dbError: any) {
      client.release();
      
      if (dbError.code === '23505') { // Unique violation
        return NextResponse.json({
          status: 'error',
          message: 'Email already exists',
        }, { status: 409 });
      }
      
      throw dbError;
    }
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message,
    }, { status: 500 });
  }
}

