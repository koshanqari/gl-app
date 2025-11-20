import { NextResponse } from 'next/server';
import { getPresignedDownloadUrl } from '@/lib/s3';
import { cookies } from 'next/headers';

// GET redirect to signed URL for viewing a document
export async function GET(request: Request) {
  try {
    // Check authentication (executive or member)
    const cookieStore = await cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    const memberSession = cookieStore.get('member-session')?.value;

    if (!executiveSession && !memberSession) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Unauthorized - No session found',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'File key is required',
        },
        { status: 400 }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const signedUrl = await getPresignedDownloadUrl(key, 3600);

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error('Failed to generate signed URL:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to generate file URL',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

