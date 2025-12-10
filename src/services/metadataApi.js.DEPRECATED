// ============================================================================
// SERVICE: metadataApi.js – Cloudflare Metadata Engine Client
// ============================================================================

const METADATA_API_URL = import.meta.env.VITE_METADATA_API_URL || 'https://metadata-worker.your-domain.workers.dev'
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''

/**
 * Fetch albums from KV for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of album objects
 */
export async function fetchAlbumsFromKV(userId) {
  try {
    const response = await fetch(`${METADATA_API_URL}/api/metadata?userId=${userId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`)
    }

    const metadata = await response.json()

    // Convert albums object to array
    const albumsArray = Object.values(metadata.albums || {}).map(album => ({
      id: album.id,
      name: album.name,
      userId: userId,
      photoCount: album.photos?.length || 0,
      coverPhoto: album.photos?.[0] || null,
      createdAt: album.createdAt || new Date().toISOString(),
      updatedAt: metadata.lastUpdated,
    }))

    console.log(`✅ Loaded ${albumsArray.length} albums from KV for user ${userId}`)
    return albumsArray
  } catch (error) {
    console.error('Error fetching albums from KV:', error)
    throw error
  }
}

/**
 * Fetch photos from KV for a user
 * @param {string} userId - User ID
 * @param {string} albumId - Optional album ID to filter by
 * @returns {Promise<Array>} - Array of photo objects
 */
export async function fetchPhotosFromKV(userId, albumId = null) {
  try {
    const response = await fetch(`${METADATA_API_URL}/api/metadata?userId=${userId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`)
    }

    const metadata = await response.json()

    // Flatten all photos from all albums
    let photosArray = []

    for (const album of Object.values(metadata.albums || {})) {
      for (const photo of album.photos || []) {
        photosArray.push({
          id: photo.key, // Use R2 key as ID
          name: photo.key.split('/').pop(),
          url: generatePresignedUrl(photo.key), // TODO: Implement presigned URL generation
          userId: userId,
          albumId: album.id === 'unassigned' ? null : album.id,
          storagePath: photo.key,
          size: photo.size,
          type: photo.httpMetadata?.contentType || 'image/jpeg',
          favorite: false, // TODO: Store favorites in metadata
          createdAt: photo.uploaded || new Date().toISOString(),
          updatedAt: photo.uploaded || new Date().toISOString(),
        })
      }
    }

    // Filter by album if specified
    if (albumId) {
      photosArray = photosArray.filter(photo => photo.albumId === albumId)
    }

    console.log(`✅ Loaded ${photosArray.length} photos from KV for user ${userId}`)
    return photosArray
  } catch (error) {
    console.error('Error fetching photos from KV:', error)
    throw error
  }
}

/**
 * Fetch timeline photos (sorted by date) from KV
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of photo objects sorted by date
 */
export async function fetchTimelineFromKV(userId) {
  try {
    const photos = await fetchPhotosFromKV(userId)

    // Sort by createdAt (newest first)
    photos.sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return dateB - dateA
    })

    return photos
  } catch (error) {
    console.error('Error fetching timeline from KV:', error)
    throw error
  }
}

/**
 * Repair metadata for all users (admin only)
 * @returns {Promise<Object>} - Repair result
 */
export async function repairAllUsers() {
  try {
    if (!ADMIN_TOKEN) {
      throw new Error('Admin token not configured')
    }

    const response = await fetch(`${METADATA_API_URL}/api/repair-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Repair failed: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Repair all users complete:', result)

    return result
  } catch (error) {
    console.error('Error repairing all users:', error)
    throw error
  }
}

/**
 * Repair metadata for specific user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Repair result
 */
export async function repairUserMetadata(userId) {
  try {
    const response = await fetch(`${METADATA_API_URL}/api/repair?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Repair failed: ${response.status}`)
    }

    const result = await response.json()
    console.log(`✅ Repair complete for user ${userId}:`, result)

    return result
  } catch (error) {
    console.error(`Error repairing user ${userId}:`, error)
    throw error
  }
}

/**
 * Check if file exists in R2
 * @param {string} storagePath - R2 storage path
 * @returns {Promise<boolean>} - True if file exists
 */
export async function checkFileExists(storagePath) {
  try {
    const response = await fetch(
      `${METADATA_API_URL}/api/check-file?path=${encodeURIComponent(storagePath)}`
    )

    if (!response.ok) {
      return false
    }

    const result = await response.json()
    return result.exists
  } catch (error) {
    console.error('Error checking file existence:', error)
    return false
  }
}

/**
 * List orphaned files for user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of orphaned file objects
 */
export async function listOrphanedFiles(userId) {
  try {
    const response = await fetch(`${METADATA_API_URL}/api/list-orphans?userId=${userId}`)

    if (!response.ok) {
      throw new Error(`Failed to list orphans: ${response.status}`)
    }

    const result = await response.json()
    return result.orphans || []
  } catch (error) {
    console.error('Error listing orphaned files:', error)
    return []
  }
}

/**
 * Generate presigned URL for R2 object
 * TODO: Implement actual presigned URL generation via worker
 * @param {string} key - R2 object key
 * @returns {string} - Presigned URL (placeholder for now)
 */
function generatePresignedUrl(key) {
  // Placeholder: Return a URL that will be replaced by actual presigned URL
  // In production, this should call a worker endpoint that generates signed URLs
  return `https://pixtr-photos.r2.cloudflarestorage.com/${key}`
}
