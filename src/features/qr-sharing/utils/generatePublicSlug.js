import { nanoid } from 'nanoid'

/**
 * Generate short, unique slug for public album
 * @param {string} albumName - Album name
 * @returns {string} - Unique slug (e.g., "summer-vacation-a3B9kL")
 */
export const generatePublicSlug = (albumName) => {
  // Sanitize album name
  const sanitized = albumName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20)

  // Add unique identifier
  const uniqueId = nanoid(6)

  return `${sanitized}-${uniqueId}`
}

/**
 * Generate full public URL
 * @param {string} slug - Album slug
 * @returns {string} - Full URL
 */
export const getPublicAlbumUrl = (slug) => {
  const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin
  return `${baseUrl}/share/${slug}`
}
