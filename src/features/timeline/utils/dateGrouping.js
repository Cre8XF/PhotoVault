/**
 * Timeline Feature - Phase 1: Date Grouping Logic
 *
 * Utilities for grouping photos by date (day, month, year)
 * Uses date-fns for date manipulation with Norwegian locale
 */

import { format, startOfDay, startOfMonth, startOfYear, isValid, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { resolvePhotoDate } from '../../../utils/photoDateUtils'

/**
 * Validates and normalizes a photo date
 * @param {Object} photo - Photo object with createdAt field
 * @returns {Date|null} - Valid Date object or null
 */
export const getPhotoDate = (photo) => {
  if (!photo || !photo.createdAt) {
    if (import.meta.env.DEV) console.warn('Photo missing createdAt:', photo)
    return null
  }

  let date

  // Handle different date formats
  if (photo.createdAt instanceof Date) {
    date = photo.createdAt
  } else if (typeof photo.createdAt === 'string') {
    date = parseISO(photo.createdAt)
  } else if (photo.createdAt.toDate && typeof photo.createdAt.toDate === 'function') {
    // Firestore Timestamp
    date = photo.createdAt.toDate()
  } else if (typeof photo.createdAt === 'number') {
    date = new Date(photo.createdAt)
  } else {
    if (import.meta.env.DEV) console.warn('Invalid date format:', photo.createdAt)
    return null
  }

  // Validate date
  if (!isValid(date)) {
    if (import.meta.env.DEV) console.warn('Invalid date:', photo.createdAt)
    return null
  }

  return date
}

/**
 * Groups photos by day
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Array of date groups with photos
 */
export const groupPhotosByDate = (photos) => {
  if (!photos || photos.length === 0) {
    return []
  }

  // Filter out photos without valid dates and sort (newest first)
  const validPhotos = photos
    .map(photo => ({
      ...photo,
      _date: getPhotoDate(photo)
    }))
    .filter(photo => photo._date !== null)
    .sort((a, b) => b._date - a._date)

  if (import.meta.env.DEV) console.log(`📅 Grouping ${validPhotos.length} photos by day`)

  // Group by day
  const groups = {}

  validPhotos.forEach(photo => {
    const date = photo._date
    const dayKey = format(date, 'yyyy-MM-dd')

    if (!groups[dayKey]) {
      groups[dayKey] = {
        date: startOfDay(date),
        dateKey: dayKey,
        displayDate: format(date, 'EEEE d. MMMM yyyy', { locale: nb }),
        shortDate: format(date, 'd. MMM yyyy', { locale: nb }),
        photos: []
      }
    }

    // Remove temporary _date field before adding to group
    const { _date, ...cleanPhoto } = photo
    groups[dayKey].photos.push(cleanPhoto)
  })

  // Convert to array and sort by date (newest first)
  const result = Object.values(groups).sort((a, b) => b.date - a.date)

  if (import.meta.env.DEV) console.log(`✅ Created ${result.length} day groups`)
  return result
}

/**
 * Groups photos by month
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Array of month groups with photos
 */
export const groupPhotosByMonth = (photos) => {
  if (!photos || photos.length === 0) {
    return []
  }

  // Filter out photos without valid dates and sort (newest first)
  const validPhotos = photos
    .map(photo => ({
      ...photo,
      _date: getPhotoDate(photo)
    }))
    .filter(photo => photo._date !== null)
    .sort((a, b) => b._date - a._date)

  if (import.meta.env.DEV) console.log(`📅 Grouping ${validPhotos.length} photos by month`)

  // Group by month
  const groups = {}

  validPhotos.forEach(photo => {
    const date = photo._date
    const monthKey = format(date, 'yyyy-MM')

    if (!groups[monthKey]) {
      groups[monthKey] = {
        date: startOfMonth(date),
        dateKey: monthKey,
        displayDate: format(date, 'MMMM yyyy', { locale: nb }),
        shortDate: format(date, 'MMM yyyy', { locale: nb }),
        month: format(date, 'MMMM', { locale: nb }),
        year: format(date, 'yyyy'),
        photos: []
      }
    }

    // Remove temporary _date field before adding to group
    const { _date, ...cleanPhoto } = photo
    groups[monthKey].photos.push(cleanPhoto)
  })

  // Convert to array and sort by date (newest first)
  const result = Object.values(groups).sort((a, b) => b.date - a.date)

  if (import.meta.env.DEV) console.log(`✅ Created ${result.length} month groups`)
  return result
}

/**
 * Groups photos by year
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Array of year groups with photos
 */
export const groupPhotosByYear = (photos) => {
  if (!photos || photos.length === 0) {
    return []
  }

  // Filter out photos without valid dates and sort (newest first)
  const validPhotos = photos
    .map(photo => ({
      ...photo,
      _date: getPhotoDate(photo)
    }))
    .filter(photo => photo._date !== null)
    .sort((a, b) => b._date - a._date)

  if (import.meta.env.DEV) console.log(`📅 Grouping ${validPhotos.length} photos by year`)

  // Group by year
  const groups = {}

  validPhotos.forEach(photo => {
    const date = photo._date
    const yearKey = format(date, 'yyyy')

    if (!groups[yearKey]) {
      groups[yearKey] = {
        date: startOfYear(date),
        dateKey: yearKey,
        displayDate: yearKey,
        year: yearKey,
        photos: []
      }
    }

    // Remove temporary _date field before adding to group
    const { _date, ...cleanPhoto } = photo
    groups[yearKey].photos.push(cleanPhoto)
  })

  // Convert to array and sort by date (newest first)
  const result = Object.values(groups).sort((a, b) => b.date - a.date)

  if (import.meta.env.DEV) console.log(`✅ Created ${result.length} year groups`)
  return result
}

/**
 * Get statistics about photo date distribution
 * @param {Array} photos - Array of photo objects
 * @returns {Object} - Statistics object
 */
export const getDateStatistics = (photos) => {
  if (!photos || photos.length === 0) {
    return {
      total: 0,
      withValidDates: 0,
      withoutDates: 0,
      dateRange: null
    }
  }

  const validPhotos = photos
    .map(photo => ({
      photo,
      date: getPhotoDate(photo)
    }))
    .filter(item => item.date !== null)

  const dates = validPhotos.map(item => item.date).sort((a, b) => a - b)

  return {
    total: photos.length,
    withValidDates: validPhotos.length,
    withoutDates: photos.length - validPhotos.length,
    dateRange: dates.length > 0 ? {
      oldest: dates[0],
      newest: dates[dates.length - 1],
      oldestFormatted: format(dates[0], 'd. MMMM yyyy', { locale: nb }),
      newestFormatted: format(dates[dates.length - 1], 'd. MMMM yyyy', { locale: nb })
    } : null
  }
}

/**
 * Find photos taken "on this day" in previous years
 * Uses dateTaken (not upload date) via resolvePhotoDate
 * @param {Array} photos - Array of photo objects
 * @param {Date} referenceDate - The date to compare against (default: today)
 * @returns {Array} - Photos from same day/month in previous years
 */
export const getPhotosOnThisDay = (photos, referenceDate = new Date()) => {
  if (!photos || photos.length === 0) {
    return []
  }

  const refDay = referenceDate.getDate()
  const refMonth = referenceDate.getMonth()
  const refYear = referenceDate.getFullYear()

  // EXCLUDE DOCUMENTS - only photos and videos
  const mediaPhotos = photos.filter(p => p.type !== 'document')

  const memories = mediaPhotos
    .map(photo => ({
      ...photo,
      _date: resolvePhotoDate(photo) // Use canonical date resolution (dateTaken priority)
    }))
    .filter(photo => {
      if (photo._date === null) return false

      const photoDay = photo._date.getDate()
      const photoMonth = photo._date.getMonth()
      const photoYear = photo._date.getFullYear()

      // Same day and month, but different year
      return photoDay === refDay &&
             photoMonth === refMonth &&
             photoYear !== refYear
    })
    .sort((a, b) => b._date - a._date) // Newest first
    .map(photo => {
      const { _date, ...cleanPhoto } = photo
      return {
        ...cleanPhoto,
        yearsAgo: refYear - _date.getFullYear()
      }
    })

  if (import.meta.env.DEV) console.log(`🎂 Found ${memories.length} memories from this day in previous years`)
  return memories
}

/**
 * Get available years from photo collection
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Array of years (sorted newest first)
 */
export const getAvailableYears = (photos) => {
  if (!photos || photos.length === 0) {
    return []
  }

  const years = new Set()

  photos.forEach(photo => {
    const date = getPhotoDate(photo)
    if (date) {
      years.add(format(date, 'yyyy'))
    }
  })

  return Array.from(years).sort((a, b) => b - a)
}

/**
 * Get available months for a specific year
 * @param {Array} photos - Array of photo objects
 * @param {string|number} year - Year to filter by
 * @returns {Array} - Array of month objects
 */
export const getAvailableMonthsForYear = (photos, year) => {
  if (!photos || photos.length === 0 || !year) {
    return []
  }

  const yearStr = String(year)
  const months = new Set()

  photos.forEach(photo => {
    const date = getPhotoDate(photo)
    if (date && format(date, 'yyyy') === yearStr) {
      const monthNum = date.getMonth()
      months.add(monthNum)
    }
  })

  const monthNames = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
  ]

  return Array.from(months)
    .sort((a, b) => b - a) // Newest first
    .map(monthNum => ({
      monthNum,
      monthName: monthNames[monthNum],
      monthKey: `${yearStr}-${String(monthNum + 1).padStart(2, '0')}`
    }))
}

/**
 * SMART ORGANIZATION: Find photos from same month in previous years
 * Uses dateTaken (not upload date) via resolvePhotoDate
 * @param {Array} photos - Array of photo objects
 * @param {Date} referenceDate - The date to compare against (default: today)
 * @returns {Array} - Photos from same month in previous years
 */
export const getPhotosFromSameMonth = (photos, referenceDate = new Date()) => {
  if (!photos || photos.length === 0) {
    return []
  }

  const refMonth = referenceDate.getMonth()
  const refYear = referenceDate.getFullYear()

  // EXCLUDE DOCUMENTS - only photos and videos
  const mediaPhotos = photos.filter(p => p.type !== 'document')

  const memories = mediaPhotos
    .map(photo => ({
      ...photo,
      _date: resolvePhotoDate(photo) // Use canonical date resolution (dateTaken priority)
    }))
    .filter(photo => {
      if (photo._date === null) return false

      const photoMonth = photo._date.getMonth()
      const photoYear = photo._date.getFullYear()

      // Same month, but different year (previous years only)
      return photoMonth === refMonth && photoYear < refYear
    })
    .sort((a, b) => b._date - a._date) // Newest first
    .map(photo => {
      const { _date, ...cleanPhoto } = photo
      return {
        ...cleanPhoto,
        yearsAgo: refYear - _date.getFullYear()
      }
    })

  if (import.meta.env.DEV) console.log(`📅 Found ${memories.length} photos from this month in previous years`)
  return memories
}

/**
 * SMART ORGANIZATION: Get highlights from last year (favorites or most recent)
 * Uses dateTaken (not upload date) via resolvePhotoDate
 * @param {Array} photos - Array of photo objects
 * @param {Date} referenceDate - The date to compare against (default: today)
 * @returns {Array} - Highlights from last year
 */
export const getLastYearHighlights = (photos, referenceDate = new Date()) => {
  if (!photos || photos.length === 0) {
    return []
  }

  const refYear = referenceDate.getFullYear()
  const lastYear = refYear - 1

  // EXCLUDE DOCUMENTS - only photos and videos
  const mediaPhotos = photos.filter(p => p.type !== 'document')

  // Get photos from last year
  const lastYearPhotos = mediaPhotos
    .map(photo => ({
      ...photo,
      _date: resolvePhotoDate(photo) // Use canonical date resolution (dateTaken priority)
    }))
    .filter(photo => {
      if (photo._date === null) return false
      return photo._date.getFullYear() === lastYear
    })

  if (lastYearPhotos.length === 0) {
    return []
  }

  // Prioritize favorites from last year
  const favorites = lastYearPhotos
    .filter(photo => photo.favorite)
    .sort((a, b) => b._date - a._date)

  if (favorites.length > 0) {
    if (import.meta.env.DEV) console.log(`⭐ Found ${favorites.length} favorite photos from last year`)
    return favorites.slice(0, 10).map(photo => {
      const { _date, ...cleanPhoto } = photo
      return cleanPhoto
    })
  }

  // If no favorites, return most recent photos from last year
  const mostRecent = lastYearPhotos
    .sort((a, b) => b._date - a._date)
    .slice(0, 10)
    .map(photo => {
      const { _date, ...cleanPhoto } = photo
      return cleanPhoto
    })

  if (import.meta.env.DEV) console.log(`📸 Found ${mostRecent.length} recent photos from last year`)
  return mostRecent
}

/**
 * SMART ORGANIZATION: Get memories using priority-based logic
 * Returns ONLY ONE memory group based on priority:
 * 1. On this day (same date, previous years)
 * 2. Same month, previous years
 * 3. Last year highlights (favorites or most recent)
 *
 * @param {Array} photos - Array of photo objects
 * @param {Date} referenceDate - The date to compare against (default: today)
 * @returns {Object|null} - Memory object with type and photos, or null if no memories
 */
export const getMemories = (photos, referenceDate = new Date()) => {
  if (!photos || photos.length === 0) {
    return null
  }

  // Priority 1: On this day (same date, previous years)
  const onThisDay = getPhotosOnThisDay(photos, referenceDate)
  if (onThisDay.length > 0) {
    const monthName = format(referenceDate, 'MMMM', { locale: nb })
    const day = referenceDate.getDate()
    return {
      type: 'on-this-day',
      title: `${day}. ${monthName}`,
      subtitle: onThisDay.length === 1
        ? `${onThisDay[0].yearsAgo} år siden`
        : `${onThisDay.length} minner fra tidligere år`,
      photos: onThisDay.slice(0, 10), // Limit to 10
      count: onThisDay.length
    }
  }

  // Priority 2: Same month, previous years
  const sameMonth = getPhotosFromSameMonth(photos, referenceDate)
  if (sameMonth.length > 0) {
    const monthName = format(referenceDate, 'MMMM', { locale: nb })
    return {
      type: 'same-month',
      title: `${monthName} i tidligere år`,
      subtitle: `${sameMonth.length} ${sameMonth.length === 1 ? 'bilde' : 'bilder'} fra denne måneden`,
      photos: sameMonth.slice(0, 10), // Limit to 10
      count: sameMonth.length
    }
  }

  // Priority 3: Last year highlights
  const lastYearHighlights = getLastYearHighlights(photos, referenceDate)
  if (lastYearHighlights.length > 0) {
    const lastYear = referenceDate.getFullYear() - 1
    const hasFavorites = lastYearHighlights.some(p => p.favorite)
    return {
      type: 'last-year',
      title: `Minner fra ${lastYear}`,
      subtitle: hasFavorites
        ? `Favoritter fra i fjor`
        : `Bilder fra i fjor`,
      photos: lastYearHighlights,
      count: lastYearHighlights.length
    }
  }

  // No memories found
  return null
}
