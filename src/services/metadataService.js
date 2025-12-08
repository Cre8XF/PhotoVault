// ============================================================================
// Metadata Service - R2 JSON Persistence (Phase 1)
// ============================================================================

/**
 * MetadataService handles all metadata persistence to Cloudflare R2
 * Replaces Firestore for metadata storage
 *
 * Architecture:
 * - Metadata stored as JSON in R2: {userId}/metadata.json
 * - Debounced saves (1 second)
 * - Full metadata object stored/retrieved
 * - Firebase Auth token for authentication
 */

const API_BASE_URL = import.meta.env.VITE_METADATA_API_URL || 'https://pixtr-metadata-api.your-subdomain.workers.dev'

// Debounce timeout reference
let saveTimeout = null

/**
 * Load metadata from R2
 * @param {string} userId - User ID
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>} Metadata object
 */
export async function loadMetadata(userId, idToken) {
  console.log('📥 [MetadataService] Loading metadata for user:', userId)

  try {
    const response = await fetch(`${API_BASE_URL}/api/metadata?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    })

    // If 404, return empty metadata (first time user)
    if (response.status === 404) {
      console.log('📭 [MetadataService] No metadata found (new user), returning empty metadata')
      return createEmptyMetadata(userId)
    }

    if (!response.ok) {
      console.error('❌ [MetadataService] Load failed:', response.status, response.statusText)
      return createEmptyMetadata(userId)
    }

    const metadata = await response.json()
    console.log('✅ [MetadataService] Metadata loaded successfully:', {
      version: metadata.version,
      userId: metadata.userId,
      photosCount: Object.keys(metadata.photos || {}).length,
      albumsCount: Object.keys(metadata.albums || {}).length,
      lastUpdated: metadata.lastUpdated,
    })

    return metadata
  } catch (error) {
    console.error('❌ [MetadataService] Load error:', error)
    return createEmptyMetadata(userId)
  }
}

/**
 * Save metadata to R2
 * @param {string} userId - User ID
 * @param {string} idToken - Firebase ID token
 * @param {Object} metadata - Full metadata object
 * @returns {Promise<boolean>} Success status
 */
export async function saveMetadata(userId, idToken, metadata) {
  console.log('💾 [MetadataService] Saving metadata for user:', userId)

  try {
    // Ensure metadata has required structure
    const validMetadata = {
      version: '1.0',
      userId: userId,
      lastUpdated: new Date().toISOString(),
      photos: metadata.photos || {},
      albums: metadata.albums || {},
      settings: metadata.settings || {},
    }

    console.log('📤 [MetadataService] Metadata structure:', {
      version: validMetadata.version,
      photosCount: Object.keys(validMetadata.photos).length,
      albumsCount: Object.keys(validMetadata.albums).length,
    })

    const response = await fetch(`${API_BASE_URL}/api/metadata`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validMetadata),
    })

    if (!response.ok) {
      console.error('❌ [MetadataService] Save failed:', response.status, response.statusText)
      return false
    }

    console.log('✅ [MetadataService] Metadata saved successfully')
    return true
  } catch (error) {
    console.error('❌ [MetadataService] Save error:', error)
    return false
  }
}

/**
 * Debounced save - waits 1 second before saving
 * @param {string} userId - User ID
 * @param {string} idToken - Firebase ID token
 * @param {Object} metadata - Full metadata object
 */
export function debouncedSave(userId, idToken, metadata) {
  // Clear previous timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  console.log('⏱️ [MetadataService] Debounced save scheduled (1s)')

  // Schedule new save
  saveTimeout = setTimeout(async () => {
    await saveMetadata(userId, idToken, metadata)
  }, 1000)
}

/**
 * Force immediate save (no debounce)
 * @param {string} userId - User ID
 * @param {string} idToken - Firebase ID token
 * @param {Object} metadata - Full metadata object
 * @returns {Promise<boolean>} Success status
 */
export async function forceSave(userId, idToken, metadata) {
  // Clear any pending debounced save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  console.log('⚡ [MetadataService] Force save (immediate)')
  return await saveMetadata(userId, idToken, metadata)
}

/**
 * Create empty metadata structure
 * @param {string} userId - User ID
 * @returns {Object} Empty metadata object
 */
function createEmptyMetadata(userId) {
  return {
    version: '1.0',
    userId: userId,
    lastUpdated: new Date().toISOString(),
    photos: {},
    albums: {},
    settings: {},
  }
}

/**
 * Convert array to object (keyed by id)
 * @param {Array} array - Array of items with id property
 * @returns {Object} Object keyed by id
 */
export function arrayToObject(array) {
  if (!Array.isArray(array)) {
    console.warn('⚠️ [MetadataService] arrayToObject received non-array:', typeof array)
    return {}
  }

  return array.reduce((acc, item) => {
    if (item && item.id) {
      acc[item.id] = item
    }
    return acc
  }, {})
}

/**
 * Convert object to array
 * @param {Object} obj - Object keyed by id
 * @returns {Array} Array of items
 */
export function objectToArray(obj) {
  if (!obj || typeof obj !== 'object') {
    console.warn('⚠️ [MetadataService] objectToArray received invalid input:', typeof obj)
    return []
  }

  return Object.values(obj)
}
