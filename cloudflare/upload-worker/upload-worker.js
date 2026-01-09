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
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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

      if (path.startsWith('/delete') && request.method === 'POST') {
        return await handleDelete(request, env, corsHeaders)
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
    // TIER & QUOTA VALIDATION
    // ------------------------------------------------------------------------
    const fileSize = file.size || 0

    // 🔒 Fetch user data from Firestore REST API
    let userData
    try {
      userData = await getUserData(authenticatedUserId, token, env)
    } catch (error) {
      console.error('[Worker] Failed to fetch user data:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to verify user subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { subscriptionTier, storageUsed, storageLimit } = userData

    console.log('[Worker] User validation:', {
      userId: authenticatedUserId,
      tier: subscriptionTier,
      storageUsed,
      storageLimit,
      fileSize
    })

    // ❌ TIER CHECK: Video requires PRO
    if (contentType?.startsWith('video/') && subscriptionTier !== 'PRO') {
      console.log('[Worker] Video upload blocked - tier upgrade required')
      return new Response(
        JSON.stringify({
          error: 'Video upload requires PRO subscription',
          errorCode: 'TIER_UPGRADE_REQUIRED',
          requiredTier: 'PRO',
          currentTier: subscriptionTier
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ❌ QUOTA CHECK: Storage limit exceeded
    if (storageUsed + fileSize > storageLimit) {
      console.log('[Worker] Upload blocked - quota exceeded')
      return new Response(
        JSON.stringify({
          error: 'Storage quota exceeded',
          errorCode: 'QUOTA_EXCEEDED',
          storageUsed,
          storageLimit,
          fileSize,
          available: Math.max(0, storageLimit - storageUsed)
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [Worker] Tier and quota validation passed')

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
// DELETE HANDLER
// ============================================================================

async function handleDelete(request, env, corsHeaders) {
  console.log('🗑️ [DELETE] Handler entered')

  try {
    // ------------------------------------------------------------------------
    // AUTH
    // ------------------------------------------------------------------------
    const authHeader = request.headers.get('Authorization')
    console.log('🗑️ [DELETE] Authorization header present:', !!authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ [DELETE] Missing Authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.substring(7)
    const authenticatedUserId = await verifyFirebaseToken(token)

    console.log('🟢 [DELETE] Authenticated user:', authenticatedUserId)

    // ------------------------------------------------------------------------
    // REQUEST DATA
    // ------------------------------------------------------------------------
    const body = await request.json()
    const { storagePath } = body

    console.log('🟢 [DELETE] Parsed request:', {
      storagePath,
      userId: authenticatedUserId,
    })

    if (!storagePath) {
      console.error('❌ [DELETE] Missing storagePath')
      return new Response(JSON.stringify({ error: 'Missing storagePath' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ------------------------------------------------------------------------
    // SECURITY: Verify user owns the file
    // ------------------------------------------------------------------------
    if (!storagePath.startsWith(`users/${authenticatedUserId}/`)) {
      console.error('❌ [DELETE] User does not own file', {
        userId: authenticatedUserId,
        storagePath,
      })
      return new Response(
        JSON.stringify({
          error: 'Forbidden: Cannot delete files from other users',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // ------------------------------------------------------------------------
    // R2 DELETE (Idempotent)
    // ------------------------------------------------------------------------
    console.log('🗑️ [DELETE] Deleting from R2 bucket:', {
      bucketBindingExists: !!env.PIXTR_USERS,
      storagePath,
    })

    // R2.delete() is idempotent - no error if file doesn't exist
    await env.PIXTR_USERS.delete(storagePath)

    console.log('✅ [DELETE] R2 delete successful (or file already missing)')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'File deleted from R2',
        storagePath,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('🔥 [DELETE] Delete failed:', error)
    return new Response(
      JSON.stringify({ error: 'Delete failed', message: error.message }),
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

// ============================================================================
// FIRESTORE REST API - User Data Fetching
// ============================================================================

/**
 * Fetch user data from Firestore via REST API
 * Worker-compatible (no Admin SDK)
 */
async function getUserData(userId, idToken, env) {
  const projectId = env.FIREBASE_PROJECT_ID
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID not configured in wrangler.toml')
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}`

  console.log('🔍 [Firestore] Fetching user data:', { userId, projectId })

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [Firestore] Failed to fetch user data:', {
      status: response.status,
      error: errorText
    })
    throw new Error(`Failed to fetch user data: ${response.status}`)
  }

  const data = await response.json()

  console.log('✅ [Firestore] User data fetched:', {
    tier: data.fields?.subscriptionTier?.stringValue,
    storageUsed: data.fields?.storageUsed?.integerValue,
    storageLimit: data.fields?.storageLimit?.integerValue
  })

  // Firestore REST format: { fields: { fieldName: { stringValue: "..." } } }
  return {
    subscriptionTier: data.fields?.subscriptionTier?.stringValue || 'FREE',
    storageUsed: parseInt(data.fields?.storageUsed?.integerValue || '0'),
    storageLimit: parseInt(data.fields?.storageLimit?.integerValue || '1073741824') // 1GB default
  }
}
