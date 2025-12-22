// ============================================================================
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
export async function uploadToR2(file, storagePath, contentType, metadata = {}, userId, firebaseToken) {
  try {
    // Get R2 upload endpoint from environment
    const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT
    const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL

    if (!R2_UPLOAD_ENDPOINT || !R2_PUBLIC_URL) {
      throw new Error('R2 configuration missing. Please set VITE_R2_UPLOAD_ENDPOINT and VITE_R2_PUBLIC_URL in .env')
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

    // Upload to Worker endpoint
    const uploadResponse = await fetch(`${R2_UPLOAD_ENDPOINT}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
      },
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}))
      throw new Error(errorData.error || `R2 upload failed: ${uploadResponse.statusText}`)
    }

    const result = await uploadResponse.json()

    if (!result.success || !result.r2Url) {
      throw new Error('Invalid response from upload worker')
    }

    if (import.meta.env.DEV) {
      console.log('✅ [R2] File uploaded successfully via Worker:', {
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
 * Upload file to R2 with automatic fallback to Firebase Storage
 *
 * @param {File|Blob} file - The file to upload
 * @param {string} storagePath - Storage path
 * @param {string} contentType - MIME type
 * @param {Object} metadata - Custom metadata (should include albumId if applicable)
 * @param {Function} firebaseFallback - Firebase upload function
 * @param {string} userId - User ID (required for R2)
 * @param {string} firebaseToken - Firebase ID token (required for R2 auth)
 * @returns {Promise<{url: string, storage: 'r2'|'firebase'}>}
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
  // Try R2 first if configured
  const R2_ENABLED = import.meta.env.VITE_R2_ENABLED === 'true'

  if (R2_ENABLED) {
    try {
      const url = await uploadToR2(file, storagePath, contentType, metadata, userId, firebaseToken)
      return { url, storage: 'r2' }
    } catch (r2Error) {
      console.error('❌ [R2] Upload failed, falling back to Firebase:', r2Error)
      // Fall through to Firebase fallback
    }
  }

  // Fallback to Firebase Storage
  if (firebaseFallback) {
    const url = await firebaseFallback()
    return { url, storage: 'firebase' }
  }

  throw new Error('No storage backend available')
}

/**
 * Get public URL for an R2 object
 *
 * @param {string} storagePath - Path in R2
 * @returns {string} - Public URL
 */
export function getR2PublicUrl(storagePath) {
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://photos.pixtr.cloud'
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
