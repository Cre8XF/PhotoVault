// ============================================================================
// METADATA SERVICE – R2-BASED METADATA SYSTEM
// ============================================================================

const IS_DEV = import.meta.env.DEV
const METADATA_API_URL = import.meta.env.VITE_METADATA_API_URL

// ✅ CRITICAL: Log configuration on startup
console.warn(
  IS_DEV
    ? '🟣 [MetadataService] DEV MODE: Cloudflare metadata backend DISABLED (fallback JSON).'
    : '🟢 [MetadataService] PROD MODE: Cloudflare metadata backend ENABLED.'
)

console.log('[MetadataService] Configuration:', {
  IS_DEV,
  METADATA_API_URL: METADATA_API_URL || 'NOT SET',
  mode: import.meta.env.MODE,
})

// CRITICAL WARNING if production mode but no API URL
if (!IS_DEV && !METADATA_API_URL) {
  console.error(
    '❌❌❌ CRITICAL: VITE_METADATA_API_URL is NOT SET in production build! ' +
    'Metadata will NOT be loaded from R2. Albums/photos will appear empty. ' +
    'Please set VITE_METADATA_API_URL environment variable and rebuild.'
  )
}

// ---------------------------------------------------------------------------
// Shared empty metadata structure
// ---------------------------------------------------------------------------

function getEmptyMetadata(userId) {
  return {
    version: '1.0',
    userId,
    lastUpdated: new Date().toISOString(),
    photos: {},
    albums: {},
    settings: {
      language: 'no',
      theme: 'dark',
      autoCompress: false,
    },
  }
}

// ---------------------------------------------------------------------------
// Load metadata
// ---------------------------------------------------------------------------

export async function loadMetadata(userId) {
  if (!userId) {
    console.error('[MetadataService] Missing userId!')
    return getEmptyMetadata('unknown')
  }

  // DEV MODE – return local empty structure
  if (IS_DEV) {
    console.log('🟣 [MetadataService] DEV mode: returning empty metadata (local development)')
    return getEmptyMetadata(userId)
  }

  // ❌ CRITICAL: If METADATA_API_URL not set in production, throw error
  if (!METADATA_API_URL) {
    console.error(
      '❌ [MetadataService] VITE_METADATA_API_URL is NOT SET! ' +
      'Cannot load metadata from R2. This is a configuration error. ' +
      'Returning empty metadata as fallback.'
    )
    return getEmptyMetadata(userId)
  }

  try {
    const url = `${METADATA_API_URL}/api/metadata?userId=${userId}`
    console.log(`📡 [MetadataService] GET -> ${url}`)

    const idToken = await getFirebaseToken()
    console.log(`[MetadataService] Token prefix: ${idToken.substring(0, 15)}...`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`[MetadataService] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `❌ [MetadataService] Failed to load metadata: ${response.status} ${response.statusText}`,
        errorText
      )
      return getEmptyMetadata(userId)
    }

    const data = await response.json()
    console.log(`📥 [MetadataService] Response:`, data)
    console.log(`✅ [MetadataService] Loaded metadata successfully (albums: ${Object.keys(data.albums || {}).length}, photos: ${Object.keys(data.photos || {}).length})`)

    return data
  } catch (err) {
    console.error('❌ [MetadataService] Error loading metadata:', err)
    console.error('Stack trace:', err.stack)
    return getEmptyMetadata(userId)
  }
}

// ---------------------------------------------------------------------------
// Save metadata
// ---------------------------------------------------------------------------

export async function saveMetadata(metadata) {
  if (!metadata || !metadata.userId) {
    console.error('[MetadataService] Invalid metadata object:', metadata)
    return null
  }

  // DEV MODE – skip saving
  if (IS_DEV) {
    console.log('🟣 [MetadataService] DEV mode: metadata NOT saved to backend.')
    return metadata
  }

  // ❌ CRITICAL: If METADATA_API_URL not set in production, throw error
  if (!METADATA_API_URL) {
    console.error(
      '❌ [MetadataService] VITE_METADATA_API_URL is NOT SET! ' +
      'Cannot save metadata to R2. This is a configuration error.'
    )
    return null
  }

  try {
    const url = `${METADATA_API_URL}/api/metadata`
    console.log(`📡 [MetadataService] POST -> ${url}`)

    const idToken = await getFirebaseToken()
    console.log(`[MetadataService] Token prefix: ${idToken.substring(0, 15)}...`)

    metadata.lastUpdated = new Date().toISOString()
    console.log(`[MetadataService] Saving metadata for ${metadata.userId} (albums: ${Object.keys(metadata.albums || {}).length}, photos: ${Object.keys(metadata.photos || {}).length})`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })

    console.log(`[MetadataService] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `❌ [MetadataService] Failed to save metadata: ${response.status} ${response.statusText}`,
        errorText
      )
      return null
    }

    const savedMetadata = await response.json()
    console.log(`📥 [MetadataService] Response:`, savedMetadata)
    console.log('💾 [MetadataService] Metadata saved successfully!')

    return savedMetadata
  } catch (err) {
    console.error('❌ [MetadataService] Error saving metadata:', err)
    console.error('Stack trace:', err.stack)
    return null
  }
}

// ---------------------------------------------------------------------------
// Firebase token helper
// ---------------------------------------------------------------------------

async function getFirebaseToken() {
  try {
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      throw new Error('No authenticated user')
    }
    return await user.getIdToken()
  } catch (err) {
    console.error('❌ [MetadataService] Failed to get Firebase token:', err)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Array/Object conversion helpers (for Zustand store)
// ---------------------------------------------------------------------------

/**
 * Convert array of objects to object keyed by ID
 * @param {Array} arr - Array of objects with 'id' property
 * @returns {Object} Object keyed by ID
 */
export function arrayToObject(arr) {
  if (!Array.isArray(arr)) {
    console.warn('[MetadataService] arrayToObject received non-array:', arr)
    return {}
  }
  return arr.reduce((acc, item) => {
    if (item && item.id) {
      acc[item.id] = item
    }
    return acc
  }, {})
}

/**
 * Convert object to array of values
 * @param {Object} obj - Object to convert
 * @returns {Array} Array of values
 */
export function objectToArray(obj) {
  if (!obj || typeof obj !== 'object') {
    console.warn('[MetadataService] objectToArray received non-object:', obj)
    return []
  }
  return Object.values(obj)
}

// ---------------------------------------------------------------------------
// Debounced save (for store)
// ---------------------------------------------------------------------------

let saveTimeout = null

/**
 * Debounced save metadata to R2
 * @param {string} userId - User ID
 * @param {string} idToken - Firebase ID token
 * @param {Object} metadata - Metadata object
 */
export function debouncedSave(userId, idToken, metadata) {
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Schedule save after 2 seconds
  saveTimeout = setTimeout(async () => {
    console.log('⏰ [MetadataService] Debounced save triggered')
    await saveMetadata(metadata)
  }, 2000)
}

/**
 * Force immediate save to R2
 * @param {string} userId - User ID
 * @param {string} idToken - Firebase ID token
 * @param {Object} metadata - Metadata object
 */
export async function forceSave(userId, idToken, metadata) {
  console.log('⚡ [MetadataService] Force save triggered')

  // Clear any pending debounced saves
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  return await saveMetadata(metadata)
}
