// ============================================================================
// CLOUDFLARE WORKER: R2 Image Server with CORS Support
// ============================================================================
//
// Purpose: Serve images from R2 with proper CORS headers for canvas/editor
//
// Why this is needed:
// - Browser <img> tags work without CORS headers (display only)
// - Canvas/Editor needs CORS headers to read pixel data (getImageData, toBlob, etc.)
// - R2 direct access may not provide all required CORS headers
// - This Worker adds comprehensive CORS support for image processing
//
// Architecture:
// - Domain: images.pixtr.cloud
// - R2 Bucket: pixtr-users
// - Methods: GET (serve images), HEAD (metadata), OPTIONS (CORS preflight)
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    console.log('🖼️ [Image Worker] Incoming request:', {
      method: request.method,
      path,
      origin: request.headers.get('Origin'),
    })

    // ========================================================================
    // CORS HEADERS - Required for Canvas/Editor operations
    // ========================================================================
    // These headers allow browsers to:
    // 1. Load images cross-origin
    // 2. Read pixel data in canvas (ctx.getImageData)
    // 3. Export canvas to blob (canvas.toBlob)
    // 4. Apply filters and transformations in Editor
    //
    // Note: Gallery rendering works without these, but Editor REQUIRES them
    // ========================================================================
    const corsHeaders = {
      // Allow all origins to access images
      'Access-Control-Allow-Origin': '*',

      // Allow GET (fetch images), HEAD (check metadata), OPTIONS (preflight)
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',

      // Allow any headers in requests
      'Access-Control-Allow-Headers': '*',

      // Expose these headers to JavaScript (needed for caching)
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, ETag, Last-Modified, Cache-Control',

      // Cache preflight response for 1 hour
      'Access-Control-Max-Age': '3600',

      // Allow embedding in any origin (needed for iframe/embed scenarios)
      'Cross-Origin-Resource-Policy': 'cross-origin',

      // Allow reading responses in cross-origin contexts
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    }

    // ========================================================================
    // OPTIONS - Handle CORS Preflight Requests
    // ========================================================================
    // Browser sends OPTIONS before actual GET when:
    // - Fetch from different origin with credentials
    // - Custom headers are used
    // - Canvas tries to read pixel data
    // ========================================================================
    if (request.method === 'OPTIONS') {
      console.log('✅ [Image Worker] CORS preflight - responding with 204')
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    // ========================================================================
    // GET / HEAD - Serve Images from R2
    // ========================================================================
    if (request.method === 'GET' || request.method === 'HEAD') {
      try {
        // Extract storage path from URL
        // URL: https://images.pixtr.cloud/users/userId/albumId/photo.jpg
        // Path: /users/userId/albumId/photo.jpg
        // R2 Key: users/userId/albumId/photo.jpg
        const storageKey = path.startsWith('/') ? path.substring(1) : path

        console.log('📦 [Image Worker] Fetching from R2:', storageKey)

        // Fetch object from R2 bucket
        const object = await env.PIXTR_USERS.get(storageKey)

        // Handle 404 - Image not found
        if (!object) {
          console.error('❌ [Image Worker] Object not found:', storageKey)
          return new Response('Image not found', {
            status: 404,
            headers: corsHeaders,
          })
        }

        // Prepare response headers
        const headers = new Headers(corsHeaders)

        // Set Content-Type (image/jpeg, image/png, etc.)
        const contentType = object.httpMetadata?.contentType || 'image/jpeg'
        headers.set('Content-Type', contentType)

        // Set Content-Length for proper loading progress
        if (object.size) {
          headers.set('Content-Length', object.size.toString())
        }

        // Add ETag for caching (R2 provides this automatically)
        if (object.httpEtag) {
          headers.set('ETag', object.httpEtag)
        }

        // Add Last-Modified for caching
        if (object.uploaded) {
          headers.set('Last-Modified', new Date(object.uploaded).toUTCString())
        }

        // Set Cache-Control for browser caching (1 year for images)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')

        console.log('✅ [Image Worker] Serving image:', {
          key: storageKey,
          contentType,
          size: object.size,
        })

        // For HEAD requests, return headers only (no body)
        if (request.method === 'HEAD') {
          return new Response(null, {
            status: 200,
            headers,
          })
        }

        // For GET requests, return the image with CORS headers
        return new Response(object.body, {
          status: 200,
          headers,
        })
      } catch (error) {
        console.error('🔥 [Image Worker] Error fetching image:', error)
        return new Response('Internal server error', {
          status: 500,
          headers: corsHeaders,
        })
      }
    }

    // ========================================================================
    // Health Check Endpoint
    // ========================================================================
    if (path === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'pixtr-image-worker',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // ========================================================================
    // Unknown Methods / Routes
    // ========================================================================
    console.warn('⚠️ [Image Worker] Unsupported method:', request.method)
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  },
}
