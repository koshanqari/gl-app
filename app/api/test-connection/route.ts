import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET() {
  try {
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: result.message,
        timestamp: result.timestamp,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'error',
        message: result.message,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test database connection',
      error: error.message,
    }, { status: 500 });
  }
}

