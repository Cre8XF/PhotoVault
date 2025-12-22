// ============================================================================
// CLOUDFLARE WORKER: R2 Upload Proxy (DEBUG MODE)
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    console.log('🟢 [Worker] Incoming request:', {
      method: request.method,
      path,
      origin: request.headers.get('Origin'),
    })

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

    if (request.method === 'OPTIONS') {
      console.log('🟡 [Worker] CORS preflight')
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    try {
      if (path === '/upload' && request.method === 'POST') {
        return await handleUpload(request, env, corsHeaders)
      }

      if (path === '/health') {
        return new Response(
          JSON.stringify({ status: 'ok', worker: 'pixtr-upload-worker' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      console.warn('⚠️ [Worker] Unknown route:', path)
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('🔥 [Worker] Unhandled error:', error)
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

async function handleUpload(request, env, corsHeaders) {
  console.log('🟣 [UPLOAD] Handler entered')

  try {
    // ------------------------------------------------------------------------
    // AUTH
    // ------------------------------------------------------------------------
    const authHeader = request.headers.get('Authorization')
    console.log('🟣 [UPLOAD] Authorization header present:', !!authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ [UPLOAD] Missing Authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.substring(7)
    const authenticatedUserId = await verifyFirebaseToken(token)

    console.log('🟢 [UPLOAD] Authenticated user:', authenticatedUserId)

    // ------------------------------------------------------------------------
    // FORM DATA
    // ------------------------------------------------------------------------
    const formData = await request.formData()

    const file = formData.get('file')
    const userId = formData.get('userId')
    const storagePath = formData.get('storagePath')
    const contentType = formData.get('contentType')
    const albumId = formData.get('albumId')

    console.log('🟢 [UPLOAD] Parsed formData:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      userId,
      storagePath,
      contentType,
      albumId,
    })

    if (!file || !userId || !storagePath || !contentType) {
      console.error('❌ [UPLOAD] Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (authenticatedUserId !== userId) {
      console.error('❌ [UPLOAD] User mismatch', authenticatedUserId, userId)
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!storagePath.startsWith(`users/${userId}/`)) {
      console.error('❌ [UPLOAD] Invalid storagePath', storagePath)
      return new Response(JSON.stringify({ error: 'Invalid storagePath' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ------------------------------------------------------------------------
    // R2 UPLOAD
    // ------------------------------------------------------------------------
    console.log('🟣 [UPLOAD] Uploading to R2 bucket:', {
      bucketBindingExists: !!env.PIXTR_PHOTOS,
      storagePath,
    })

    // 🔴 VIKTIG: Cloudflare R2 krever stream()
    await env.PIXTR_USERS.put(storagePath, file.stream(), {
      httpMetadata: { contentType },
      customMetadata: {
        userId,
        albumId: albumId || 'unassigned',
        uploadedAt: new Date().toISOString(),
        originalFileName: file.name,
      },
    })

    const baseUrl = env.R2_PUBLIC_URL || 'https://images.pixtr.cloud'
    const r2Url = `${baseUrl}/${storagePath}`

    console.log('✅ [UPLOAD] R2 upload successful:', r2Url)

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
    console.error('🔥 [UPLOAD] Upload failed:', error)
    return new Response(
      JSON.stringify({ error: 'Upload failed', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// ============================================================================
// AUTH
// ============================================================================

async function verifyFirebaseToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid token format')

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    if (!payload.user_id && !payload.sub) throw new Error('Missing user_id')

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) throw new Error('Token expired')

    return payload.user_id || payload.sub
  } catch (error) {
    console.error('❌ [AUTH] Token verification failed:', error.message)
    throw error
  }
}
