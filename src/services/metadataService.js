// ============================================================================
// METADATA SERVICE – DEV FALLBACK + PROD WORKER
// ============================================================================

const IS_DEV = import.meta.env.DEV
const METADATA_API_URL = import.meta.env.VITE_METADATA_API_URL

console.warn(
  IS_DEV
    ? '🟣 [MetadataService] DEV MODE: Cloudflare metadata backend DISABLED (fallback JSON).'
    : '🟢 [MetadataService] PROD MODE: Cloudflare metadata backend ENABLED.'
)

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
  if (IS_DEV || !METADATA_API_URL) {
    console.log('🟣 [MetadataService] DEV fallback metadata used.')
    return getEmptyMetadata(userId)
  }

  try {
    console.log(
      `📡 [MetadataService] Fetching metadata from worker for: ${userId}`
    )

    const idToken = await getFirebaseToken()

    const response = await fetch(
      `${METADATA_API_URL}/api/metadata?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error(
        '[MetadataService] Failed to load metadata:',
        response.status
      )
      return getEmptyMetadata(userId)
    }

    const data = await response.json()
    console.log('📥 [MetadataService] Loaded metadata:', data)

    return data
  } catch (err) {
    console.error('❌ [MetadataService] Error loading metadata:', err)
    return getEmptyMetadata(userId)
  }
}

// ---------------------------------------------------------------------------
// Save metadata
// ---------------------------------------------------------------------------

export async function saveMetadata(metadata) {
  if (!metadata || !metadata.userId) {
    console.error('[MetadataService] Invalid metadata object:', metadata)
    return false
  }

  // DEV MODE – skip saving
  if (IS_DEV || !METADATA_API_URL) {
    console.log('🟣 [MetadataService] DEV mode: metadata NOT saved to backend.')
    return true
  }

  try {
    console.log(`📡 [MetadataService] Saving metadata for ${metadata.userId}`)

    const idToken = await getFirebaseToken()

    metadata.lastUpdated = new Date().toISOString()

    const response = await fetch(`${METADATA_API_URL}/api/metadata`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      console.error(
        '[MetadataService] Failed to save metadata:',
        response.status
      )
      return false
    }

    console.log('💾 [MetadataService] Metadata saved successfully!')
    return true
  } catch (err) {
    console.error('❌ [MetadataService] Error saving metadata:', err)
    return false
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
