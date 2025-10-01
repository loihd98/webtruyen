/**
 * Media URL utilities for handling file uploads and serving
 */

// Get the base URL for media files
export const getMediaBaseUrl = (): string => {
  // Use the specific media URL if set, otherwise fallback to nginx proxy
  // This ensures media files are served through nginx reverse proxy
  return (
    process.env.NEXT_PUBLIC_MEDIA_URL || "http://localhost" // nginx serves uploads directly
  );
};

// Convert a media URL to the correct public URL
export const getMediaUrl = (url: string): string => {
  if (!url) return "";

  // If it's already a full URL, return as is
  if (url.startsWith("http")) {
    return url;
  }

  // If it starts with /uploads/, prepend the base URL (nginx serves these directly)
  if (url.startsWith("/uploads/")) {
    const fullUrl = `${getMediaBaseUrl()}${url}`;
    console.log("Media URL generated:", { input: url, output: fullUrl });
    return fullUrl;
  }

  // If it's just a filename, assume it's in uploads
  if (!url.startsWith("/")) {
    return `${getMediaBaseUrl()}/uploads/${url}`;
  }

  return `${getMediaBaseUrl()}${url}`;
};

// Get the correct API URL for file uploads
export const getUploadApiUrl = (type: "image" | "audio"): string => {
  return `/api/media/upload/${type}`;
};

// Validate file type for uploads
export const validateFileType = (
  file: File,
  type: "image" | "audio"
): boolean => {
  const imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const audioTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/flac",
  ];

  if (type === "image") {
    return imageTypes.includes(file.type);
  }

  if (type === "audio") {
    return audioTypes.includes(file.type);
  }

  return false;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
