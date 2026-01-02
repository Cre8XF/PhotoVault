// ============================================================================
import { devLog, devWarn } from './log'
// R2 Upload Utility - Cloudflare R2 Storage
// ============================================================================
//
// This utility provides direct upload to Cloudflare R2 storage.
// R2 is S3-compatible, so we use standard S3 upload patterns.
//
// ARCHITECTURE:
// - Media files → R2 bucket (pixtr-photos)
// - Metadata → Firestore
// - Worker → Provides presigned URLs and metadata sync
//
// ============================================================================

/**
 * Upload a file to Cloudflare R2 via Worker proxy
 *
 * ARCHITECTURE:
 * Browser → Worker → R2
 *
 * This approach is required because:
 * - R2 cannot accept secure uploads directly from the browser
 * - The Worker verifies authentication and uploads using server-side credentials
 *
 * @param {File|Blob} file - The file to upload
 * @param {string} storagePath - The path in R2 (e.g., "users/abc123/album1/photo.jpg")
 * @param {string} contentType - MIME type of the file
 * @param {Object} metadata - Custom metadata (albumId, etc.)
 * @param {string} userId - User ID (for validation)
 * @param {string} firebaseToken - Firebase ID token for authentication
 * @returns {Promise<string>} - The R2 URL of the uploaded file
 */
export async function uploadToR2(
  file,
  storagePath,
  contentType,
  metadata = {},
  userId,
  firebaseToken
) {
  try {
    // Get R2 upload endpoint from environment
    const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT
    const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL

    if (!R2_UPLOAD_ENDPOINT || !R2_PUBLIC_URL) {
      throw new Error(
        'R2 configuration missing. Please set VITE_R2_UPLOAD_ENDPOINT and VITE_R2_PUBLIC_URL in .env'
      )
    }

    if (!userId) {
      throw new Error('userId is required for R2 upload')
    }

    if (!firebaseToken) {
      throw new Error('Firebase token is required for R2 upload')
    }

    // Create FormData for multipart upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('storagePath', storagePath)
    formData.append('contentType', contentType)
    if (metadata.albumId) {
      formData.append('albumId', metadata.albumId)
    }

    devLog('🟣 [R2] Sending upload to Worker', {
      url: `${R2_UPLOAD_ENDPOINT}/upload`,
      storagePath,
      contentType,
      albumId: metadata?.albumId,
    })

    // Upload to Worker endpoint
    const uploadResponse = await fetch(`${R2_UPLOAD_ENDPOINT}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
      },
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}))

      // Handle specific error codes from worker
      if (errorData.errorCode) {
        const error = new Error(errorData.error || 'Upload failed')
        error.code = errorData.errorCode
        error.errorCode = errorData.errorCode
        error.details = errorData // Include all error details
        throw error
      }

      throw new Error(
        errorData.error || `R2 upload failed: ${uploadResponse.statusText}`
      )
    }

    const result = await uploadResponse.json()

    if (!result.success || !result.r2Url) {
      throw new Error('Invalid response from upload worker')
    }

    if (import.meta.env.DEV) {
      devLog('✅ [R2] File uploaded successfully via Worker:', {
        path: storagePath,
        url: result.r2Url,
        size: result.size,
        backend: result.storageBackend,
      })
    }

    return result.r2Url
  } catch (error) {
    console.error('❌ [R2] Upload error:', error)
    throw error
  }
}

/**
 * Upload file to R2 (R2-only, no fallback)
 *
 * @param {File|Blob} file - The file to upload
 * @param {string} storagePath - Storage path
 * @param {string} contentType - MIME type
 * @param {Object} metadata - Custom metadata (should include albumId if applicable)
 * @param {Function} firebaseFallback - DEPRECATED: Not used (kept for API compatibility)
 * @param {string} userId - User ID (required for R2)
 * @param {string} firebaseToken - Firebase ID token (required for R2 auth)
 * @returns {Promise<{url: string, storage: 'r2'}>}
 */
export async function uploadWithFallback(
  file,
  storagePath,
  contentType,
  metadata,
  firebaseFallback,
  userId = null,
  firebaseToken = null
) {
  // R2-only upload - no Firebase Storage fallback
  const R2_ENABLED = import.meta.env.VITE_R2_ENABLED === 'true'

  if (!R2_ENABLED) {
    throw new Error('R2 storage is not enabled. Please configure R2 environment variables.')
  }

  devLog('🟣 [R2] R2-only upload (no fallback)', {
    endpoint: import.meta.env.VITE_R2_UPLOAD_ENDPOINT,
    userId,
    hasToken: !!firebaseToken,
    fileName: file?.name,
    fileType: contentType,
  })

  const url = await uploadToR2(
    file,
    storagePath,
    contentType,
    metadata,
    userId,
    firebaseToken
  )

  return { url, storage: 'r2' }
}

/**
 * Get public URL for an R2 object
 *
 * @param {string} storagePath - Path in R2
 * @returns {string} - Public URL
 */
export function getR2PublicUrl(storagePath) {
  const R2_PUBLIC_URL =
    import.meta.env.VITE_R2_PUBLIC_URL || 'https://photos.pixtr.cloud'
  return `${R2_PUBLIC_URL}/${storagePath}`
}

/**
 * Check if R2 is enabled and configured
 *
 * @returns {boolean}
 */
export function isR2Enabled() {
  const R2_ENABLED = import.meta.env.VITE_R2_ENABLED === 'true'
  const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL

  return R2_ENABLED && !!R2_UPLOAD_ENDPOINT && !!R2_PUBLIC_URL
}

/**
 * Extract R2 storagePath from r2Url
 *
 * Converts: https://images.pixtr.cloud/users/abc123/photos/image.jpg
 * To:       users/abc123/photos/image.jpg
 *
 * @param {string} r2Url - Full R2 URL
 * @returns {string|null} - storagePath or null if invalid
 */
export function extractStoragePathFromR2Url(r2Url) {
  if (!r2Url) return null

  try {
    const url = new URL(r2Url)
    // Remove leading slash from pathname
    return url.pathname.substring(1)
  } catch (error) {
    console.error('❌ [R2] Failed to extract storagePath from r2Url:', error)
    return null
  }
}

/**
 * Delete file from R2 via Worker proxy
 *
 * @param {string} storagePath - The R2 storage path (e.g., "users/abc123/photos/image.jpg")
 * @param {string} firebaseToken - Firebase ID token for authentication
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteFromR2(storagePath, firebaseToken) {
  try {
    const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT

    if (!R2_UPLOAD_ENDPOINT) {
      throw new Error('R2 configuration missing. Please set VITE_R2_UPLOAD_ENDPOINT in .env')
    }

    if (!firebaseToken) {
      throw new Error('Firebase token is required for R2 deletion')
    }

    if (!storagePath) {
      throw new Error('storagePath is required for R2 deletion')
    }

    if (import.meta.env.DEV) {
      devLog('🗑️ [R2] Sending delete request to Worker', {
        url: `${R2_UPLOAD_ENDPOINT}/delete`,
        storagePath,
      })
    }

    // Send DELETE request to Worker
    const deleteResponse = await fetch(`${R2_UPLOAD_ENDPOINT}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify({ storagePath }),
    })

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json().catch(() => ({}))
      throw new Error(
        errorData.error || `R2 delete failed: ${deleteResponse.statusText}`
      )
    }

    const result = await deleteResponse.json()

    if (!result.success) {
      throw new Error('Invalid response from delete worker')
    }

    if (import.meta.env.DEV) {
      devLog('✅ [R2] File deleted successfully via Worker:', {
        storagePath,
        message: result.message,
      })
    }

    return true
  } catch (error) {
    console.error('❌ [R2] Delete error:', error)
    throw error
  }
}

/**
 * Delete all R2 objects for a user (bulk deletion)
 * Used when deleting a user account
 *
 * @param {Array} photos - Array of photo objects with r2Url or storagePath
 * @param {string} firebaseToken - Firebase ID token for authentication
 * @returns {Promise<{success: number, failed: number, errors: Array}>}
 */
export async function deleteAllUserR2Objects(photos, firebaseToken) {
  if (!photos || photos.length === 0) {
    devLog('⚠️ [R2] No photos to delete')
    return { success: 0, failed: 0, errors: [] }
  }

  devLog(`🗑️ [R2] Starting bulk deletion of ${photos.length} objects...`)

  let successCount = 0
  let failedCount = 0
  const errors = []

  // Delete photos in batches to avoid overwhelming the Worker
  const BATCH_SIZE = 10
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE)
    const batchPromises = batch.map(async (photo) => {
      try {
        // Only delete if photo is stored in R2
        if (!photo.r2Url && photo.storageBackend !== 'r2') {
          devLog(`⚠️ [R2] Skipping non-R2 photo: ${photo.id}`)
          return
        }

        // Extract storage path
        const storagePath =
          photo.storagePath || extractStoragePathFromR2Url(photo.r2Url)

        if (!storagePath) {
          devWarn(`⚠️ [R2] No storagePath for photo ${photo.id}, skipping`)
          return
        }

        // Delete from R2
        await deleteFromR2(storagePath, firebaseToken)
        successCount++
      } catch (error) {
        console.error(`❌ [R2] Failed to delete photo ${photo.id}:`, error)
        failedCount++
        errors.push({
          photoId: photo.id,
          error: error.message,
        })
      }
    })

    // Wait for batch to complete before moving to next batch
    await Promise.allSettled(batchPromises)

    // Log progress
    devLog(
      `🗑️ [R2] Batch ${Math.floor(i / BATCH_SIZE) + 1} complete. Progress: ${successCount + failedCount}/${photos.length}`
    )
  }

  devLog(`✅ [R2] Bulk deletion complete. Success: ${successCount}, Failed: ${failedCount}`)

  return { success: successCount, failed: failedCount, errors }
}
