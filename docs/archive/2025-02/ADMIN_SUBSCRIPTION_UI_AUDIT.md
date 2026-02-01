# PIXTR Admin / Subscription / UI Audit Report

**Date:** 2026-02-01
**Type:** Read-only code audit
**Scope:** Role handling, subscription tiers, admin UI, storage display

---

## Summary

This audit analyzes why an admin user in Firestore (`role: "ADMIN"`, `subscriptionTier: "ADMIN"`, `storageLimit: ~1 GB`) sees:
- "Subscription: Free" in the account page
- 500 MB storage limit instead of ~1 GB
- No admin UI sections visible

---

## 1. Current State

### 1.1 Role Handling

All role checks use lowercase `'admin'`:

| Location | Check | File |
|----------|-------|------|
| Firestore rules | `role == 'admin'` | `firestore.rules:25` |
| Storage rules | Hardcoded email check | `storage.rules:17` |
| useAuth `isAdmin()` | `userProfile?.role === 'admin'` OR email | `src/hooks/useAuth.js:152` |
| useAuth `isPro()` | `userProfile.role === 'admin'` (direct) | `src/hooks/useAuth.js:180` |
| useAuth `isGratis()` | `userProfile.role === 'admin'` (direct) | `src/hooks/useAuth.js:160` |
| Zustand store | `userProfile?.role === 'admin'` | `src/state/store.js:396` |
| MorePage (local) | `user?.role === 'admin'` | `src/pages/MorePage.jsx:169` |
| Cloud Functions | `userData.role === 'admin'` | `functions/index.js:167,324,345` |
| AuthProvider default | `role: 'user'` for new users | `src/providers/AuthProvider.jsx:138` |

**Finding:** If Firestore has `role: "ADMIN"` (uppercase), all checks fail except the email hardcode in `useAuth.isAdmin()`.

### 1.2 Subscription Tier Handling

Valid tier values in code: `'FREE'`, `'LITE'`, `'PRO'`, `'GRATIS'` (legacy).

`'ADMIN'` as subscriptionTier is **not handled** anywhere. It is only returned by `getTier()` in `useAuth.js:188` when `isAdmin()` is true — a derived value, not a Firestore value.

**SubscriptionPage** (`src/pages/SubscriptionPage.jsx:64-93`):
```
tier() → "ADMIN" → switch: no match → default → shows FREE plan
```

**MorePage** (`src/pages/MorePage.jsx:1167-1172`):
```
isPro ? "PRO" : "Free" → binary check, no ADMIN/LITE handling
```

### 1.3 Admin UI

**Admin route** (`src/App.jsx:853`):
```jsx
{isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
```
`isAdmin` is a **function reference** from `useAuth()`. Functions are always truthy in JavaScript. The admin route is **always registered** for all authenticated users.

**Admin link in UI** (`src/pages/MorePage.jsx:1278`):
```jsx
{isAdmin && (<section>... navigate('/admin') ...</section>)}
```
Here `isAdmin` is a **local boolean** (`user?.role === 'admin'`). If role is uppercase, this is `false` and the admin panel section is hidden.

### 1.4 Storage Logic

**Zustand store default** (`src/state/store.js:317`):
```javascript
storageLimit: 524288000  // 500 MB
```

`setStorageLimit()` exists (`store.js:327`) but is **never called** anywhere in the application.

**AuthProvider** sets `userProfile` (which contains `storageLimit: ~1 GB`) but does NOT update the Zustand `storageLimit` field.

**SubscriptionPage** (`src/pages/SubscriptionPage.jsx:36`) reads `storageLimit` from Zustand → always 500 MB.

**MorePage** receives `storageLimit` from Zustand via AppContent → always 500 MB.

**StorageIndicator** (`src/components/StorageIndicator.jsx:22`) uses tier-based lookup:
```javascript
const limit = limits[userTier]  // 'ADMIN' not in limits → undefined
```

---

## 2. Identified Design Issues

### CRITICAL

1. **Case mismatch in role field** — Firestore has `"ADMIN"`, code checks for `"admin"`. Root cause of missing admin UI.

2. **storageLimit never synced from Firestore to Zustand** — Default 500 MB is never overwritten. Root cause of 500 MB display.

3. **`subscriptionTier: "ADMIN"` is invalid** — Not handled in any switch/if. Falls to FREE display.

4. **Admin route never gated** — `{isAdmin && <Route>}` uses function reference (always truthy). Any authenticated user can access `/admin`.

### SEVERE

5. **Duplicate isPro/isAdmin in MorePage** — Local definitions inconsistent with useAuth hook logic.

6. **Binary subscription display** — MorePage shows only "PRO" or "Free". LITE and ADMIN not handled.

7. **LITE storage inconsistency** — Stripe webhook: 5 GB. Frontend: 10 GB.

8. **Legacy `plan` field** — `App.jsx:465` still reads unused `plan` field for NotificationPanel gating.

### MODERATE

9. **StorageIndicator wrong import** — Imports from `'../contexts/AuthContext'` instead of hooks.

10. **Firestore rules tier validation** — Only validates `['GRATIS', 'LITE', 'PRO']`. `'FREE'` not in list.

11. **Dual storage calculation** — SubscriptionPage uses Zustand, StorageIndicator calculates from photos array.

---

## 3. Recommended Architecture

### Separation of Concerns

| Field | Controls | Source |
|-------|----------|--------|
| `role` | Access: admin routes, admin API, Firestore rules | Firestore `users/{uid}.role` |
| `subscriptionTier` | Features: storage, video, documents, compression | Firestore `users/{uid}.subscriptionTier` |
| `storageLimit` | Storage: progress bar, upload validation | Firestore `users/{uid}.storageLimit` |

### Principles

- `role` should ONLY determine admin access (dashboard, user management, kill switches)
- `subscriptionTier` should ONLY determine feature level (FREE/LITE/PRO)
- Admin privileges (bypass storage, bypass limits) checked via `isAdmin()`, NOT via tier
- All tier checks should go through `useAuth()` hooks — no local duplicates
- `storageLimit` should be read from `userProfile.storageLimit`, not hardcoded maps
- Consistent case: `'admin'` lowercase, normalize on write

---

## 4. Recommended Next Steps

### Step 1: Fix admin visibility
- Normalize `role` in Firestore to lowercase `"admin"`
- OR update all role checks to case-insensitive
- Remove `subscriptionTier: "ADMIN"` from Firestore, set to `"PRO"`

### Step 2: Fix storage display
- Sync `storageLimit` from `userProfile.storageLimit` to Zustand store
- AuthProvider should call `setStorageLimit(profile.storageLimit)` after loading
- Change default from 500 MB to tier-based default (1 GB for FREE)

### Step 3: Fix subscription display
- Replace MorePage binary `isPro ? PRO : Free` with `tier()` from useAuth
- Add `'ADMIN'`, `'LITE'` handling in subscription badge
- Add `'ADMIN'` case in SubscriptionPage switch

### Step 4: Fix admin route security
- Change `{isAdmin && <Route>}` to `{isAdmin() && <Route>}` (call the function)
- Add server-side validation in AdminDashboard component

### Step 5: Cleanup
- Remove local isPro/isAdmin in MorePage — use `useAuth()` consistently
- Remove legacy `plan` field checks
- Sync LITE storage limit (5 GB vs 10 GB)
- Update Firestore rules to include `'FREE'` in valid tiers
