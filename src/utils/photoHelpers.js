/**
 * Photo Field Normalization Utilities
 *
 * Handles field name inconsistencies across different photo sources:
 * - url, downloadURL, imageUrl (full-size image)
 * - thumbnailUrl, thumbnailURL, thumbnail (thumbnail image)
 *
 * Usage:
 * - normalizePhotoFields(photo) - Normalize a single photo object
 * - normalizePhotosArray(photos) - Normalize an array of photos
 * - resolvePhotoUrl(photo) - Get correct image URL respecting storageBackend
 */

/**
 * Check if a URL is a Firebase Storage URL
 * @param {string} url
 * @returns {boolean}
 */
function isFirebaseStorageUrl(url) {
  if (!url || typeof url !== 'string') return false
  return url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')
}

/**
 * Resolve the correct image URL for a photo, respecting storageBackend.
 * When storageBackend is 'r2', uses R2 URLs and never falls back to Firebase Storage URLs.
 *
 * @param {Object} photo - Photo object
 * @returns {string} - Resolved URL
 */
export function resolvePhotoUrl(photo) {
  if (!photo) return ''

  const isR2Backend = photo.storageBackend?.toLowerCase() === 'r2'

  if (isR2Backend) {
    // R2 backend: prefer R2-specific URLs, never use Firebase Storage URLs
    if (photo.r2Url && !isFirebaseStorageUrl(photo.r2Url)) return photo.r2Url
    if (photo.originalUrl && !isFirebaseStorageUrl(photo.originalUrl)) return photo.originalUrl
    if (photo.displayUrl && !isFirebaseStorageUrl(photo.displayUrl)) return photo.displayUrl
    if (photo.url && !isFirebaseStorageUrl(photo.url)) return photo.url
    // All URLs are Firebase — should not happen, but return r2Url as last resort
    return photo.r2Url || photo.originalUrl || ''
  }

  // Non-R2: standard resolution
  return photo.url || photo.displayUrl || photo.thumbnailUrl || ''
}

/**
 * Resolve the correct thumbnail URL for a photo, respecting storageBackend.
 *
 * @param {Object} photo - Photo object
 * @returns {string} - Resolved thumbnail URL
 */
export function resolvePhotoThumbnailUrl(photo) {
  if (!photo) return ''

  const isR2Backend = photo.storageBackend?.toLowerCase() === 'r2'

  if (isR2Backend) {
    if (photo.thumbnailUrl && !isFirebaseStorageUrl(photo.thumbnailUrl)) return photo.thumbnailUrl
    // Fall back to main image URL
    return resolvePhotoUrl(photo)
  }

  return photo.thumbnailUrl || photo.thumbnailURL || photo.thumbnail || photo.url || ''
}

/**
 * Normalize photo field names across different sources
 * Handles: url/downloadURL and thumbnail/thumbnailUrl/thumbnailURL variations
 *
 * @param {Object} photo - Photo object with potentially inconsistent field names
 * @returns {Object|null} - Normalized photo object with all field name variations
 */
export const normalizePhotoFields = (photo) => {
  if (!photo) return null

  const isR2Backend = photo.storageBackend?.toLowerCase() === 'r2'

  // For R2 backend, resolve the primary URL from R2-safe sources
  const primaryUrl = isR2Backend
    ? resolvePhotoUrl(photo)
    : (photo.url || photo.downloadURL || photo.imageUrl || '')

  // Ensure all common field name variations exist
  const normalized = {
    ...photo,
    // Primary URL (full size)
    url: primaryUrl,
    downloadURL: primaryUrl,
    imageUrl: primaryUrl,

    // Thumbnail URL
    thumbnailUrl: isR2Backend
      ? resolvePhotoThumbnailUrl(photo)
      : (photo.thumbnailUrl || photo.thumbnailURL || photo.thumbnail || photo.url || photo.downloadURL || ''),
    thumbnailURL: isR2Backend
      ? resolvePhotoThumbnailUrl(photo)
      : (photo.thumbnailURL || photo.thumbnailUrl || photo.thumbnail || photo.url || photo.downloadURL || ''),
    thumbnail: isR2Backend
      ? resolvePhotoThumbnailUrl(photo)
      : (photo.thumbnail || photo.thumbnailUrl || photo.thumbnailURL || photo.url || photo.downloadURL || ''),

    // Ensure ID exists
    id: photo.id || photo.photoId || ''
  }

  return normalized
}

/**
 * Normalize array of photos
 * Filters out null/undefined values
 *
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Array of normalized photo objects
 */
export const normalizePhotosArray = (photos) => {
  if (!Array.isArray(photos)) return []
  return photos.map(normalizePhotoFields).filter(Boolean)
}
