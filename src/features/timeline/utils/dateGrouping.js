/**
 * Timeline Feature - Phase 1: Date Grouping Logic
 *
 * Utilities for grouping photos by date (day, month, year)
 * Uses date-fns for date manipulation with Norwegian locale
 */

import { format, startOfDay, startOfMonth, startOfYear, isValid, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'

/**
 * Validates and normalizes a photo date
 * @param {Object} photo - Photo object with createdAt field
 * @returns {Date|null} - Valid Date object or null
 */
export const getPhotoDate = (photo) => {
  if (!photo || !photo.createdAt) {
    console.warn('Photo missing createdAt:', photo)
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
    console.warn('Invalid date format:', photo.createdAt)
    return null
  }

  // Validate date
  if (!isValid(date)) {
    console.warn('Invalid date:', photo.createdAt)
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

  console.log(`📅 Grouping ${validPhotos.length} photos by day`)

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

  console.log(`✅ Created ${result.length} day groups`)
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

  console.log(`📅 Grouping ${validPhotos.length} photos by month`)

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

  console.log(`✅ Created ${result.length} month groups`)
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

  console.log(`📅 Grouping ${validPhotos.length} photos by year`)

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

  console.log(`✅ Created ${result.length} year groups`)
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

  const memories = photos
    .map(photo => ({
      ...photo,
      _date: getPhotoDate(photo)
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

  console.log(`🎂 Found ${memories.length} memories from this day in previous years`)
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
