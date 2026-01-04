/**
 * SMART ORGANIZATION: Smart Tags Utility
 *
 * Derives metadata-based tags from photo properties
 * NO AI - purely rule-based tag derivation
 */

/**
 * Derive smart tags from photo metadata
 * @param {Object} photo - Photo object with metadata
 * @returns {Array} - Array of smart tags
 */
export const deriveSmartTags = (photo) => {
  if (!photo) return []

  const tags = []

  // Type-based tags
  if (photo.type === 'video') {
    tags.push('Video')
  } else if (photo.type === 'photo') {
    tags.push('Photo')
  }

  // Favorite tag
  if (photo.favorite) {
    tags.push('Favorite')
  }

  // Location tags
  if (photo.location && (photo.location.latitude || photo.location.longitude)) {
    tags.push('With Location')
  } else {
    tags.push('No Location')
  }

  // Album tags
  if (!photo.albumId || photo.albumId === '') {
    tags.push('Without Album')
  }

  // Camera tags (make and model)
  if (photo.camera) {
    if (photo.camera.make) {
      // Normalize common camera makes
      const make = photo.camera.make.toLowerCase()
      if (make.includes('apple') || make.includes('iphone')) {
        tags.push('Shot on iPhone')
      } else if (make.includes('samsung')) {
        tags.push('Shot on Samsung')
      } else if (make.includes('canon')) {
        tags.push('Shot on Canon')
      } else if (make.includes('nikon')) {
        tags.push('Shot on Nikon')
      } else if (make.includes('sony')) {
        tags.push('Shot on Sony')
      } else {
        // Generic camera make tag
        tags.push(`Shot on ${photo.camera.make}`)
      }
    }
  }

  // Orientation tags (based on dimensions)
  if (photo.technicalDetails) {
    const { width, height } = photo.technicalDetails
    if (width && height) {
      if (height > width) {
        tags.push('Portrait')
      } else if (width > height) {
        tags.push('Landscape')
      } else {
        tags.push('Square')
      }
    }
  }

  // Enhanced/edited tags
  if (photo.enhanced) {
    tags.push('Enhanced')
  }
  if (photo.bgRemoved) {
    tags.push('Background Removed')
  }

  return tags
}

/**
 * Get all unique smart tags from a collection of photos
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Array of unique smart tag objects with counts
 */
export const getAllSmartTags = (photos) => {
  if (!photos || photos.length === 0) {
    return []
  }

  const tagCounts = {}

  photos.forEach(photo => {
    const photoTags = deriveSmartTags(photo)
    photoTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  // Convert to array and sort by count (descending)
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Filter photos by smart tag
 * @param {Array} photos - Array of photo objects
 * @param {String} smartTag - Smart tag to filter by
 * @returns {Array} - Filtered photos
 */
export const filterBySmartTag = (photos, smartTag) => {
  if (!photos || photos.length === 0 || !smartTag) {
    return []
  }

  return photos.filter(photo => {
    const tags = deriveSmartTags(photo)
    return tags.includes(smartTag)
  })
}

/**
 * Get smart tag categories for UI organization
 * @returns {Object} - Categories with their tags
 */
export const getSmartTagCategories = () => {
  return {
    type: {
      label: 'Type',
      tags: ['Photo', 'Video']
    },
    status: {
      label: 'Status',
      tags: ['Favorite']
    },
    location: {
      label: 'Location',
      tags: ['With Location', 'No Location']
    },
    organization: {
      label: 'Organization',
      tags: ['Without Album']
    },
    orientation: {
      label: 'Orientation',
      tags: ['Portrait', 'Landscape', 'Square']
    },
    camera: {
      label: 'Camera',
      tags: ['Shot on iPhone', 'Shot on Samsung', 'Shot on Canon', 'Shot on Nikon', 'Shot on Sony']
    },
    edits: {
      label: 'Edits',
      tags: ['Enhanced', 'Background Removed']
    }
  }
}
