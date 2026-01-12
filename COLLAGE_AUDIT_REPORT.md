# 📊 PIXTR COLLAGE vs PHOTO DATA CONTRACT AUDIT
**READ-ONLY ANALYSIS | NO FIXES IMPLEMENTED**

---

## 📋 Executive Summary

**Critical Finding:** Collages are **NOT bit-for-bit compatible** with the Photo contract. The current implementation in `CollageNewPage.jsx` creates documents that are **EXCLUDED by Firestore queries** and **INCOMPATIBLE with timeline, sorting, and filtering logic**.

**Primary Issue:** The `deleted` field is **missing** from collage documents, causing them to be filtered out by the primary photo query: `where('deleted', '==', false)`. In Firestore, `undefined !== false`, so collages never match this query.

**Impact:** Collages do not appear in:
- Album grids (filtered by query)
- Timeline view (missing date fields)
- Search results (filtered by query)
- Manual sort order (missing `order` field)
- Category filters (missing `category`, `aiAnalyzed` fields)

---

## 1️⃣ Canonical Photo Data Contract

### Source: `firebase.js:1364-1422` (uploadPhoto function)

| Field | Type | Requirement | Notes |
|-------|------|-------------|-------|
| **CORE IDENTITY** |
| `name` | string | REQUIRED | Original filename |
| `url` | string | REQUIRED | Download URL (R2) |
| `userId` | string | REQUIRED | Owner ID |
| `albumId` | string \| null | REQUIRED | Album reference |
| `size` | number | REQUIRED | File size in bytes |
| `type` | string | REQUIRED | 'image/jpeg', 'video', 'document' |
| **QUERY-CRITICAL FIELDS** |
| `deleted` | boolean | **REQUIRED** | **Default: false** (query: `where('deleted', '==', false)`) |
| `deletedAt` | string \| null | REQUIRED | Deletion timestamp |
| `deletedBy` | string \| null | REQUIRED | Deleter user ID |
| **ORDERING & STORAGE** |
| `order` | number | REQUIRED | Manual sort order (Date.now()) |
| `storageBackend` | 'r2' | REQUIRED | Backend identifier |
| `r2Url` | string | REQUIRED | R2 public URL |
| **TIMESTAMPS** |
| `createdAt` | string | REQUIRED | ISO timestamp (Firestore serverTimestamp) |
| `updatedAt` | string | REQUIRED | ISO timestamp |
| `uploadedAt` | string | REQUIRED | ISO timestamp |
| `displayDate` | string | REQUIRED | Primary date (takenAt OR uploadedAt) |
| **OPTIONAL - TIMELINE** |
| `takenAt` | string \| undefined | OPTIONAL | EXIF date (only if exists) |
| `dateTaken` | string \| undefined | OPTIONAL | Backward compat for takenAt |
| **METADATA** |
| `favorite` | boolean | REQUIRED | Default: false |
| `tags` | string[] | REQUIRED | User tags (default: []) |
| `aiTags` | string[] | REQUIRED | AI tags (default: []) |
| `faces` | number | REQUIRED | Face count (default: 0) |
| `category` | string \| null | REQUIRED | AI category |
| `aiAnalyzed` | boolean | REQUIRED | Default: false |
| `analyzedAt` | string \| null | REQUIRED | Analysis timestamp |
| **VIDEO-SPECIFIC** |
| `thumbnailUrl` | string | CONDITIONAL | Required if type='video' |
| `metadata` | object | CONDITIONAL | { duration, resolution, fps } |
| **EXIF (OPTIONAL)** |
| `location` | object | OPTIONAL | { latitude, longitude, altitude } |
| `camera` | object | OPTIONAL | { make, model, lens } |
| `technicalDetails` | object | OPTIONAL | { iso, shutterSpeed, aperture, ... } |

---

## 2️⃣ Current Collage Firestore Document Contract

### Source: `CollageNewPage.jsx:304-339`

```javascript
const photoDoc = {
  // ✅ MATCHING FIELDS
  userId: user.uid,                    // ✅ Matches
  albumId: albumId || null,            // ✅ Matches
  url: collageUrl,                     // ✅ Matches
  thumbnailUrl: thumbnailUrl,          // ✅ Matches (video-style)
  name: `Collage - ${template.name}`,  // ✅ Matches (but different value)
  createdAt: serverTimestamp(),        // ✅ Matches
  updatedAt: serverTimestamp(),        // ✅ Matches
  favorite: false,                     // ✅ Matches
  tags: ['collage'],                   // ✅ Matches
  aiTags: [...],                       // ✅ Matches

  // ⚠️ NAMING MISMATCH
  fileSize: collageBlob.size,          // ⚠️ Should be 'size'
  width: actualWidth,                  // ⚠️ Not in standard Photo
  height: actualHeight,                // ⚠️ Not in standard Photo

  // ✅ TYPE MARKERS
  type: 'collage',                     // ✅ Matches pattern
  isCollage: true,                     // ✅ Extra marker

  // ✅ COLLAGE-SPECIFIC (OK)
  collageData: { ... },                // ✅ Collage metadata
  collageEditorData: { ... },          // ✅ Editor state

  // ❌ MISSING CRITICAL FIELDS (See Section 3)
}
```

---

## 3️⃣ Photo vs Collage Diff Report

### ❌ MISSING FIELDS IN COLLAGE (CRITICAL)

| Field | Impact | Severity |
|-------|--------|----------|
| `deleted` | **Query exclusion** - `where('deleted', '==', false)` filters out collages | 🔴 CRITICAL |
| `deletedAt` | Trash functionality broken | 🔴 CRITICAL |
| `deletedBy` | Audit trail missing | 🔴 CRITICAL |
| `order` | Manual sorting broken | 🔴 CRITICAL |
| `uploadedAt` | Timeline grouping broken | 🔴 CRITICAL |
| `displayDate` | Fallback date missing | 🔴 CRITICAL |
| `dateTaken` | Timeline grouping broken | 🟡 HIGH |
| `takenAt` | Timeline grouping broken | 🟡 HIGH |
| `storageBackend` | Storage tracking incomplete | 🟡 MEDIUM |
| `r2Url` | Redundant but expected | 🟡 MEDIUM |
| `category` | Category filter broken | 🟢 LOW |
| `aiAnalyzed` | AI filter broken | 🟢 LOW |
| `analyzedAt` | Audit trail incomplete | 🟢 LOW |
| `faces` | Face search broken | 🟢 LOW |

### ⚠️ NAMING MISMATCHES

| Photo Field | Collage Field | Impact |
|-------------|---------------|--------|
| `size` | `fileSize` | Size-based queries/filters won't match | 🟡 MEDIUM |

### ✅ EXTRA FIELDS IN COLLAGE (OK)

| Field | Purpose | Impact |
|-------|---------|--------|
| `isCollage` | Type marker | ✅ Helpful |
| `collageData` | Collage metadata | ✅ Required |
| `collageEditorData` | Editor state | ✅ Required |
| `width` | Dimensions | ✅ Useful |
| `height` | Dimensions | ✅ Useful |

---

## 4️⃣ Query & Filtering Compatibility Matrix

### Firestore Queries

| Query Location | Fields Used | Collage Status | Notes |
|----------------|-------------|----------------|-------|
| **firebase.js:354-358** | | | |
| `getPhotosByUser` | `userId`, `deleted` | ❌ EXCLUDED | `where('deleted', '==', false)` filters out collages (undefined !== false) |
| **firebase.js:403-407** | | | |
| `listenToPhotosByUser` | `userId`, `deleted` | ❌ EXCLUDED | Real-time listener excludes collages |

**Result:** Collages are **NEVER returned** by primary photo queries.

---

### Album Filtering (AlbumPage.jsx:143-146)

```javascript
return safePhotos.filter(
  (p) => p.albumId === album.id && p.type !== 'document'
)
```

| Condition | Collage Status | Notes |
|-----------|----------------|-------|
| `p.albumId === album.id` | ✅ Works | Collage has albumId |
| `p.type !== 'document'` | ✅ Works | Collage type is 'collage' |

**Result:** Would work **IF** collages passed the query stage.

---

### Timeline Grouping (PhotoGridUnified.jsx:167-246)

```javascript
if (groupBy === 'dateTaken' && photo.dateTaken) {
  dateValue = photo.dateTaken
} else if (groupBy === 'createdAt' && photo.createdAt) {
  dateValue = photo.createdAt
} else if (groupBy === 'uploadDate' && (photo.uploadedAt || photo.uploadDate)) {
  dateValue = photo.uploadedAt || photo.uploadDate
}
```

| Group By | Required Fields | Collage Status | Notes |
|----------|-----------------|----------------|-------|
| `dateTaken` | `dateTaken` | ❌ Missing | Falls through to older group |
| `createdAt` | `createdAt` | ✅ Works | Collage has createdAt |
| `uploadDate` | `uploadedAt` | ❌ Missing | Falls through to older group |

**Result:** Collages always end up in "Older" group when using date-based grouping.

---

### Sorting (AlbumPage.jsx:193-216)

| Sort Option | Required Fields | Collage Status | Notes |
|-------------|-----------------|----------------|-------|
| `manual` | `order` | ❌ Broken | Collage has no order field (defaults to 0) |
| `date-desc` | `dateTaken` OR `createdAt` OR `uploadedAt` | ⚠️ Partial | Falls back to createdAt only |
| `date-asc` | `dateTaken` OR `createdAt` OR `uploadedAt` | ⚠️ Partial | Falls back to createdAt only |
| `name-asc` | `name` | ✅ Works | Collage has name |
| `name-desc` | `name` | ✅ Works | Collage has name |

**Result:** Manual sort broken, date sort unreliable.

---

### Category Filter (AlbumPage.jsx:180-182)

```javascript
if (filterCategory !== 'all') {
  result = result.filter((p) => p.category === filterCategory)
}
```

| Field | Collage Status | Impact |
|-------|----------------|--------|
| `category` | ❌ Missing | Filtered out when any category selected |

**Result:** Collages disappear when category filter is active.

---

### AI Filter (AlbumPage.jsx:185-189)

```javascript
if (filterAI === 'analyzed') {
  result = result.filter((p) => p.aiAnalyzed)
} else if (filterAI === 'not-analyzed') {
  result = result.filter((p) => !p.aiAnalyzed)
}
```

| Field | Collage Status | Impact |
|-------|----------------|--------|
| `aiAnalyzed` | ❌ Missing | Filtered out when "analyzed" selected, shown in "not-analyzed" |

**Result:** Collages only appear in "not-analyzed" filter.

---

### Collage Detection (PhotoGridUnified.jsx:374, AlbumPage.jsx:252)

```javascript
const isCollage = photo.type === 'collage' || photo.isCollage
```

| Check | Collage Status | Notes |
|-------|----------------|-------|
| `type === 'collage'` | ✅ Works | Type marker present |
| `isCollage` | ✅ Works | Extra marker present |

**Result:** Collage detection works perfectly (when collages are present).

---

## 5️⃣ Root Cause Conclusion

### Is the current collage document bit-for-bit compatible with the Photo contract?

**NO.** Collages are missing **13 critical fields**, including the **query-essential `deleted` field**.

---

### Which exact fields prevent visibility?

**PRIMARY BLOCKER:**
1. **`deleted` field missing** → Collages excluded by `where('deleted', '==', false)` in ALL primary queries

**SECONDARY ISSUES (if query was fixed):**
2. **`order` field missing** → Manual sorting broken
3. **`uploadedAt` field missing** → Timeline grouping broken
4. **`displayDate` field missing** → Fallback date sorting broken
5. **`dateTaken`/`takenAt` missing** → Timeline grouping broken
6. **`category` missing** → Category filtering broken
7. **`aiAnalyzed` missing** → AI filtering broken

---

### Is useCollageData redundant given the Photo pipeline?

**YES, PARTIALLY.**

**Observations:**
- `useCollageData.js` provides CRUD operations for the old `users/{uid}/collages` subcollection (lines 36-62)
- Current implementation in `CollageNewPage.jsx` **bypasses useCollageData** and writes directly to the `photos` collection (lines 304-342)
- `useCollageData` is only used in `CollageEditPage.jsx` for reading existing collages, but **NOT for saving**

**Verdict:** useCollageData is **partially redundant** because:
- ✅ It's still used for real-time listeners and reading legacy collages
- ❌ It's NOT used for creating/saving new collages
- ⚠️ The codebase has **two competing storage locations** for collages:
  - Old: `users/{uid}/collages` (used by useCollageData)
  - New: `photos` collection (used by CollageNewPage)

---

### Are there multiple competing "truths" for what a photo is?

**YES.** There are **THREE competing definitions**:

1. **Photo Upload Contract** (`firebase.js:uploadPhoto`)
   - Comprehensive 40+ field contract
   - Includes query-critical fields (`deleted`, `order`, `uploadedAt`)
   - Includes timeline fields (`dateTaken`, `displayDate`)
   - Includes metadata fields (`category`, `aiAnalyzed`)

2. **Collage Save Contract** (`CollageNewPage.jsx:304-339`)
   - Minimal 18-field contract
   - Missing query-critical fields
   - Missing timeline fields
   - Missing metadata fields
   - Uses inconsistent naming (`fileSize` vs `size`)

3. **Display Contract** (Inferred from PhotoGridUnified, AlbumPage)
   - Expects both upload and timeline fields
   - Expects `deleted` field for queries
   - Expects `order` field for manual sorting
   - Expects `category` and `aiAnalyzed` for filters

**Conclusion:** The collage implementation creates documents that **fail to satisfy** the display contract, resulting in invisibility and broken functionality.

---

## 6️⃣ Source Code References

### Query Definition Points

| File | Line | Issue |
|------|------|-------|
| `firebase.js` | 354-358 | `getPhotosByUser` requires `deleted === false` |
| `firebase.js` | 403-407 | `listenToPhotosByUser` requires `deleted === false` |
| `firebase.js` | 1376-1378 | Photo upload sets `deleted: false` |
| `CollageNewPage.jsx` | 304-339 | Collage save **omits** `deleted` field |

### Timeline Grouping Points

| File | Line | Issue |
|------|------|-------|
| `PhotoGridUnified.jsx` | 187-201 | Requires `dateTaken`, `createdAt`, or `uploadedAt` |
| `CollageNewPage.jsx` | 304-339 | Collage has `createdAt` only |
| `firebase.js` | 1387-1388 | Photo has `uploadedAt` and `displayDate` |

### Sorting Points

| File | Line | Issue |
|------|------|-------|
| `AlbumPage.jsx` | 196-200 | Manual sort requires `order` field |
| `firebase.js` | 1373 | Photo sets `order: Date.now()` |
| `CollageNewPage.jsx` | 304-339 | Collage has no `order` field |

### Filter Points

| File | Line | Issue |
|------|------|-------|
| `AlbumPage.jsx` | 180-189 | Category and AI filters |
| `firebase.js` | 1407-1421 | Photo has `category` and `aiAnalyzed` |
| `CollageNewPage.jsx` | 304-339 | Collage missing these fields |

---

## 7️⃣ Final Verdict: Data Contract Compatibility

### Summary Table

| Category | Photo Contract | Collage Implementation | Compatible? |
|----------|----------------|------------------------|-------------|
| **Query Fields** | `deleted`, `deletedAt`, `deletedBy` | ❌ Missing | 🔴 NO |
| **Ordering Fields** | `order` | ❌ Missing | 🔴 NO |
| **Timeline Fields** | `uploadedAt`, `displayDate`, `dateTaken`, `takenAt` | ❌ Missing | 🔴 NO |
| **Metadata Fields** | `category`, `aiAnalyzed`, `analyzedAt`, `faces` | ❌ Missing | 🔴 NO |
| **Storage Fields** | `size`, `storageBackend`, `r2Url` | ⚠️ Partial (fileSize instead) | 🟡 PARTIAL |
| **Core Fields** | `userId`, `albumId`, `url`, `name`, `createdAt`, `updatedAt` | ✅ Present | ✅ YES |
| **Type Fields** | `type`, `favorite`, `tags`, `aiTags` | ✅ Present | ✅ YES |
| **Collage-Specific** | N/A | ✅ Extra fields (`collageData`, etc.) | ✅ COMPATIBLE |

---

### Compatibility Score: **45% (18/40 required fields)**

**VERDICT:** Collages are **NOT compatible** with the Photo data contract. The current implementation creates documents that:
- ❌ Are excluded by Firestore queries
- ❌ Break timeline grouping
- ❌ Break manual sorting
- ❌ Break category/AI filtering
- ⚠️ Use inconsistent field naming

---

## 📌 Critical Action Items (Not Implemented - For Reference Only)

**This is a READ-ONLY audit. No changes have been made.**

To achieve compatibility, the following fields must be added to collages:

### Priority 1 - Query Compatibility (CRITICAL)
```javascript
deleted: false,
deletedAt: null,
deletedBy: null,
```

### Priority 2 - Timeline & Sorting (HIGH)
```javascript
order: Date.now(),
uploadedAt: new Date().toISOString(),
displayDate: new Date().toISOString(), // Or use creation date of first photo
```

### Priority 3 - Metadata (MEDIUM)
```javascript
category: 'collage',  // Or derive from template
aiAnalyzed: true,     // Collages are "analyzed" by design
analyzedAt: new Date().toISOString(),
faces: 0,             // Or aggregate from source photos
```

### Priority 4 - Storage Consistency (LOW)
```javascript
size: collageBlob.size,         // Rename fileSize → size
storageBackend: 'r2',           // Add backend marker
r2Url: collageUrl,              // Duplicate url for consistency
```

---

## 🏁 Audit Complete

**Date:** 2026-01-12
**Auditor:** Claude Code (Automated Analysis)
**Status:** READ-ONLY ANALYSIS - NO MODIFICATIONS MADE
**Files Analyzed:** 7 core files (usePhotoData, useCollageData, PhotoGridUnified, AlbumPage, CollageNewPage, CollageEditPage, firebase.js)

---

**End of Audit Report**
