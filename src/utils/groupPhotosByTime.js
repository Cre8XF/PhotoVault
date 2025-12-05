import {
  isToday,
  isYesterday,
  isThisWeek,
  startOfDay,
  startOfWeek,
  parseISO,
  isValid
} from 'date-fns'

/**
 * Get photo date from various date formats
 * Handles Firestore Timestamps, ISO strings, and Date objects
 */
export function getPhotoDate(photo) {
  if (!photo) return null

  // Try dateTaken first (most accurate)
  if (photo.dateTaken) {
    if (photo.dateTaken.toDate) {
      return photo.dateTaken.toDate()
    }
    if (typeof photo.dateTaken === 'string') {
      const date = parseISO(photo.dateTaken)
      return isValid(date) ? date : null
    }
    if (photo.dateTaken instanceof Date) {
      return photo.dateTaken
    }
  }

  // Fallback to createdAt
  if (photo.createdAt) {
    if (photo.createdAt.toDate) {
      return photo.createdAt.toDate()
    }
    if (typeof photo.createdAt === 'string') {
      const date = parseISO(photo.createdAt)
      return isValid(date) ? date : null
    }
    if (photo.createdAt instanceof Date) {
      return photo.createdAt
    }
  }

  return null
}

/**
 * Group photos by time periods
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Array of time groups with photos
 */
export function groupPhotosByTime(photos) {
  if (!photos || photos.length === 0) {
    return []
  }

  const now = new Date()

  // Initialize groups
  const groups = {
    today: {
      key: 'today',
      label: 'I dag',
      labelEN: 'Today',
      photos: [],
    },
    yesterday: {
      key: 'yesterday',
      label: 'I går',
      labelEN: 'Yesterday',
      photos: [],
    },
    thisWeek: {
      key: 'thisWeek',
      label: 'Denne uken',
      labelEN: 'This week',
      photos: [],
    },
  }

  // Categorize photos
  photos.forEach((photo) => {
    const date = getPhotoDate(photo)

    if (!date) {
      console.warn('Photo missing date:', photo.id)
      return
    }

    if (isToday(date)) {
      groups.today.photos.push(photo)
    } else if (isYesterday(date)) {
      groups.yesterday.photos.push(photo)
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      // Week starts on Monday
      groups.thisWeek.photos.push(photo)
    }
    // Photos older than this week are not shown in Recent
  })

  // Return only non-empty groups
  return [groups.today, groups.yesterday, groups.thisWeek]
    .filter(group => group.photos.length > 0)
}
