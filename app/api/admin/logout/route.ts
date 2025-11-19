import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin-session');
    
    return NextResponse.json({
      status: 'success',
      message: 'Logged out successfully',
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Logout failed',
      error: error.message,
    }, { status: 500 });
  }
}

