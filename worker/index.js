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
      'https://*.pixtr-metadata-api.rogsor80.workers.dev',
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

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify Firebase token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.substring(7)
    const tokenUserId = await verifyFirebaseToken(token)

    // Ensure user can only access their own metadata
    if (tokenUserId !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Read from R2
    const objectKey = `${userId}/metadata.json`
    console.log(`[GET] Reading metadata: ${objectKey}`)

    const object = await env.PIXTR_METADATA.get(objectKey)

    if (object === null) {
      console.log(`[GET] Metadata not found: ${objectKey}`)
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const metadata = await object.json()
    console.log(`[GET] Metadata retrieved successfully: ${objectKey}`)

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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.substring(7)
    const tokenUserId = await verifyFirebaseToken(token)

    // Parse request body
    const metadata = await request.json()

    // Validate metadata structure
    if (!metadata.userId || !metadata.version) {
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
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Write to R2
    const objectKey = `${metadata.userId}/metadata.json`
    console.log(`[POST] Writing metadata: ${objectKey}`)

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

    console.log(`[POST] Metadata saved successfully: ${objectKey}`)

    return new Response(
      JSON.stringify({
        success: true,
        userId: metadata.userId,
        lastUpdated: metadata.lastUpdated,
      }),
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

    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // Decode payload (base64url)
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    // Basic validation
    if (!payload.user_id && !payload.sub) {
      throw new Error('Invalid token: missing user_id')
    }

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired')
    }

    // Return user ID
    return payload.user_id || payload.sub
  } catch (error) {
    console.error('Token verification error:', error)
    throw new Error('Invalid or expired token')
  }
}
