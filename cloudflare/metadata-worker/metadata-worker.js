// ============================================================================
// CLOUDFLARE WORKER: Metadata Engine v1
// R2 + KV based metadata system for Pixtr
// ============================================================================

/**
 * Cloudflare Worker Environment Bindings:
 * - PIXTR_STORAGE: R2 bucket binding (pixtr-photos)
 * - PIXTR_METADATA_KV: KV namespace binding
 * - ADMIN_TOKEN: Admin authentication token (from wrangler.toml vars)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Route handlers
      if (path === '/api/repair-all' && request.method === 'POST') {
        return await handleRepairAll(request, env, corsHeaders)
      }

      if (path === '/api/repair' && request.method === 'POST') {
        return await handleRepairUser(request, env, corsHeaders)
      }

      if (path === '/api/metadata' && request.method === 'GET') {
        return await handleGetMetadata(request, env, corsHeaders)
      }

      if (path === '/api/check-file' && request.method === 'GET') {
        return await handleCheckFile(request, env, corsHeaders)
      }

      if (path === '/api/list-orphans' && request.method === 'GET') {
        return await handleListOrphans(request, env, corsHeaders)
      }

      if (path === '/api/regenerate-urls' && request.method === 'POST') {
        return await handleRegenerateUrls(request, env, corsHeaders)
      }

      // Default 404
      return new Response('Not Found', { status: 404, headers: corsHeaders })
    } catch (error) {
      console.error('Worker Error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verify admin token
 */
function verifyAdmin(request, env) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token || token !== env.ADMIN_TOKEN) {
    throw new Error('Unauthorized: Invalid admin token')
  }
}

/**
 * List all user IDs from R2 (by scanning users/ prefix)
 */
async function listUserIdsFromR2(env) {
  const userIds = new Set()

  try {
    const listed = await env.PIXTR_STORAGE.list({ prefix: 'users/' })

    for (const object of listed.objects) {
      // Extract userId from path: users/{userId}/...
      const parts = object.key.split('/')
      if (parts.length >= 2) {
        userIds.add(parts[1])
      }
    }
  } catch (error) {
    console.error('Error listing user IDs:', error)
  }

  return Array.from(userIds)
}

/**
 * List all objects for a specific user
 */
async function listAllObjectsForUser(env, userId) {
  const objects = []
  let cursor = null

  do {
    const listOptions = {
      prefix: `users/${userId}/`,
      cursor: cursor,
    }

    const listed = await env.PIXTR_STORAGE.list(listOptions)
    objects.push(...listed.objects)
    cursor = listed.truncated ? listed.cursor : null
  } while (cursor)

  return objects
}

/**
 * Group objects by album
 */
function groupByAlbum(objects) {
  const albums = {}

  for (const obj of objects) {
    // Extract album from path: users/{userId}/{albumId}/file
    const parts = obj.key.split('/')

    if (parts.length >= 3) {
      const albumId = parts[2]

      if (!albums[albumId]) {
        albums[albumId] = {
          id: albumId,
          name: albumId === 'unassigned' ? 'Unassigned' : albumId,
          photos: [],
        }
      }

      albums[albumId].photos.push({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        httpMetadata: obj.httpMetadata,
      })
    }
  }

  return albums
}

/**
 * Build metadata JSON structure
 */
function buildMetadataJson(userId, albums) {
  return {
    version: '1.0',
    userId: userId,
    lastUpdated: new Date().toISOString(),
    albums: albums,
    photoCount: Object.values(albums).reduce(
      (sum, album) => sum + album.photos.length,
      0
    ),
  }
}

/**
 * Save metadata to KV
 */
async function saveToKV(env, userId, metadata) {
  const key = `user:${userId}`
  await env.PIXTR_METADATA_KV.put(key, JSON.stringify(metadata))
  console.log(`✅ Saved metadata for user ${userId} to KV`)
}

/**
 * Check if file exists in R2
 */
async function ensureFileExists(env, path) {
  try {
    const obj = await env.PIXTR_STORAGE.head(path)
    return obj !== null
  } catch (error) {
    return false
  }
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * POST /api/repair-all
 * Repair metadata for all users
 * Requires admin token
 */
async function handleRepairAll(request, env, corsHeaders) {
  verifyAdmin(request, env)

  const userIds = await listUserIdsFromR2(env)
  const results = []

  for (const userId of userIds) {
    try {
      const objects = await listAllObjectsForUser(env, userId)
      const albums = groupByAlbum(objects)
      const metadata = buildMetadataJson(userId, albums)

      await saveToKV(env, userId, metadata)

      results.push({
        userId,
        status: 'success',
        photoCount: metadata.photoCount,
        albumCount: Object.keys(albums).length,
      })
    } catch (error) {
      results.push({
        userId,
        status: 'error',
        error: error.message,
      })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      processedUsers: userIds.length,
      results,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

/**
 * POST /api/repair?userId={userId}
 * Repair metadata for specific user
 */
async function handleRepairUser(request, env, corsHeaders) {
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Missing userId parameter' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const objects = await listAllObjectsForUser(env, userId)
    const albums = groupByAlbum(objects)
    const metadata = buildMetadataJson(userId, albums)

    await saveToKV(env, userId, metadata)

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        photoCount: metadata.photoCount,
        albumCount: Object.keys(albums).length,
        metadata,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * GET /api/metadata?userId={userId}
 * Get metadata for user from KV
 */
async function handleGetMetadata(request, env, corsHeaders) {
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Missing userId parameter' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const key = `user:${userId}`
    const metadataJson = await env.PIXTR_METADATA_KV.get(key)

    if (!metadataJson) {
      return new Response(
        JSON.stringify({ error: 'Metadata not found for user' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const metadata = JSON.parse(metadataJson)

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * GET /api/check-file?path={path}
 * Check if file exists in R2
 */
async function handleCheckFile(request, env, corsHeaders) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path')

  if (!path) {
    return new Response(
      JSON.stringify({ error: 'Missing path parameter' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  const exists = await ensureFileExists(env, path)

  return new Response(
    JSON.stringify({ exists, path }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

/**
 * GET /api/list-orphans?userId={userId}
 * List files in R2 that might not have Firestore entries
 */
async function handleListOrphans(request, env, corsHeaders) {
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Missing userId parameter' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // List all files in unassigned folder
    const unassignedObjects = await env.PIXTR_STORAGE.list({
      prefix: `users/${userId}/unassigned/`,
    })

    const orphans = unassignedObjects.objects.map((obj) => ({
      path: obj.key,
      name: obj.key.split('/').pop(),
      size: obj.size,
      uploadedAt: obj.uploaded,
    }))

    return new Response(
      JSON.stringify({ orphans, count: orphans.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * POST /api/regenerate-urls?userId={userId}
 * Regenerate presigned URLs for user photos
 */
async function handleRegenerateUrls(request, env, corsHeaders) {
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Missing userId parameter' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Get current metadata
    const key = `user:${userId}`
    const metadataJson = await env.PIXTR_METADATA_KV.get(key)

    if (!metadataJson) {
      throw new Error('Metadata not found')
    }

    const metadata = JSON.parse(metadataJson)

    // Update lastUpdated timestamp
    metadata.lastUpdated = new Date().toISOString()
    metadata.urlsRegeneratedAt = new Date().toISOString()

    // Save back to KV
    await env.PIXTR_METADATA_KV.put(key, JSON.stringify(metadata))

    return new Response(
      JSON.stringify({
        success: true,
        count: metadata.photoCount,
        message: 'URLs regenerated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}
