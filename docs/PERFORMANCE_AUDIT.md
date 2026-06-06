# Pixtr – Startup Performance Audit

**Build:** ✓ 2942 modules | Main bundle: 1.38 MB (357 KB gzip) | Total assets: ~5.7 MB  
**Date:** 2026-06-06

---

## 🔴 HIGH impact

### 1. No `manualChunks` — monolithic 1.38 MB main bundle

`vite.config.js` is completely bare — no `build.rollupOptions`, no `manualChunks`:

```js
export default defineConfig({ plugins: [react()] })
```

The entire shared vendor graph (React, React Router, Firebase SDK, Zustand, i18next,
dnd-kit, lucide-react, date-fns, exifr, stripe-js) collapses into a single 1.38 MB chunk.
The JS engine in the Android WebView must **parse and compile all of it** before the first
frame. On a mid-range Android device this is 1–3 extra seconds of blank screen.

**Fix:** Add `manualChunks` to split vendors into at least 3 groups:

```js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
        'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore',
                            'firebase/storage', 'firebase/functions'],
        'vendor-ui':       ['lucide-react', 'zustand', 'date-fns', '@dnd-kit/core',
                            '@dnd-kit/sortable'],
      }
    }
  }
}
```

Firebase alone accounts for a large portion of the 1.38 MB. Splitting it means the WebView
can parse vendor chunks in parallel and cache them independently across deploys.

---

### 2. Firebase SDK fully eager — all 4 services in the main chunk

`firebase.js` initializes auth, firestore, storage, and functions **synchronously at module scope**:

```js
export const db        = getFirestore(app)               // line 82
export const storage   = getStorage(app)                 // line 83
export const auth      = getAuth(app)                    // line 84
export const functions = getFunctions(app, 'europe-west1') // line 85
```

Because `firebase.js` is statically imported by 28+ components, it lands in the main bundle
and every Firebase sub-SDK is initialized before the first pixel renders. Storage and
Functions are rarely needed at startup.

**Fix:** Keep auth + firestore eager (needed for `onAuthStateChanged` immediately).
Lazy-load storage and functions:

```js
// firebase.js
export const getStorageInstance  = () => getStorage(app)
export const getFunctionsInstance = () => getFunctions(app, 'europe-west1')
```

Then import them at call sites. This defers the storage/functions SDK from the critical path.

---

### 3. Unbounded Firestore queries on every startup

Both startup listeners have no `LIMIT`:

```js
// firebase.js ~line 397
query(collection(db, 'albums'), where('userId', '==', userId))

// firebase.js ~line 406
query(collection(db, 'photos'), where('userId', '==', userId),
      where('deleted', '==', false))
```

A user with 5,000 photos triggers a 5,000-document Firestore read on every app open.
Firestore charges per document read and the network payload grows without bound.

**Fix:** Add `limit(200)` to the initial photos query and implement cursor-based pagination
on scroll. Albums are typically small in number so that query is lower risk.

---

### 4. No Firestore IndexedDB persistence

No call to `enableIndexedDbPersistence()` anywhere in the codebase. On every launch, the
app waits for the network before showing any photo data. On a 4G connection this is
~300–800ms of blank home screen. With persistence, returning users see their last-known
library instantly from local cache while the sync happens in the background.

**Fix** (add to `firebase.js` after `getFirestore`):

```js
import { enableIndexedDbPersistence } from 'firebase/firestore'

enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') { /* multi-tab — silently skip */ }
  if (err.code === 'unimplemented')       { /* browser doesn't support it  */ }
})
```

> Note: must be called **before** any other Firestore operations.

---

## 🟡 MEDIUM impact

### 5. Large logo/icon PNGs in the assets bundle — 2.77 MB

The dist output ships four large PNGs:

| File | Size |
|------|------|
| `logo_light.png` | 737 KB |
| `logo_dark.png` | 735 KB |
| `icon_dark.png` | 652 KB |
| `icon_light.png` | 646 KB |

These are imported as JS modules and bundled into `dist/assets/`. On a Capacitor app they
are included in the APK, so they do not cost download time per-launch — but the WebView
still **decodes and paints** them at startup. Combined: 2.77 MB of raster assets.

**Fix:** Convert to WebP (typically 60–80% smaller) and serve only the theme-appropriate
image (not both dark and light on every launch). Use the `<picture>` element with
`prefers-color-scheme` or load the correct asset via JS at render time.

---

### 6. `useStartupWarmup` preloads editor + vault chunks unconditionally

`useStartupWarmup.js` fires `requestIdleCallback` after auth and unconditionally imports:

```js
import('./pages/EditorPage')    // 21.7 KB
import('./pages/EditorPageV4')  // 20.9 KB
import('./pages/VaultPage')     // 46.4 KB
import('./pages/SlideshowPage') //  7.5 KB
```

Most users open the app to browse photos — they never visit the editor or vault in a given
session. Preloading these (~96 KB) on every startup competes for network bandwidth with the
`onSnapshot` queries loading the actual photo library.

**Fix:** Preload conditionally — preload `EditorPage` only when the user navigates to a
photo (high likelihood they will edit), and `VaultPage` only if `vault.enabled === true` in
their profile.

---

### 7. No `preconnect` hints in `index.html`

`index.html` has no `<link rel="preconnect">` or `<link rel="dns-prefetch">` tags. The
first Firebase Auth call, first Firestore query, and first R2 image load all spend time on
DNS resolution + TLS handshake before any bytes transfer. This adds ~100–300ms to the first
request.

**Fix** (add to `<head>` in `index.html`):

```html
<link rel="preconnect" href="https://firebaseapp.com">
<link rel="preconnect" href="https://firestore.googleapis.com">
<link rel="preconnect" href="https://identitytoolkit.googleapis.com">
<link rel="preconnect" href="https://images.pixtr.cloud">
<link rel="dns-prefetch" href="https://pixtr-upload-worker.rogsor80.workers.dev">
```

---

### 8. Zustand `persist` stores photos/albums in localStorage

The store uses `persist` middleware keyed to `photovault-storage`. If a user has 200+ photos
in their Zustand state, this is a large JSON blob read **synchronously** from localStorage on
every startup. localStorage reads block the main thread.

**Fix:** Either exclude `photos` and `albums` from the persisted slice (they are freshly
fetched from Firestore on every login anyway), or switch to an async storage adapter using
`idb` (already in dependencies):

```js
import { createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

const idbStorage = { getItem: get, setItem: set, removeItem: del }

persist(fn, { storage: createJSONStorage(() => idbStorage) })
```

---

## 🟢 LOW impact

### 9. `console.log('ENV:', import.meta.env)` in `main.jsx`

`main.jsx` line 24 (outside any DEV guard):

```js
console.log('ENV:', import.meta.env)
```

Runs in production and logs the full env object (including all `VITE_*` keys) to the
DevTools console of any user who opens it. The previous console-wrapping pass covered the
top 4 offender files but `main.jsx` was missed.

**Fix:** Delete the line, or wrap it:

```js
if (import.meta.env.DEV) console.log('ENV:', import.meta.env)
```

---

### 10. `useKillSwitches` fires one unconditional pre-auth Firestore read

```js
// useKillSwitches.js ~line 22
onSnapshot(doc(db, 'systemConfig', 'killSwitches'), ...)
```

This listener starts before auth resolves — it reads a system config document with no user
gate. On mobile WebView this means one Firestore TCP connection opens before auth, which can
slow down the Firebase Auth SDK's own connection setup.

**Fix:** Either gate it on auth OR (better) fetch it once with `getDoc` on app init rather
than a live `onSnapshot` (system config rarely changes mid-session).

---

### 11. `IntersectionObserver` margin too tight (50px)

`LazyImage.jsx` uses `rootMargin: '50px'`. On a phone screen that is about one image-height
of lookahead. On fast scroll, images enter the viewport before they have loaded.

**Fix:** Increase to `rootMargin: '300px'` — this preloads images ~3 viewport-heights ahead
without materially impacting data usage.

---

### 12. i18n imported synchronously at entry point

`main.jsx` has `import './i18n'` — the i18n initialization runs synchronously as part of the
initial module evaluation, including loading the translation files. At 7.3 KB (gzipped
2.6 KB for `en-US`) this is not severe, but it could be deferred until after the first
render.

---

## Summary

| # | Issue | Impact | Effort | Fix |
|---|-------|--------|--------|-----|
| 1 | No `manualChunks` — 1.38 MB bundle | 🔴 HIGH | Low | Add to `vite.config.js` |
| 2 | All Firebase services eager at startup | 🔴 HIGH | Low | Lazy-load storage + functions |
| 3 | Unbounded Firestore photo query | 🔴 HIGH | Medium | Add `limit(200)` + pagination |
| 4 | No Firestore IndexedDB persistence | 🔴 HIGH | Low | `enableIndexedDbPersistence()` |
| 5 | 2.77 MB PNG logos/icons | 🟡 MEDIUM | Medium | Convert to WebP, load active theme only |
| 6 | Warmup preloads editor+vault unconditionally | 🟡 MEDIUM | Low | Gate behind navigation intent |
| 7 | No `preconnect` hints in index.html | 🟡 MEDIUM | Low | Add 5 `<link rel="preconnect">` tags |
| 8 | Zustand persists photos/albums in localStorage | 🟡 MEDIUM | Medium | Exclude arrays or switch to async idb |
| 9 | `console.log('ENV:…')` in main.jsx | 🟢 LOW | Trivial | Delete one line |
| 10 | `useKillSwitches` unconditional pre-auth snapshot | 🟢 LOW | Low | Gate on auth or switch to `getDoc` |
| 11 | IntersectionObserver margin 50px too tight | 🟢 LOW | Trivial | Change to `300px` |
| 12 | i18n synchronous import at entry | 🟢 LOW | Low | Defer until after first render |

**Quick wins (< 30 min, HIGH return):** Items 1, 2, 4, 7, 9 — small config or one-liner
changes that together could cut cold-start time by 40–60% on mid-range Android.

---

## Appendix – Startup sequence (current)

```
T=0ms       App mounts, AuthProvider useEffect fires
T=0ms       onAuthStateChanged listener registered
T=0–50ms    Firebase Auth emits currentUser (cached from SDK)
T=50ms      setUser(), setLoading(false) — UI unblocked
T=50ms      background: currentUser.reload()         (async)
T=50ms      background: currentUser.getIdToken(true) (async)
T=50ms      background: fetchUserProfile(uid)        (async Firestore read)
T=50ms      usePhotoData dependency [user?.uid] triggers
T=50ms      listenToAlbumsByUser(uid) — onSnapshot started
T=50ms      listenToPhotosByUser(uid) — onSnapshot started (unbounded)
T=100–300ms Firestore: Albums, Photos, UserProfile arrive
T=300ms     UI renders with data
```
