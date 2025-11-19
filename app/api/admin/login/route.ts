import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (username === adminUsername && password === adminPassword) {
      // Set admin session cookie
      const cookieStore = await cookies();
      cookieStore.set('admin-session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      
      return NextResponse.json({
        status: 'success',
        message: 'Login successful',
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid credentials',
      }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Login failed',
      error: error.message,
    }, { status: 500 });
  }
}

