# Freemium Testing Guide

Comprehensive test scenarios for Pixtr freemium implementation (Phases 1-4).

---

## 🎯 Test Environment Setup

### Test Accounts Needed
1. **GRATIS User** - New account (default tier)
2. **LITE User** - Upgraded to LITE ($4.99/month)
3. **PRO User** - Upgraded to PRO ($9.99/month)
4. **ADMIN User** - Admin role (unlimited everything)

### Reset Test Data
```javascript
// Browser Console (for testing only)
localStorage.removeItem('pixtr_modals_shown') // Reset modal tracking
```

---

## Phase 1: Counters & Limits

### Test 1.1: Album Limit (GRATIS)
**Goal:** Verify 5 album limit is enforced

**Steps:**
1. Login as GRATIS user
2. Create 5 albums
3. Try to create 6th album
4. **Expected:**
   - Error toast: "Album limit reached (5/5). Upgrade to LITE for unlimited albums."
   - Album creation blocked
   - Counter stays at 5

**Verify:**
- Check Firestore: `users/{uid}/currentAlbumCount === 5`
- UI shows album limit

---

### Test 1.2: Photo Limit per Album (GRATIS)
**Goal:** Verify 20 photos per album limit

**Steps:**
1. Login as GRATIS user
2. Create an album
3. Upload 20 photos to the album
4. Try to upload 21st photo
5. **Expected:**
   - Error: "Photo limit reached for this album"
   - Upload blocked
   - Album photoCount stays at 20

**Verify:**
- Check Firestore: `albums/{albumId}/photoCount === 20`
- UI blocks photo upload

---

### Test 1.3: Counter Rollback (Album Creation Failure)
**Goal:** Verify rollback on album creation error

**Steps:**
1. Create album with 4 existing albums (4/5 limit)
2. Simulate Firestore error during counter increment
   - Use Firestore emulator or temporary network disconnect
3. **Expected:**
   - Album document deleted (rollback)
   - Counter stays at 4
   - No orphan album created

**Verify:**
- `currentAlbumCount` unchanged
- No extra album in Firestore

---

### Test 1.4: Counter Rollback (Photo Upload Failure)
**Goal:** Verify rollback on photo upload error

**Steps:**
1. Upload photo to album with 19 existing photos
2. Simulate storage upload failure
3. **Expected:**
   - Photo document deleted
   - Storage file deleted
   - Album photoCount stays at 19

**Verify:**
- `photoCount` unchanged
- No orphan photo in Firestore or R2

---

### Test 1.5: Storage Limit (GRATIS)
**Goal:** Verify 750 MB storage limit

**Steps:**
1. Login as GRATIS user
2. Upload photos until approaching 750 MB
3. Try to upload file that exceeds limit
4. **Expected:**
   - Upload blocked
   - Error message shown

**Verify:**
- `users/{uid}/storageUsed` accurate
- UI shows storage warning at 90%

---

## Phase 2: Teasers > Locks

### Test 2.1: Editor - Filter Preview (GRATIS)
**Goal:** GRATIS users can preview all filters but can't save

**Steps:**
1. Login as GRATIS user
2. Open photo in editor
3. Apply multiple filters
4. Adjust intensity slider
5. Try to save
6. **Expected:**
   - All filters visible and functional ✅
   - Preview banner: "🎨 Try all filters! Upgrade to LITE to save."
   - Save blocked with modal: "Love this edit? Upgrade to save it!"

**Verify:**
- No filter hidden from GRATIS users
- Save button shows upgrade modal

---

### Test 2.2: Collage - Full Builder (GRATIS)
**Goal:** GRATIS users can build collages but can't save

**Steps:**
1. Login as GRATIS user
2. Select collage template
3. Add photos to all slots
4. Rotate and arrange photos
5. Try to save
6. **Expected:**
   - Full collage builder functional ✅
   - Preview banner: "🎨 Build your collage! Upgrade to LITE to save."
   - Save blocked with modal: "Beautiful collage! Upgrade to save it"

**Verify:**
- All collage tools work
- Save shows upgrade modal

---

### Test 2.3: Modal Fatigue Prevention
**Goal:** Same modal doesn't show twice in 24 hours

**Steps:**
1. Trigger album-limit modal
2. Close modal
3. Immediately try to create another album
4. **Expected:**
   - Modal does NOT appear second time
   - Error toast shown instead
   - Modal blocked for 24 hours

**Verify:**
- `localStorage.getItem('pixtr_modals_shown')` has timestamp
- `canShowModal('album-limit')` returns `false`

---

## Phase 3: Upgrade Modals

### Test 3.1: Album Limit Modal
**Goal:** Modal appears when hitting album limit

**Steps:**
1. Login as GRATIS user with 4 albums
2. Create 5th album (success)
3. Try to create 6th album
4. **Expected:**
   - Modal appears: "You've hit the album limit!"
   - Pain point: "GRATIS = 5 albums max"
   - Solution: "LITE = Unlimited albums"
   - Features listed
   - CTA: "Upgrade to LITE"

**Verify:**
- Modal UI renders correctly
- "Maybe later" closes modal
- "Upgrade to LITE" triggers upgrade flow

---

### Test 3.2: Photo Limit Modal
**Goal:** Modal appears when album is full

**Steps:**
1. GRATIS user uploads 20 photos to album
2. Try to upload 21st photo
3. **Expected:**
   - Modal appears: "Album full!"
   - Shows feature comparison
   - CTA to upgrade

---

### Test 3.3: Editor Save Modal
**Goal:** Modal appears when GRATIS tries to save edits

**Steps:**
1. GRATIS user applies filter
2. Click Save
3. **Expected:**
   - Modal appears: "Love this edit? Upgrade to save it!"
   - Psychological messaging
   - CTA to upgrade

---

### Test 3.4: Collage Save Modal
**Goal:** Modal appears when GRATIS tries to save collage

**Steps:**
1. GRATIS user builds collage
2. Click Save
3. **Expected:**
   - Modal appears: "Beautiful collage! Upgrade to save it"
   - Shows sunk cost messaging
   - CTA to upgrade

---

## Phase 4: LITE Sweeteners

### Test 4.1: Document Upload (GRATIS Blocked)
**Goal:** GRATIS users cannot upload documents

**Steps:**
1. Login as GRATIS user
2. Try to upload PDF file
3. **Expected:**
   - Upload blocked
   - Error: "Document uploads require LITE or PRO"

**Verify:**
- PDF rejected
- DOCX, XLSX, TXT also blocked

---

### Test 4.2: Document Upload (LITE Allowed)
**Goal:** LITE users can upload documents

**Steps:**
1. Login as LITE user
2. Upload PDF, DOCX, TXT files
3. **Expected:**
   - All documents upload successfully
   - No errors

**Verify:**
- Documents saved to Firestore with `type: 'document'`
- Accessible from Documents page

---

### Test 4.3: Storage Quota Display
**Goal:** Verify correct storage limits shown

**Steps:**
1. Check storage indicator for each tier
2. **Expected:**
   - GRATIS: 750 MB shown
   - LITE: 5 GB shown
   - PRO: 50 GB shown

**Verify:**
- UI displays correct quota
- Percentage calculated correctly

---

## Cross-Tier Testing

### Test CT.1: LITE User (No Limits)
**Goal:** LITE users have no album/photo limits

**Steps:**
1. Login as LITE user
2. Create 10+ albums
3. Upload 50+ photos to one album
4. Save filters and collages
5. Upload documents
6. **Expected:**
   - All operations succeed ✅
   - No limit modals appear
   - 5 GB storage limit

---

### Test CT.2: PRO User (Video Upload)
**Goal:** PRO users can upload videos

**Steps:**
1. Login as PRO user
2. Upload MP4/MOV video
3. **Expected:**
   - Video upload succeeds
   - Thumbnail generated
   - Playback works

---

### Test CT.3: ADMIN User (Unlimited)
**Goal:** ADMIN has no limits

**Steps:**
1. Login as ADMIN user
2. Test all operations
3. **Expected:**
   - Unlimited everything
   - No modals
   - No limits

---

## Edge Cases

### Edge 1: Delete Album (Counter Decrement)
**Goal:** Deleting album decrements counter

**Steps:**
1. GRATIS user with 5 albums
2. Delete one album
3. **Expected:**
   - `currentAlbumCount` → 4
   - Can create new album again

**Verify:**
- Counter accurate in Firestore
- Limit check reflects new count

---

### Edge 2: Delete Photo (Counter Decrement)
**Goal:** Deleting photo decrements album counter

**Steps:**
1. Album with 20 photos
2. Delete one photo
3. **Expected:**
   - `photoCount` → 19
   - Can upload new photo

**Verify:**
- Album photoCount accurate
- Upload unblocked

---

### Edge 3: Rapid Album Creation
**Goal:** Counter handles concurrent requests

**Steps:**
1. Rapidly create 3 albums simultaneously
2. **Expected:**
   - All 3 succeed OR proper error handling
   - Counter accurate (no race condition)

**Verify:**
- No duplicate counter increments
- `currentAlbumCount` matches album count

---

### Edge 4: Network Interruption
**Goal:** Rollback works with network issues

**Steps:**
1. Start album creation
2. Disconnect network mid-operation
3. **Expected:**
   - Proper error handling
   - No partial state (rollback works)
   - Counter stays consistent

---

## Performance Tests

### Perf 1: Limit Check Speed
**Goal:** O(1) counter checks (no getDocs)

**Steps:**
1. Create 5 albums
2. Try to create 6th
3. **Expected:**
   - Limit check instant (< 100ms)
   - Uses `currentAlbumCount` field (O(1))
   - NOT `getDocs()` query (O(n))

**Verify:**
- Network tab shows single `getDoc()`, not `getDocs()`
- Response time < 100ms

---

### Perf 2: Modal Rendering
**Goal:** Modals render smoothly

**Steps:**
1. Trigger upgrade modal
2. **Expected:**
   - Smooth fade-in animation
   - No jank or flicker
   - Responsive on mobile

---

## Regression Tests

### Reg 1: Existing Users (No Counter)
**Goal:** Users without `currentAlbumCount` handled

**Steps:**
1. Simulate old user (no `currentAlbumCount` field)
2. Try to create album
3. **Expected:**
   - Defaults to 0
   - Limit check works
   - Counter initialized

---

### Reg 2: Album Without PhotoCount
**Goal:** Albums without `photoCount` handled

**Steps:**
1. Album missing `photoCount` field
2. Try to upload photo
3. **Expected:**
   - Defaults to 0
   - Limit check works
   - Counter initialized

---

## UI/UX Tests

### UX 1: Error Messages Clear
**Goal:** Users understand limits

**Steps:**
1. Hit various limits
2. **Expected:**
   - Clear error messages
   - Explains tier requirement
   - CTA to upgrade visible

---

### UX 2: Upgrade Modals Emotional
**Goal:** Modals use sunk cost psychology

**Steps:**
1. Build collage for 10 minutes
2. Try to save
3. **Expected:**
   - Modal acknowledges effort: "Beautiful collage!"
   - Creates urgency: "Upgrade to save it"
   - Shows what user will lose

---

## Checklist Summary

- [ ] Test 1.1: Album limit (5 for GRATIS)
- [ ] Test 1.2: Photo limit (20 per album for GRATIS)
- [ ] Test 1.3: Album rollback on error
- [ ] Test 1.4: Photo rollback on error
- [ ] Test 1.5: Storage limit (750 MB for GRATIS)
- [ ] Test 2.1: Filter preview (GRATIS)
- [ ] Test 2.2: Collage preview (GRATIS)
- [ ] Test 2.3: Modal fatigue prevention
- [ ] Test 3.1: Album limit modal
- [ ] Test 3.2: Photo limit modal
- [ ] Test 3.3: Editor save modal
- [ ] Test 3.4: Collage save modal
- [ ] Test 4.1: Document upload blocked (GRATIS)
- [ ] Test 4.2: Document upload allowed (LITE)
- [ ] Test 4.3: Storage quota display
- [ ] Test CT.1: LITE user (no limits)
- [ ] Test CT.2: PRO user (video upload)
- [ ] Test CT.3: ADMIN user (unlimited)
- [ ] Edge 1: Delete album decrements counter
- [ ] Edge 2: Delete photo decrements counter
- [ ] Edge 3: Concurrent album creation
- [ ] Edge 4: Network interruption rollback
- [ ] Perf 1: O(1) limit checks
- [ ] Perf 2: Smooth modal animations
- [ ] Reg 1: Old users without counter
- [ ] Reg 2: Albums without photoCount
- [ ] UX 1: Clear error messages
- [ ] UX 2: Emotional upgrade modals

---

## Known Issues / Future Work

### Future Enhancements
1. **Storage Warning Modal** - Show at 90% storage usage
2. **Batch Operations** - Handle bulk photo uploads with limits
3. **Analytics** - Track modal conversion rates
4. **A/B Testing** - Test different modal copy
5. **Watermarks** - Add "Shared via Pixtr" to GRATIS shares

### Testing Notes
- All tests should pass before production deployment
- Use Firestore emulator for destructive tests
- Document any failing tests as bugs
- Retest after each bug fix

---

**Testing Complete:** Phase 5 ✅
