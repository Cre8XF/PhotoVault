/**
 * Vault Media Utilities
 * Helper functions for handling different media types in Vault
 */

/**
 * Get vault file category from MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Category: 'image' | 'video' | 'pdf' | 'doc' | 'other'
 */
export function getVaultFileCategory(mimeType) {
  if (!mimeType) return 'other';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';

  // Document types
  const docTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf',
  ];

  if (docTypes.includes(mimeType)) return 'doc';

  // Archive types
  const archiveTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ];

  if (archiveTypes.includes(mimeType)) return 'archive';

  return 'other';
}

/**
 * Get file icon name based on file category
 * @param {string} category - File category from getVaultFileCategory
 * @returns {string} Icon name for lucide-react
 */
export function getFileIcon(category) {
  const iconMap = {
    image: 'Image',
    video: 'Video',
    pdf: 'FileText',
    doc: 'FileText',
    archive: 'Archive',
    other: 'File',
  };

  return iconMap[category] || 'File';
}

/**
 * Get human-readable file type label
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Human-readable label
 */
export function getFileTypeLabel(mimeType) {
  const category = getVaultFileCategory(mimeType);

  const labelMap = {
    image: 'Image',
    video: 'Video',
    pdf: 'PDF Document',
    doc: 'Document',
    archive: 'Archive',
    other: 'File',
  };

  return labelMap[category] || 'File';
}

/**
 * Check if file type is supported for preview
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean} True if file can be previewed in-app
 */
export function isPreviewable(mimeType) {
  const category = getVaultFileCategory(mimeType);
  return ['image', 'video', 'pdf'].includes(category);
}

/**
 * Get accepted file types string for file input
 * @returns {string} Comma-separated list of accepted file types
 */
export function getAcceptedFileTypes() {
  return 'image/*,video/*,application/pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z';
}

/**
 * Revoke object URL safely
 * @param {string} url - Object URL to revoke
 */
export function revokeObjectUrl(url) {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to revoke object URL:', error);
    }
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}
