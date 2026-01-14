# Date Source Audit Report

**Date:** 2025-12-21
**Scope:** SearchPage date grouping and sorting logic
**Status:** DIAGNOSTIC ONLY - No functional changes made

---

## Executive Summary

This audit documents the **exact date field usage** across Pixtr's photo grouping and sorting logic. The audit reveals **inconsistencies** between different parts of the codebase regarding which date fields are used as the "source of truth."

### Key Findings

1. **SearchPage** uses: `takenAt → uploadedAt → createdAt`
2. **groupPhotosByTime.js** uses: `dateTaken → createdAt` (no uploadedAt)
3. **Timeline dateGrouping.js** uses: `createdAt` only
4. **Firebase uploadPhoto** stores: `takenAt`, `dateTaken`, `uploadedAt`, `displayDate`, `createdAt`

**Inconsistency Detected:** Three different fallback chains exist across the codebase.

---

## 1. SearchPage.jsx - Date Grouping Logic

### Location
`src/pages/SearchPage.jsx:368-433`

### Current Behavior

**Function:** `getDisplayDate(photo)`

**Fallback Order:**
```javascript
const dateValue = photo.takenAt || photo.uploadedAt || photo.createdAt
```

1. **Primary:** `photo.takenAt` (EXIF date from newly uploaded photos)
2. **Secondary:** `photo.uploadedAt` (upload timestamp)
3. **Tertiary:** `photo.createdAt` (legacy/fallback)

### Purpose
- **Grouping:** Determines which month/year bucket a photo belongs to
- **Sorting:** Determines order within each group (newest first)

### Logging Added
```javascript
console.log('[DATE AUDIT]', {
  id: photo.id,
  name: photo.name,
  usedSource: usedSource,
  takenAt: photo.takenAt,
  uploadedAt: photo.uploadedAt,
  createdAt: photo.createdAt,
  displayDate: photo.displayDate,
  dateTaken: photo.dateTaken,
  parsedDate: date?.toISOString(),
  isValid: isValid(date),
})
```

### Date Format Handling
Supports multiple formats:
- `Date` object
- ISO string (`"2024-07-15T14:30:00.000Z"`)
- Firestore Timestamp (`.toDate()` method)
- Unix timestamp (number)

### Issues Identified
- ✅ **Correct:** Uses `takenAt` (new canonical field)
- ⚠️ **Ignores:** `photo.displayDate` (stored in Firestore but not used)
- ⚠️ **Ignores:** `photo.dateTaken` (legacy field)

---

## 2. groupPhotosByTime.js - Time-Based Grouping

### Location
`src/utils/groupPhotosByTime.js:15-47`

### Current Behavior

**Function:** `getPhotoDate(photo)`

**Fallback Order:**
```javascript
// Try dateTaken first (most accurate)
if (photo.dateTaken) { /* ... */ }

// Fallback to createdAt
if (photo.createdAt) { /* ... */ }
```

1. **Primary:** `photo.dateTaken` (LEGACY - old EXIF field)
2. **Secondary:** `photo.createdAt` (upload/creation timestamp)

### Issues Identified
- ❌ **Missing:** Does NOT check `photo.takenAt` (new canonical field)
- ❌ **Missing:** Does NOT check `photo.uploadedAt`
- ❌ **Outdated:** Uses `dateTaken` instead of `takenAt`

### Impact
Used by:
- HomeDashboard "Recent" photos grouping (Today/Yesterday/This Week)
- Any component that imports this utility

**Result:** Recent photos may show incorrect dates if they only have `takenAt` but not `dateTaken`.

---

## 3. Timeline Feature - Date Grouping

### Location
`src/features/timeline/utils/dateGrouping.js:16-46`

### Current Behavior

**Function:** `getPhotoDate(photo)`

**Fallback Order:**
```javascript
if (!photo || !photo.createdAt) {
  console.warn('Photo missing createdAt:', photo)
  return null
}
```

1. **Primary:** `photo.createdAt` ONLY

### Issues Identified
- ❌ **Missing:** Does NOT check `photo.takenAt`
- ❌ **Missing:** Does NOT check `photo.dateTaken`
- ❌ **Missing:** Does NOT check `photo.uploadedAt`
- ❌ **Inaccurate:** Groups photos by upload date, NOT capture date

### Impact
- Timeline groups photos by when they were **uploaded**, not when they were **taken**
- EXIF dates are completely ignored
- A photo from July 2024 uploaded in December 2025 will appear in December 2025

---

## 4. Firebase uploadPhoto - Field Storage

### Location
`src/firebase.js:938-944`

### Current Behavior

**Fields Stored:**
```javascript
// Date fields (EXIF-enhanced)
...(takenAt && { takenAt: takenAt }), // ✅ Canonical EXIF date (only if exists)
dateTaken: takenAt,                    // ✅ Keep for backward compatibility
uploadedAt: new Date().toISOString(),
displayDate: takenAt || new Date().toISOString(),
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
```

### Field Definitions

| Field | Purpose | Value Source | Always Set? |
|-------|---------|--------------|-------------|
| `takenAt` | **NEW** canonical EXIF date | EXIF DateTimeOriginal | ❌ Only if EXIF exists |
| `dateTaken` | **LEGACY** EXIF date | Same as takenAt | ✅ Yes (null if no EXIF) |
| `uploadedAt` | Upload timestamp | `new Date()` | ✅ Always |
| `displayDate` | Intended display date | `takenAt ?? uploadedAt` | ✅ Always |
| `createdAt` | Firestore creation time | `new Date()` | ✅ Always |
| `updatedAt` | Last modified time | `new Date()` | ✅ Always |

### Issues Identified
- ✅ **Good:** `takenAt` is conditionally stored (only when EXIF exists)
- ⚠️ **Unused:** `displayDate` field is stored but **NOT used** by SearchPage
- ⚠️ **Redundant:** Both `takenAt` and `dateTaken` store the same value

---

## 5. Mismatch Analysis

### Intended Model (from firebase.js)
The `displayDate` field suggests the intended logic is:
```javascript
displayDate = takenAt ?? uploadedAt
```

### Actual Implementation (SearchPage.jsx)
```javascript
dateValue = photo.takenAt || photo.uploadedAt || photo.createdAt
```

**Mismatch:**
- SearchPage adds `createdAt` as a third fallback
- SearchPage does NOT use the stored `displayDate` field
- SearchPage re-implements the fallback logic instead of using the stored value

### Recommendation
**Option A:** Use stored `displayDate` field directly
```javascript
const dateValue = photo.displayDate || photo.uploadedAt || photo.createdAt
```

**Option B:** Keep current logic but update `displayDate` calculation to match
```javascript
// In firebase.js
displayDate: takenAt || uploadedAt || new Date().toISOString()
```

---

## 6. Field Usage Matrix

| Date Field | SearchPage | groupPhotosByTime | Timeline | Firebase Storage |
|------------|-----------|-------------------|----------|------------------|
| `takenAt` | ✅ Primary | ❌ Not checked | ❌ Not checked | ✅ Stored (conditional) |
| `dateTaken` | ❌ Not checked | ✅ Primary | ❌ Not checked | ✅ Stored (always) |
| `uploadedAt` | ✅ Secondary | ❌ Not checked | ❌ Not checked | ✅ Stored (always) |
| `createdAt` | ✅ Tertiary | ✅ Secondary | ✅ Primary | ✅ Stored (always) |
| `displayDate` | ❌ Not used | ❌ Not used | ❌ Not used | ✅ Stored (always) |

**Legend:**
- ✅ Used/Stored
- ❌ Not used/not checked
- 🔶 Partially used

---

## 7. Code Locations Reference

### SearchPage Date Logic
```
File: src/pages/SearchPage.jsx
Lines: 368-433
Function: getDisplayDate(photo)
Fallback: takenAt → uploadedAt → createdAt
```

### groupPhotosByTime Utility
```
File: src/utils/groupPhotosByTime.js
Lines: 15-47
Function: getPhotoDate(photo)
Fallback: dateTaken → createdAt
```

### Timeline Date Logic
```
File: src/features/timeline/utils/dateGrouping.js
Lines: 16-46
Function: getPhotoDate(photo)
Fallback: createdAt ONLY
```

### Firebase Upload
```
File: src/firebase.js
Lines: 938-944
Function: uploadPhoto()
Stores: takenAt, dateTaken, uploadedAt, displayDate, createdAt, updatedAt
```

---

## 8. Diagnostic Logging

### Browser Console Output
When SearchPage loads, you will see:
```
[DATE AUDIT] {
  id: "abc123",
  name: "IMG_1234.jpg",
  usedSource: "takenAt (EXIF)",
  takenAt: "2024-07-15T14:30:00.000Z",
  uploadedAt: "2025-12-21T10:00:00.000Z",
  createdAt: "2025-12-21T10:00:00.000Z",
  displayDate: "2024-07-15T14:30:00.000Z",
  dateTaken: "2024-07-15T14:30:00.000Z",
  parsedDate: "2024-07-15T14:30:00.000Z",
  isValid: true
}
```

### How to Test
1. Open browser DevTools Console
2. Navigate to SearchPage
3. Look for `[DATE AUDIT]` logs
4. Inspect `usedSource` field to see which date was used

---

## 9. Fallback Decision Tree

```
Photo has takenAt?
├─ YES → Use takenAt ✅
└─ NO  → Photo has uploadedAt?
          ├─ YES → Use uploadedAt ✅
          └─ NO  → Photo has createdAt?
                    ├─ YES → Use createdAt ✅
                    └─ NO  → ❌ Photo missing all dates (should never happen)
```

---

## 10. Recommendations for Future Refactor

### Short Term (No Breaking Changes)
1. ✅ Keep current SearchPage logic
2. ✅ Update `groupPhotosByTime.js` to check `takenAt` before `dateTaken`
3. ✅ Update Timeline to check `takenAt` and `uploadedAt` before `createdAt`

### Medium Term (Unified Logic)
1. Create a single `getCanonicalDate(photo)` utility
2. Use it consistently across all components
3. Implement fallback: `displayDate → takenAt → uploadedAt → createdAt`

### Long Term (Data Migration)
1. Migrate old photos to populate `takenAt` from `dateTaken`
2. Deprecate `dateTaken` field
3. Use `displayDate` as the single source of truth
4. Remove redundant fallback logic

---

## 11. Zero Functional Changes Guarantee

**Changes Made in This Patch:**
- ✅ Added logging statements (diagnostic only)
- ✅ Added comments explaining current behavior
- ✅ Created this audit report

**Runtime Behavior:**
- ✅ Identical grouping logic
- ✅ Identical sorting logic
- ✅ Identical date fallback order
- ✅ No changes to Firestore queries
- ✅ No changes to photo rendering

**Verification:**
```bash
# Build succeeds
npm run build

# Same photos appear in same month groups
# Same sort order within groups
# Console shows [DATE AUDIT] logs for debugging
```

---

## 12. Next Steps

1. **Review this audit** with the team
2. **Test in browser** to see which date sources are actually used
3. **Decide on unified approach** (Option A or Option B from Section 5)
4. **Plan refactor** to eliminate inconsistencies
5. **Consider data migration** for old photos without `takenAt`

---

**Audit completed:** 2025-12-21
**Reviewed by:** Claude (Automated)
**Status:** Ready for team review
