// ============================================================================
// Pixtr Metadata API - Cloudflare Worker (Phase 1)
// ============================================================================

/**
 * Cloudflare Worker for R2 metadata persistence
 * Handles GET/POST requests for user metadata JSON files
 *
 * Architecture:
 * - R2 bucket: pixtr-metadata
 * - Path: {userId}/metadata.json
 * - Authentication: Firebase ID token verification
 */

/**
 * Main Worker entry point
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

      // Pixtr PROD
      'https://pixtr.cloud',
      'https://www.pixtr.cloud',

      // Firebase legacy apps
      'https://photovault-app-a0946.web.app',
      'https://photovault-app-a0946.firebaseapp.com',

      // Cloudflare Worker URLS (kritiskt!)
      'https://pixtr-metadata-api.rogsor80.workers.dev',
    ]

    // Bestem hvilken origin som skal tillates
    const allowOrigin = allowedOrigins.includes(origin)
      ? origin
      : 'https://pixtr.cloud' // fallback i prod

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    try {
      // Route handlers
      if (path === '/api/metadata' && request.method === 'GET') {
        return await handleGetMetadata(request, env, corsHeaders)
      }

      if (path === '/api/metadata' && request.method === 'POST') {
        return await handlePostMetadata(request, env, corsHeaders)
      }

      // Health check endpoint
      if (path === '/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'pixtr-metadata-api',
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

/**
 * Handle GET /api/metadata
 * Retrieve metadata JSON from R2
 */
async function handleGetMetadata(request, env, corsHeaders) {
  try {
    // Extract userId from query params
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    console.log(`[GET] userId = ${userId}`)

    if (!userId) {
      console.error('[GET] Missing userId parameter')
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify Firebase token
    const authHeader = request.headers.get('Authorization')
    console.log(`[AUTH] Authorization header: ${authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING'}`)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[AUTH] Invalid or missing Authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.substring(7)
    const tokenUserId = await verifyFirebaseToken(token)
    console.log(`[AUTH] Decoded user: ${tokenUserId}`)

    // Ensure user can only access their own metadata
    if (tokenUserId !== userId) {
      console.error(`[AUTH] Token userId (${tokenUserId}) does not match requested userId (${userId})`)
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Read from R2
    const objectKey = `${userId}/metadata.json`
    console.log(`[GET] Reading metadata from R2: ${objectKey}`)

    const object = await env.PIXTR_METADATA.get(objectKey)

    if (object === null) {
      console.log(`[GET] Metadata not found in R2, returning empty structure: ${objectKey}`)
      // Return empty metadata structure instead of 404
      const emptyMetadata = {
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
      return new Response(JSON.stringify(emptyMetadata), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const metadata = await object.json()
    console.log(`[GET] Metadata retrieved successfully: ${objectKey} (${JSON.stringify(metadata).length} bytes)`)

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[GET] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to retrieve metadata',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Handle POST /api/metadata
 * Save metadata JSON to R2
 */
async function handlePostMetadata(request, env, corsHeaders) {
  try {
    // Verify Firebase token
    const authHeader = request.headers.get('Authorization')
    console.log(`[AUTH] Authorization header: ${authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING'}`)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[AUTH] Invalid or missing Authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.substring(7)
    const tokenUserId = await verifyFirebaseToken(token)
    console.log(`[AUTH] Firebase user = ${tokenUserId}`)

    // Parse request body
    const metadata = await request.json()
    console.log(`[POST] Received metadata for userId: ${metadata.userId}`)

    // Validate metadata structure
    if (!metadata.userId || !metadata.version) {
      console.error('[POST] Invalid metadata structure - missing userId or version')
      return new Response(
        JSON.stringify({ error: 'Invalid metadata structure' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Ensure user can only save their own metadata
    if (tokenUserId !== metadata.userId) {
      console.error(`[AUTH] Token userId (${tokenUserId}) does not match metadata userId (${metadata.userId})`)
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Write to R2
    const objectKey = `${metadata.userId}/metadata.json`
    console.log(`[POST] Writing metadata to R2: ${objectKey}`)

    await env.PIXTR_METADATA.put(objectKey, JSON.stringify(metadata, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        userId: metadata.userId,
        version: metadata.version,
        lastUpdated: metadata.lastUpdated,
      },
    })

    console.log(`[POST] Saved metadata for = ${metadata.userId} (${JSON.stringify(metadata).length} bytes)`)

    // Return the full metadata object so frontend can update store
    return new Response(
      JSON.stringify(metadata),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[POST] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to save metadata',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Verify Firebase ID token (MVP implementation)
 * For production, use proper JWT verification with Firebase public keys
 *
 * @param {string} token - Firebase ID token
 * @returns {Promise<string>} - User ID from token
 */
async function verifyFirebaseToken(token) {
  try {
    // MVP: Basic JWT decoding without signature verification
    // TODO: Implement proper verification with Firebase public keys for production

    console.log(`[AUTH] Verifying token (length: ${token.length}, prefix: ${token.substring(0, 15)}...)`)

    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('[AUTH] Invalid token format - expected 3 parts, got:', parts.length)
      throw new Error('Invalid token format')
    }

    // Decode payload (base64url)
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    // Basic validation
    if (!payload.user_id && !payload.sub) {
      console.error('[AUTH] Invalid token - missing user_id/sub in payload')
      throw new Error('Invalid token: missing user_id')
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.error(`[AUTH] Token expired - exp: ${payload.exp}, now: ${now}`)
      throw new Error('Token expired')
    }

    const userId = payload.user_id || payload.sub
    console.log(`[AUTH] Token verified successfully for user: ${userId}`)

    // Return user ID
    return userId
  } catch (error) {
    console.error('[AUTH] Token verification error:', error.message)
    throw new Error('Invalid or expired token')
  }
}
