import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Email and password are required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Authenticate executive using bcrypt
      const result = await client.query(`
        SELECT id, email, name, phone, country_code, is_active
        FROM app.executives
        WHERE email = $1 
          AND password_hash = crypt($2, password_hash)
          AND is_active = true;
      `, [email, password]);
      
      client.release();
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Invalid email or password',
        }, { status: 401 });
      }
      
      const executive = result.rows[0];
      
      // Update last login time
      const updateClient = await pool.connect();
      await updateClient.query(`
        UPDATE app.executives
        SET last_login_at = NOW()
        WHERE id = $1;
      `, [executive.id]);
      updateClient.release();
      
      // Format phone for response
      const phone = executive.phone && executive.country_code 
        ? `${executive.country_code}${executive.phone}`
        : null;
      
      return NextResponse.json({
        status: 'success',
        message: 'Login successful',
        executive: {
          id: executive.id,
          email: executive.email,
          name: executive.name,
          phone: phone,
        },
      }, { status: 200 });
      
    } catch (dbError: any) {
      client.release();
      throw dbError;
    }
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Login failed',
      error: error.message,
    }, { status: 500 });
  }
}

