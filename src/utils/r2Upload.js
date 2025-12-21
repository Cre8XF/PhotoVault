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
 * Upload a file directly to Cloudflare R2 using presigned URL
 *
 * @param {File|Blob} file - The file to upload
 * @param {string} storagePath - The path in R2 (e.g., "users/abc123/album1/photo.jpg")
 * @param {string} contentType - MIME type of the file
 * @param {Object} metadata - Custom metadata to attach
 * @returns {Promise<string>} - The R2 URL of the uploaded file
 */
export async function uploadToR2(file, storagePath, contentType, metadata = {}) {
  try {
    // Get R2 upload endpoint from environment
    const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT
    const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL

    if (!R2_UPLOAD_ENDPOINT || !R2_PUBLIC_URL) {
      throw new Error('R2 configuration missing. Please set VITE_R2_UPLOAD_ENDPOINT and VITE_R2_PUBLIC_URL in .env')
    }

    // Step 1: Request presigned upload URL from our backend/worker
    const presignedResponse = await fetch(`${R2_UPLOAD_ENDPOINT}/get-presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: storagePath,
        contentType,
        metadata,
      }),
    })

    if (!presignedResponse.ok) {
      throw new Error(`Failed to get presigned URL: ${presignedResponse.statusText}`)
    }

    const { uploadUrl, publicUrl } = await presignedResponse.json()

    // Step 2: Upload file directly to R2 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error(`R2 upload failed: ${uploadResponse.statusText}`)
    }

    if (import.meta.env.DEV) {
      console.log('✅ [R2] File uploaded successfully:', {
        path: storagePath,
        url: publicUrl,
        size: file.size,
      })
    }

    return publicUrl
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
 * @param {Object} metadata - Custom metadata
 * @param {Function} firebaseFallback - Firebase upload function
 * @returns {Promise<{url: string, storage: 'r2'|'firebase'}>}
 */
export async function uploadWithFallback(
  file,
  storagePath,
  contentType,
  metadata,
  firebaseFallback
) {
  // Try R2 first if configured
  const R2_ENABLED = import.meta.env.VITE_R2_ENABLED === 'true'

  if (R2_ENABLED) {
    try {
      const url = await uploadToR2(file, storagePath, contentType, metadata)
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
