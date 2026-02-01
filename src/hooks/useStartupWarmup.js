// ============================================================================
// useStartupWarmup – Eliminates "first interaction slow" cold-start patterns
// ============================================================================
// Runs once per session after auth resolves. Three non-blocking strategies:
// 1. Cloudflare Worker cold-start pings (HEAD, no-cors)
// 2. React.lazy chunk preloads (shared module cache with lazy())
// 3. Image decode pipeline warmup (thumbnail decode via requestIdleCallback)
// ============================================================================

import { useEffect, useRef } from 'react'
import useStore from '../state/store'

export default function useStartupWarmup() {
  const warmedUp = useRef(false)
  const photosWarmedUp = useRef(false)
  const user = useStore((state) => state.user)
  const photos = useStore((state) => state.photos)

  // Worker pings + chunk preloads — fire once when user authenticates
  useEffect(() => {
    if (!user || warmedUp.current) return
    warmedUp.current = true

    warmupWorkers()
    preloadHeavyChunks()
  }, [user])

  // Image decode warmup — fire once when photo list first populates
  useEffect(() => {
    if (!user || photosWarmedUp.current) return
    if (!Array.isArray(photos) || photos.length === 0) return
    photosWarmedUp.current = true

    warmupImageDecode(photos)
  }, [user, photos])
}

// ---------------------------------------------------------------------------
// 1. Wake Cloudflare Workers from cold sleep
// ---------------------------------------------------------------------------
// HEAD + no-cors = minimal overhead. Opaque response is fine — the goal is
// just to trigger the Worker runtime so subsequent real requests are fast.
function warmupWorkers() {
  const endpoints = [
    import.meta.env.VITE_R2_PUBLIC_URL,
    import.meta.env.VITE_R2_UPLOAD_ENDPOINT,
    import.meta.env.VITE_METADATA_API_URL,
  ].filter(Boolean)

  Promise.allSettled(
    endpoints.map((url) =>
      fetch(`${url}/health`, { method: 'HEAD', mode: 'no-cors' }).catch(() => {})
    )
  ).then((results) => {
    if (import.meta.env.DEV) {
      console.log('[WARMUP] Worker pings:', results.length, 'sent')
    }
  })
}

// ---------------------------------------------------------------------------
// 2. Preload JS chunks for heavy lazy-loaded pages
// ---------------------------------------------------------------------------
// Module cache is shared with React.lazy — when the user later navigates to
// these routes, the chunk is already parsed and the component renders instantly.
function preloadHeavyChunks() {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 200))

  schedule(() => {
    // Same paths that React.lazy() uses in App.jsx — Vite deduplicates these
    import('../features/editor/pages/EditorPage').catch(() => {})
    import('../features/editor/pages/EditorPageV4').catch(() => {})
    import('../pages/VaultPage').catch(() => {})
    import('../pages/SlideshowPage').catch(() => {})

    if (import.meta.env.DEV) {
      console.log('[WARMUP] Heavy chunk preload triggered')
    }
  })
}

// ---------------------------------------------------------------------------
// 3. Image decode pipeline warmup
// ---------------------------------------------------------------------------
// The browser's image decoder + GPU context has a cold-start penalty on the
// first decode. Pre-decoding a few thumbnails during idle time eliminates the
// stutter when the user first opens the editor or slideshow.
const _decoded = new Set()

function warmupImageDecode(photos) {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 300))

  schedule(() => {
    const targets = photos
      .filter((p) => p.thumbnailUrl && !_decoded.has(p.thumbnailUrl))
      .slice(0, 4)

    for (const photo of targets) {
      _decoded.add(photo.thumbnailUrl)
      const img = new Image()
      img.src = photo.thumbnailUrl
      img.decode().catch(() => {}) // best-effort, fail silently
    }

    if (import.meta.env.DEV) {
      console.log('[WARMUP] Image decode:', targets.length, 'thumbnails queued')
    }
  })
}
