/**
 * File handling service for the client portal
 * Handles file uploads, downloads, and management
 */

// Mock storage for demo purposes
// In production, this would connect to your cloud storage solution
const fileStorage: Record<string, {
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: Date;
  uploadedBy: string;
}> = {};

/**
 * Upload a file and get a shareable URL
 */
export const uploadFile = async (file: File, userId: string): Promise<string> => {
  // In a real implementation, this would upload to cloud storage
  // For demo purposes, we'll create a mock URL
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const mockUrl = `/files/${fileId}/${encodeURIComponent(file.name)}`;
  
  // Store file metadata
  fileStorage[fileId] = {
    name: file.name,
    type: file.type,
    size: file.size,
    url: mockUrl,
    uploadDate: new Date(),
    uploadedBy: userId
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockUrl;
};

/**
 * Get file metadata by URL
 */
export const getFileMetadata = (url: string) => {
  const fileId = url.split('/')[2];
  return fileStorage[fileId] || null;
};

/**
 * Get a list of recently shared files
 */
export const getRecentFiles = (limit = 5) => {
  return Object.values(fileStorage)
    .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
    .slice(0, limit);
};

/**
 * Format file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
