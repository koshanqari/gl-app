import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'golden-lotus-prod';

/**
 * Upload a file to S3
 * @param file - The file buffer to upload
 * @param key - The S3 object key (path/filename)
 * @param contentType - The file's content type
 * @returns The public URL of the uploaded file
 */
export async function uploadFileToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the S3 key (not public URL)
  return key;
}

/**
 * Delete a file from S3
 * @param key - The S3 object key (path/filename)
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a presigned URL for secure file uploads from client
 * @param key - The S3 object key (path/filename)
 * @param contentType - The file's content type
 * @param expiresIn - URL expiration time in seconds (default: 5 minutes)
 * @returns Presigned URL for upload
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading/viewing a file
 * @param key - The S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL for download
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a unique file key with timestamp and random string
 * @param folder - The folder/prefix for the file (e.g., 'partners', 'events', 'members')
 * @param filename - Original filename (may be empty or unusual for camera uploads)
 * @param contentType - Optional content type to help determine extension
 * @returns Unique S3 key
 */
export function generateFileKey(folder: string, filename: string, contentType?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  
  // Sanitize folder name to ensure it's valid
  const sanitizedFolder = folder.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  
  // Normalize filename - handle empty, blob:, or unusual camera filenames
  let normalizedFilename = filename || '';
  
  // Handle blob URLs or empty filenames (common with camera uploads)
  if (!normalizedFilename || normalizedFilename.startsWith('blob:') || normalizedFilename.trim() === '') {
    normalizedFilename = 'camera-photo';
  }
  
  // Remove any path components (handle cases like "path/to/image.jpg")
  const filenameOnly = normalizedFilename.split('/').pop() || normalizedFilename;
  
  // Extract extension from filename
  let extension = '';
  const lastDotIndex = filenameOnly.lastIndexOf('.');
  
  if (lastDotIndex > 0 && lastDotIndex < filenameOnly.length - 1) {
    extension = filenameOnly.substring(lastDotIndex + 1).toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  // If no extension found, try to infer from content type (important for camera uploads)
  if (!extension && contentType) {
    if (contentType.startsWith('image/')) {
      const mimeExtension = contentType.split('/')[1].split('-')[0]; // Handle 'image/heic-sequence'
      if (mimeExtension && ['jpeg', 'jpg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(mimeExtension)) {
        extension = mimeExtension === 'jpeg' ? 'jpg' : mimeExtension;
      }
    } else if (contentType === 'application/pdf') {
      extension = 'pdf';
    }
  }
  
  // Default extension if still not found
  if (!extension || extension.length === 0) {
    extension = 'jpg'; // Default to jpg for camera photos
  }
  
  // Simple key: folder/timestamp-random.extension
  // No filename = no possible issues
  const key = `${sanitizedFolder}/${timestamp}-${randomString}.${extension}`;
  
  return key;
}

/**
 * Extract S3 key from full URL
 * @param url - Full S3 URL
 * @returns S3 key
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  } catch {
    return null;
  }
}

