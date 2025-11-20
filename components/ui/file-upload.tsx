"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "partners" | "events" | "members" | "executives" | "kyc" | "hotels";
  className?: string;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  fileType?: "image" | "document";
}

export function FileUpload({
  value,
  onChange,
  folder = "partners",
  className,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false,
  fileType,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousValueRef = useRef<string | undefined>(undefined);

  // Fetch signed URL when value (S3 key) changes
  useEffect(() => {
    const fetchSignedUrl = async () => {
      // If value changed from blob to something else, clear the blob preview
      if (previousValueRef.current && previousValueRef.current.startsWith('blob:') && 
          value && !value.startsWith('blob:')) {
        setPreview(undefined);
      }
      
      previousValueRef.current = value;
      
      if (!value || 
          value.startsWith('blob:') || 
          value.startsWith('http://') || 
          value.startsWith('https://') ||
          value.startsWith('data:')) {
        // If it's already a URL, don't fetch signed URL
        if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
          setSignedUrl(value);
        } else {
          setSignedUrl("");
        }
        return;
      }
      
      try {
        const response = await fetch(`/api/file-url?key=${encodeURIComponent(value)}`);
        const data = await response.json();
        
        if (response.ok) {
          setSignedUrl(data.url);
        } else {
          setSignedUrl("");
        }
      } catch (error) {
        console.error('Failed to fetch signed URL:', error);
        setSignedUrl("");
      }
    };

    fetchSignedUrl();
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Auto-detect file type and create preview
      const isImage = file.type.startsWith('image/');
      const detectedFileType = fileType || (isImage ? "image" : "document");
      
      // Create preview for images
      if (isImage) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      }

      // Upload to S3
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", folder);
      uploadFormData.append("fileType", detectedFileType);
      if (value) {
        uploadFormData.append("oldUrl", value);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // Update with the S3 key (not URL)
      onChange(data.key);
      
      // For images, keep the blob preview, for documents set the key
      if (!isImage) {
        setPreview(data.key);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
      setPreview(value);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      setUploading(true);
      
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }), // value is S3 key
      });

      setPreview(undefined);
      setSignedUrl("");
      onChange("");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete file");
    } finally {
      setUploading(false);
    }
  };

  const handleViewFile = async () => {
    if (!value) return;
    
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      // Fetch signed URL and open
      try {
        const response = await fetch(`/api/file-url?key=${encodeURIComponent(value)}`);
        const data = await response.json();
        
        if (response.ok) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          preview
            ? "border-slate-300 bg-slate-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !uploading && "cursor-pointer"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        {(preview || value) ? (
          <div className="relative">
            {preview && preview.startsWith('blob:') ? (
              // Show image preview for blob URLs (newly uploaded)
              <div className="aspect-video w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : signedUrl && value && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.gif') || value.includes('.webp') || value.includes('image')) ? (
              // Show image preview using signed URL
              <div className="aspect-video w-full">
                <img
                  src={signedUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : value ? (
              <div className="aspect-video w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
                <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    Document uploaded
                  </p>
                  <p className="text-xs text-slate-500">Click to view or replace</p>
                </div>
              </div>
            )}
            {!disabled && (
              <div className="absolute top-2 right-2 flex gap-2">
                {value && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewFile();
                    }}
                    className="bg-white/90 hover:bg-white shadow-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  disabled={uploading}
                  className="bg-white/90 hover:bg-white shadow-sm"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={uploading}
                  className="bg-white/90 hover:bg-white shadow-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
          >
            {uploading ? (
              <Loader2 className="h-10 w-10 text-slate-400 animate-spin mb-3" />
            ) : accept.includes('pdf') && accept.includes('image') ? (
              <FileText className="h-10 w-10 text-slate-400 mb-3" />
            ) : accept.includes('pdf') ? (
              <FileText className="h-10 w-10 text-slate-400 mb-3" />
            ) : (
              <ImageIcon className="h-10 w-10 text-slate-400 mb-3" />
            )}
            <p className="text-sm font-medium text-slate-900 mb-1">
              {uploading ? "Uploading..." : "Click to upload"}
            </p>
            <p className="text-xs text-slate-500">
              {accept.includes('pdf') && accept.includes('image')
                ? `Images or PDF (max ${Math.round(maxSize / (1024 * 1024))}MB)`
                : accept.includes('pdf')
                ? `PDF, DOC, DOCX (max ${Math.round(maxSize / (1024 * 1024))}MB)`
                : `PNG, JPG, GIF, WebP or SVG (max ${Math.round(maxSize / (1024 * 1024))}MB)`
              }
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

