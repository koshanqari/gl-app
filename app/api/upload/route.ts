import { NextResponse } from 'next/server';
import { uploadFileToS3, generateFileKey, deleteFileFromS3, extractKeyFromUrl } from '@/lib/s3';
import { cookies } from 'next/headers';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
    const oldUrl = formData.get('oldUrl') as string | null;
    const fileType = formData.get('fileType') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Validate file type based on fileType parameter
    const allowedTypes = fileType === 'document' 
      ? ALLOWED_DOCUMENT_TYPES 
      : ALLOWED_IMAGE_TYPES;
    
    const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    
    if (!allAllowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: 'error',
          message: fileType === 'document' 
            ? 'Invalid file type. Only PDF, DOC, DOCX are allowed'
            : 'Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP, SVG)',
        },
        { status: 400 }
      );
    }
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: 'error',
          message: fileType === 'document' 
            ? 'Invalid file type. Only PDF, DOC, DOCX are allowed'
            : 'Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP, SVG)',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'File too large. Maximum size is 5MB',
        },
        { status: 400 }
      );
    }

    // Validate folder
    const allowedFolders = ['partners', 'events', 'members', 'executives', 'kyc', 'hotels'];
    const targetFolder = folder && allowedFolders.includes(folder) ? folder : 'misc';

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique key
    const key = generateFileKey(targetFolder, file.name);

    // Upload to S3 (returns the S3 key)
    const s3Key = await uploadFileToS3(buffer, key, file.type);

    // Delete old file if provided
    if (oldUrl) {
      try {
        // oldUrl might be a full S3 key already or needs extraction
        const oldKey = oldUrl.includes('/') ? oldUrl : extractKeyFromUrl(oldUrl);
        if (oldKey) {
          await deleteFileFromS3(oldKey);
        }
      } catch (error) {
        console.error('Failed to delete old file:', error);
        // Don't fail the request if old file deletion fails
      }
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'File uploaded successfully',
        key: s3Key, // Return S3 key instead of URL
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to upload file',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No URL provided',
        },
        { status: 400 }
      );
    }

    // url might be an S3 key already or a full URL
    const key = url.includes('://') ? extractKeyFromUrl(url) : url;
    
    if (!key) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid URL or key',
        },
        { status: 400 }
      );
    }

    await deleteFileFromS3(key);

    return NextResponse.json(
      {
        status: 'success',
        message: 'File deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete file',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

