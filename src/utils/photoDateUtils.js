// ============================================================================
// Photo Date Resolution Utility - CANONICAL SOURCE OF TRUTH
// ============================================================================
//
// This utility provides the standard date resolution logic for all photo
// display and sorting operations across the entire application.
//
// PRIORITY ORDER (Google Photos style):
// 1. dateTaken (EXIF DateTimeOriginal) - When photo was actually taken
// 2. displayDate - User override or manually set date
// 3. uploadedAt - When photo was uploaded (fallback)
//
// ============================================================================

import { parseISO, isValid } from 'date-fns'

/**
 * Resolve the canonical display date for a photo
 *
 * This is the SINGLE SOURCE OF TRUTH for photo date resolution.
 * All components should use this function for consistency.
 *
 * @param {Object} photo - Photo object from Firestore
 * @returns {Date|null} - Resolved date as Date object, or null if no valid date found
 */
export function resolvePhotoDate(photo) {
  if (!photo) {
    return null
  }

  // Priority order (fixed in recent audit):
  // 1. dateTaken (EXIF) - Most accurate
  // 2. displayDate - User override or legacy takenAt
  // 3. takenAt - Legacy EXIF field
  // 4. uploadedAt - Upload timestamp
  // 5. createdAt - Firestore creation time (last resort)
  const dateValue =
    photo.dateTaken || // ✅ EXIF date (canonical)
    photo.displayDate || // ✅ User override or computed date
    photo.takenAt || // Legacy EXIF field
    photo.uploadedAt || // Upload timestamp
    photo.createdAt // Firestore timestamp (fallback)

  if (!dateValue) {
    if (import.meta.env.DEV) {
      console.warn(
        '[photoDateUtils] Photo missing all date fields:',
        photo.id || photo
      )
    }
    return null
  }

  return parseDateValue(dateValue)
}

/**
 * Parse a date value from various formats
 *
 * Handles:
 * - JavaScript Date objects
 * - ISO 8601 strings
 * - Firestore Timestamps
 * - Unix timestamps (milliseconds)
 *
 * @param {*} dateValue - Date in various formats
 * @returns {Date|null} - Parsed Date object or null
 */
function parseDateValue(dateValue) {
  // Already a Date object
  if (dateValue instanceof Date) {
    return isValid(dateValue) ? dateValue : null
  }

  // ISO string
  if (typeof dateValue === 'string') {
    const parsed = parseISO(dateValue)
    return isValid(parsed) ? parsed : null
  }

  // Firestore Timestamp
  if (dateValue && typeof dateValue.toDate === 'function') {
    try {
      const date = dateValue.toDate()
      return isValid(date) ? date : null
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          '[photoDateUtils] Failed to parse Firestore Timestamp:',
          error
        )
      }
      return null
    }
  }

  // Unix timestamp (milliseconds)
  if (typeof dateValue === 'number') {
    const date = new Date(dateValue)
    return isValid(date) ? date : null
  }

  // Unknown format
  if (import.meta.env.DEV) {
    console.warn(
      '[photoDateUtils] Unknown date format:',
      typeof dateValue,
      dateValue
    )
  }
  return null
}

/**
 * Sort photos by date (newest first)
 *
 * @param {Array<Object>} photos - Array of photo objects
 * @returns {Array<Object>} - Sorted array (does NOT mutate original)
 */
export function sortPhotosByDate(photos, order = 'desc') {
  if (!Array.isArray(photos)) {
    if (import.meta.env.DEV) {
      console.warn(
        '[photoDateUtils] sortPhotosByDate received non-array:',
        typeof photos
      )
    }
    return []
  }

  const sorted = [...photos]
    .map((photo) => ({
      ...photo,
      _resolvedDate: resolvePhotoDate(photo),
    }))
    .filter((photo) => photo._resolvedDate !== null) // Exclude photos with no valid date
    .sort((a, b) => {
      if (order === 'asc') {
        return a._resolvedDate - b._resolvedDate
      } else {
        return b._resolvedDate - a._resolvedDate // Newest first (default)
      }
    })

  // Remove temporary field
  return sorted.map(({ _resolvedDate, ...photo }) => photo)
}

/**
 * Group photos by month and year
 *
 * @param {Array<Object>} photos - Array of photo objects
 * @param {string} locale - date-fns locale (default: 'nb' for Norwegian)
 * @returns {Array<{key: string, label: string, date: Date, photos: Array}>}
 */
export function groupPhotosByMonth(photos, locale = 'nb') {
  if (!Array.isArray(photos)) {
    return []
  }

  const groups = {}

  photos.forEach((photo) => {
    const date = resolvePhotoDate(photo)
    if (!date) {
      return // Skip photos without valid dates
    }

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`

    if (!groups[monthKey]) {
      groups[monthKey] = {
        key: monthKey,
        label: formatMonthYear(date, locale),
        date: date,
        photos: [],
      }
    }

    groups[monthKey].photos.push(photo)
  })

  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort((a, b) => b.date - a.date)
}

/**
 * Format month and year for display
 *
 * @param {Date} date - Date object
 * @param {string} locale - Locale code ('no'/'nb' or 'en')
 * @returns {string} - Formatted string (e.g., "Januar 2024")
 */
function formatMonthYear(date, locale = 'nb') {
  const lang = locale.startsWith('en') ? 'en-US' : 'nb-NO'

  const monthName = date.toLocaleString(lang, { month: 'long' })
  const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return `${capitalized} ${date.getFullYear()}`
}

/**
 * Check if a photo was taken/uploaded within a date range
 *
 * @param {Object} photo - Photo object
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {boolean}
 */
export function isPhotoInDateRange(photo, startDate, endDate) {
  const photoDate = resolvePhotoDate(photo)
  if (!photoDate) {
    return false
  }

  return photoDate >= startDate && photoDate <= endDate
}

/**
 * Get the most recent photo from an array
 *
 * @param {Array<Object>} photos - Array of photo objects
 * @returns {Object|null} - Most recent photo or null
 */
export function getMostRecentPhoto(photos) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return null
  }

  const sorted = sortPhotosByDate(photos, 'desc')
  return sorted[0] || null
}
