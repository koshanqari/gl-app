import { NextResponse } from 'next/server';
import { getPresignedDownloadUrl } from '@/lib/s3';
import { cookies } from 'next/headers';
import { checkAuth } from '@/lib/auth-helpers';

// GET signed URL for viewing a file
export async function GET(request: Request) {
  try {
    // Check authentication (executive, collaborator, or member)
    const auth = await checkAuth();
    const cookieStore = await cookies();
    const memberSession = cookieStore.get('member-session')?.value;

    if (!auth.isAuthenticated && !memberSession) {
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
    const redirect = searchParams.get('redirect') === 'true';

    if (!key) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'File key is required',
        },
        { status: 400 }
      );
    }

    // Validate that the key is not a full URL (should be an S3 key only)
    const trimmedKey = key.trim();
    if (trimmedKey.startsWith('http://') || 
        trimmedKey.startsWith('https://') || 
        trimmedKey.startsWith('data:') ||
        trimmedKey.startsWith('blob:')) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid key format. Expected S3 key, not a URL.',
        },
        { status: 400 }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const signedUrl = await getPresignedDownloadUrl(trimmedKey, 3600);

    // If redirect=true, redirect to the signed URL (useful for img tags)
    if (redirect) {
      return NextResponse.redirect(signedUrl);
    }

    return NextResponse.json(
      {
        status: 'success',
        url: signedUrl,
      },
      { status: 200 }
    );
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

