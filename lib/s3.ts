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
 * @param filename - Original filename
 * @returns Unique S3 key
 */
export function generateFileKey(folder: string, filename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop();
  const sanitizedFilename = filename
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  return `${folder}/${timestamp}-${randomString}-${sanitizedFilename}.${extension}`;
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

