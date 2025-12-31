/**
 * File Type Detection Utilities
 * Comprehensive MIME type detection for upload validation
 */

/**
 * Detect if file is a video
 * @param {File} file - The file object to check
 * @returns {boolean} - True if file is a video
 */
export function isVideoFile(file) {
  const mimeType = file.type || ''
  return mimeType.startsWith('video/')
}

/**
 * Detect if file is a document
 * @param {File} file - The file object to check
 * @returns {boolean} - True if file is a document
 */
export function isDocumentFile(file) {
  const mimeType = file.type || ''

  const documentMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'text/plain',
    'text/csv',
  ]

  return documentMimeTypes.some((type) => mimeType.includes(type))
}

/**
 * Detect if file is an image
 * @param {File} file - The file object to check
 * @returns {boolean} - True if file is an image
 */
export function isImageFile(file) {
  const mimeType = file.type || ''
  return (
    mimeType.startsWith('image/') &&
    !isDocumentFile(file) &&
    !isVideoFile(file)
  )
}

/**
 * Get display type for file
 * @param {File} file - The file object to check
 * @returns {string} - The display type: 'video', 'document', 'image', or 'unknown'
 */
export function getFileDisplayType(file) {
  if (isVideoFile(file)) return 'video'
  if (isDocumentFile(file)) return 'document'
  if (isImageFile(file)) return 'image'
  return 'unknown'
}
