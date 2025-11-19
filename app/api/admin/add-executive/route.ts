import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized',
      }, { status: 401 });
    }
    
    const { email, name, country_code, phone, password } = await request.json();
    
    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Email, name, and password are required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Insert new executive with hashed password
      const result = await client.query(`
        INSERT INTO app.executives (email, name, country_code, phone, password_hash)
        VALUES ($1, $2, $3, $4, crypt($5, gen_salt('bf')))
        RETURNING id, email, name, country_code, phone, is_active, created_at;
      `, [email, name, country_code || '+91', phone || null, password]);
      
      client.release();
      
      return NextResponse.json({
        status: 'success',
        message: 'Executive added successfully',
        executive: result.rows[0],
      }, { status: 201 });
      
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
      message: 'Failed to add executive',
      error: error.message,
    }, { status: 500 });
  }
}

