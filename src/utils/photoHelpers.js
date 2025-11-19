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
 */

/**
 * Normalize photo field names across different sources
 * Handles: url/downloadURL and thumbnail/thumbnailUrl/thumbnailURL variations
 *
 * @param {Object} photo - Photo object with potentially inconsistent field names
 * @returns {Object|null} - Normalized photo object with all field name variations
 */
export const normalizePhotoFields = (photo) => {
  if (!photo) return null

  // Ensure all common field name variations exist
  const normalized = {
    ...photo,
    // Primary URL (full size)
    url: photo.url || photo.downloadURL || photo.imageUrl || '',
    downloadURL: photo.downloadURL || photo.url || photo.imageUrl || '',
    imageUrl: photo.imageUrl || photo.url || photo.downloadURL || '',

    // Thumbnail URL
    thumbnailUrl: photo.thumbnailUrl || photo.thumbnailURL || photo.thumbnail || photo.url || photo.downloadURL || '',
    thumbnailURL: photo.thumbnailURL || photo.thumbnailUrl || photo.thumbnail || photo.url || photo.downloadURL || '',
    thumbnail: photo.thumbnail || photo.thumbnailUrl || photo.thumbnailURL || photo.url || photo.downloadURL || '',

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
