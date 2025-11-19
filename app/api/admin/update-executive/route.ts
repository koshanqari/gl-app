import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function PUT(request: Request) {
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
    
    const { id, email, name, country_code, phone, password, is_active } = await request.json();
    
    // Validate required fields
    if (!id || !email || !name) {
      return NextResponse.json({
        status: 'error',
        message: 'ID, email, and name are required',
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      let query;
      let params;
      
      // If password is provided, update it along with other fields
      if (password && password.trim() !== '') {
        query = `
          UPDATE app.executives 
          SET email = $1, 
              name = $2, 
              country_code = $3,
              phone = $4,
              password_hash = crypt($5, gen_salt('bf')),
              is_active = $6,
              updated_at = NOW()
          WHERE id = $7
          RETURNING id, email, name, country_code, phone, is_active, created_at, updated_at;
        `;
        params = [email, name, country_code || '+91', phone || null, password, is_active !== false, id];
      } else {
        // Update without changing password
        query = `
          UPDATE app.executives 
          SET email = $1, 
              name = $2, 
              country_code = $3,
              phone = $4,
              is_active = $5,
              updated_at = NOW()
          WHERE id = $6
          RETURNING id, email, name, country_code, phone, is_active, created_at, updated_at;
        `;
        params = [email, name, country_code || '+91', phone || null, is_active !== false, id];
      }
      
      const result = await client.query(query, params);
      
      client.release();
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Executive not found',
        }, { status: 404 });
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'Executive updated successfully',
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
      message: 'Failed to update executive',
      error: error.message,
    }, { status: 500 });
  }
}

