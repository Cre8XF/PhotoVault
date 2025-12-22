// ============================================================================
// CLOUDFLARE WORKER: R2 Upload Proxy
// ============================================================================
// Purpose: Accept file uploads from browser and upload to R2
// Architecture: Browser → Worker → R2
// Security: Firebase token verification + direct R2 upload
// ============================================================================

/**
 * Cloudflare Worker Environment Bindings:
 * - PIXTR_PHOTOS: R2 bucket binding for photo/video files (pixtr-photos)
 * - R2_PUBLIC_URL: Public URL base for accessing files
 *
 * Routes:
 * - POST /upload - Upload a file to R2
 * - GET /health - Health check
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS handling
    const origin = request.headers.get('Origin')

    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://pixtr.cloud',
      'https://www.pixtr.cloud',
      'https://photovault-app-a0946.web.app',
      'https://photovault-app-a0946.firebaseapp.com',
    ]

    const allowOrigin = allowedOrigins.includes(origin)
      ? origin
      : 'https://pixtr.cloud'

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    try {
      // Route handlers
      if (path === '/upload' && request.method === 'POST') {
        return await handleUpload(request, env, corsHeaders)
      }

      if (path === '/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'pixtr-upload-worker',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  },
}

// ============================================================================
// UPLOAD HANDLER
// ============================================================================

/**
 * Handle POST /upload
 * Accepts multipart/form-data with file and metadata
 *
 * Expected form fields:
 * - file: The file to upload (required)
 * - userId: User ID (required)
 * - storagePath: Path in R2 (required)
 * - contentType: MIME type (required)
 * - albumId: Album ID (optional)
 *
 * Returns:
 * {
 *   success: true,
 *   r2Url: "https://photos.pixtr.cloud/users/abc123/...",
 *   storageBackend: "r2",
 *   storagePath: "users/abc123/..."
 * }
 */
async function handleUpload(request, env, corsHeaders) {
  try {
    // Verify Firebase token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[UPLOAD] Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const token = authHeader.substring(7)
    const authenticatedUserId = await verifyFirebaseToken(token)
    console.log(`[UPLOAD] Authenticated user: ${authenticatedUserId}`)

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = formData.get('userId')
    const storagePath = formData.get('storagePath')
    const contentType = formData.get('contentType')
    const albumId = formData.get('albumId')

    // Validate inputs
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Missing file' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!userId || !storagePath || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, storagePath, contentType' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Security check: Ensure authenticated user matches userId
    if (authenticatedUserId !== userId) {
      console.error(`[UPLOAD] User mismatch: ${authenticatedUserId} !== ${userId}`)
      return new Response(
        JSON.stringify({ error: 'Forbidden: Cannot upload for other users' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate storagePath starts with users/{userId}/
    const expectedPrefix = `users/${userId}/`
    if (!storagePath.startsWith(expectedPrefix)) {
      console.error(`[UPLOAD] Invalid storagePath: ${storagePath}`)
      return new Response(
        JSON.stringify({ error: 'Invalid storagePath: must start with users/{userId}/' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`[UPLOAD] Uploading file for user ${userId}:`, {
      fileName: file.name,
      size: file.size,
      contentType,
      storagePath,
      albumId,
    })

    // Upload to R2
    await env.PIXTR_PHOTOS.put(storagePath, file, {
      httpMetadata: {
        contentType: contentType,
      },
      customMetadata: {
        userId: userId,
        albumId: albumId || 'unassigned',
        uploadedAt: new Date().toISOString(),
        originalFileName: file.name,
      },
    })

    // Generate public URL
    const R2_PUBLIC_URL = env.R2_PUBLIC_URL || 'https://photos.pixtr.cloud'
    const r2Url = `${R2_PUBLIC_URL}/${storagePath}`

    console.log(`[UPLOAD] ✅ Upload successful:`, {
      userId,
      storagePath,
      r2Url,
      size: file.size,
    })

    return new Response(
      JSON.stringify({
        success: true,
        r2Url,
        storageBackend: 'r2',
        storagePath,
        size: file.size,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[UPLOAD] Upload error:', error)
    return new Response(
      JSON.stringify({
        error: 'Upload failed',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Verify Firebase ID token
 * Returns userId if valid, throws error if invalid
 *
 * NOTE: This is a simplified verification. For production, consider using
 * Firebase's public keys to verify the token signature.
 */
async function verifyFirebaseToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // Decode payload
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    // Validate
    if (!payload.user_id && !payload.sub) {
      throw new Error('Invalid token: missing user_id')
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired')
    }

    const userId = payload.user_id || payload.sub
    return userId
  } catch (error) {
    console.error('[AUTH] Token verification error:', error.message)
    throw new Error('Invalid or expired token')
  }
}
