# Phase 4 - Orchestrated Execution Plan

## Execution Strategy

Execute Phase 4 in sequence with validation gates. After each subsection completes:
1. Run tests
2. Verify functionality  
3. If pass → continue to next subsection
4. If fail → stop and report issue

## Prerequisites

```bash
# Before starting Phase 4
npm install idb --save
npm install workbox-window --save
```

---

## Phase 4.1 - Real-Time Synchronization

### Step 1: Sync Manager Hook

**File:** `/src/hooks/useSyncManager.js`

**Pattern:** Follow `usePhotoData.js` structure

**Core Logic:**
```typescript
// onSnapshot for real-time updates
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'albums'),
    where('userId', '==', user.uid),
    (snapshot) => handleChanges(snapshot.docChanges())
  );
  return unsubscribe;
}, [user.uid]);
```

**Returns:**
```typescript
{
  syncStatus: 'idle' | 'syncing' | 'error',
  lastSyncTime: Date,
  pendingOperations: number,
  forceSync: () => Promise<void>
}
```

**Validation:**
- [ ] Hook compiles without errors
- [ ] Can subscribe to Firestore updates
- [ ] State updates when data changes

---

### Step 2: Offline Queue Manager

**File:** `/src/services/offlineQueueManager.js`

**Dependencies:** `idb` package

**Schema:**
```javascript
// IndexedDB schema
{
  storeName: 'operations',
  keyPath: 'id',
  indexes: [
    { name: 'timestamp', keyPath: 'timestamp' },
    { name: 'status', keyPath: 'status' }
  ]
}
```

**Operations:**
```javascript
export async function queueOperation(operation) {
  // Store in IndexedDB
  // operation = { type, data, timestamp, retryCount }
}

export async function processQueue() {
  // Get all pending operations
  // Execute in order
  // Remove on success, increment retryCount on failure
}
```

**Validation:**
- [ ] Can write to IndexedDB
- [ ] Can read from IndexedDB
- [ ] Queue processes operations in order

---

### Step 3: Sync Status Indicator Component

**File:** `/src/components/SyncStatusIndicator.jsx`

**Pattern:** Follow `ErrorBoundary.jsx` for UI patterns

**States:**
- Online + synced: Green dot + "All synced"
- Online + syncing: Blue spinner + "Syncing..."
- Offline: Orange dot + "Offline - X pending"
- Error: Red dot + "Sync error"

**Position:** Fixed top-right corner

**Validation:**
- [ ] Component renders
- [ ] Shows correct status based on sync state
- [ ] Clicking opens sync details modal

---

### Step 4: Integration & Testing

**Changes needed:**
1. Add `syncSlice` to `/src/state/store.js`
2. Add `<SyncStatusIndicator />` to `/src/App.jsx`
3. Update photo upload to use offline queue

**Test Cases:**
```bash
# Manual testing checklist:
1. Upload photo while online → Should sync immediately
2. Go offline (dev tools) → Upload photo → Should queue
3. Go online → Should auto-sync queued operations
4. Create album → Edit name → Verify real-time sync
```

**Validation Gate:**
- [ ] All manual tests pass
- [ ] No console errors
- [ ] Sync indicator shows correct status

**→ If validation passes, continue to Phase 4.2**

---

## Phase 4.2 - Sharing & Collaboration

### Step 1: Firestore Schema Update

**File:** `firestore.rules`

**New Collections:**
```javascript
match /shared_links/{linkId} {
  allow read: if true; // Public links
  allow create: if request.auth != null;
  allow delete: if request.auth.uid == resource.data.createdBy;
}

match /activity/{activityId} {
  allow read: if request.auth.uid in resource.data.participants;
  allow create: if request.auth != null;
}
```

**Albums Schema Update:**
Study existing `/src/firebase/firestoreService.js` for patterns

Add fields:
```javascript
{
  shared: boolean,
  sharedWith: [{userId, permission, addedAt}],
  publicLink: {enabled, token, expiresAt, allowDownload}
}
```

**Validation:**
- [ ] Firebase rules deploy successfully
- [ ] Can create shared_links document
- [ ] Can read activity document

---

### Step 2: Share Modal Component

**File:** `/src/components/ShareModal.jsx`

**Pattern:** Follow existing modals in `/src/components/`

**Features:**
- Email input with validation
- Permission dropdown (view/edit)
- Public link toggle
- Link expiry date picker
- Copy link button

**Integration:** Add share button to album cards

**Validation:**
- [ ] Modal opens/closes
- [ ] Can send email invites
- [ ] Can generate public link
- [ ] Copy to clipboard works

---

### Step 3: Shared Albums Page

**File:** `/src/pages/SharedWithMePage.jsx`

**Pattern:** Follow `HomeDashboard.jsx` layout

**Sections:**
- "Shared by me" - Albums I've shared
- "Shared with me" - Albums others shared

**Validation:**
- [ ] Page renders
- [ ] Shows correct albums
- [ ] Can navigate to shared albums

---

### Step 4: Public Link Handler

**File:** `/src/pages/PublicAlbumPage.jsx`

**Route:** `/shared/:token`

**Logic:**
```javascript
// Fetch album by token
// Check expiry
// Show photos (no edit permissions)
// Track view count
```

**Validation:**
- [ ] Public link opens album
- [ ] Expired links show error
- [ ] View count increments

---

### Step 5: Activity Feed

**File:** `/src/components/ActivityFeed.jsx`

**Display:**
- Recent actions on shared albums
- Filter by album
- Real-time updates via onSnapshot

**Validation:**
- [ ] Feed shows recent activity
- [ ] Updates in real-time
- [ ] Can filter by album

---

### Step 6: Integration & Testing

**Routes to add:**
```javascript
<Route path="/shared" element={<SharedWithMePage />} />
<Route path="/shared/:token" element={<PublicAlbumPage />} />
```

**Test Cases:**
```bash
1. Share album with email → Recipient receives
2. Generate public link → Link works in incognito
3. Edit shared album → Activity logged
4. Link expires → Shows error message
```

**Validation Gate:**
- [ ] All test cases pass
- [ ] No console errors
- [ ] Firebase rules working correctly

**→ If validation passes, continue to Phase 4.3**

---

## Phase 4.3 - Comments & Reactions

### Step 1: Firestore Schema

**New Collections:**
```javascript
comments: {
  photoId: string,
  userId: string,
  text: string,
  createdAt: timestamp,
  parentId: string | null,
  mentions: string[]
}

reactions: {
  photoId: string,
  userId: string,
  emoji: string,
  createdAt: timestamp
}

notifications: {
  userId: string,
  type: 'comment' | 'reaction' | 'share' | 'mention',
  photoId: string,
  fromUserId: string,
  read: boolean,
  createdAt: timestamp
}
```

**Validation:**
- [ ] Collections created
- [ ] Security rules set
- [ ] Can CRUD documents

---

### Step 2: Comment Thread Component

**File:** `/src/components/CommentThread.jsx`

**Features:**
- Threaded replies (parentId)
- @mentions with autocomplete
- Real-time updates
- Delete own comments

**Validation:**
- [ ] Can post comment
- [ ] Can reply to comment
- [ ] @mentions work
- [ ] Updates in real-time

---

### Step 3: Reaction Picker Component

**File:** `/src/components/ReactionPicker.jsx`

**Pattern:** Emoji picker dropdown

**Reactions:**
```javascript
const REACTIONS = ['❤️', '👍', '😂', '😮', '🎉', '🔥'];
```

**Validation:**
- [ ] Picker opens
- [ ] Can add reaction
- [ ] Can remove reaction
- [ ] Shows reaction counts

---

### Step 4: Notification System

**File:** `/src/components/NotificationPanel.jsx`

**Features:**
- Unread count badge
- Mark as read
- Navigate to photo
- Real-time updates

**Capacitor Push (optional for now):**
```javascript
// Placeholder for Phase 5
// Will integrate Capacitor Push Plugin later
```

**Validation:**
- [ ] Panel shows notifications
- [ ] Can mark as read
- [ ] Navigate works
- [ ] Real-time updates

---

### Step 5: Integration & Testing

**Add to photo detail view:**
```javascript
<CommentThread photoId={photo.id} />
<ReactionPicker photoId={photo.id} />
```

**Add to header:**
```javascript
<NotificationBell count={unreadCount} />
```

**Test Cases:**
```bash
1. Add comment → Shows in thread
2. Reply to comment → Nested correctly
3. @mention user → Notification created
4. Add reaction → Updates count
5. Delete comment → Removed from thread
```

**Validation Gate:**
- [ ] All test cases pass
- [ ] No console errors
- [ ] Real-time updates working

**→ Phase 4 Complete! Ready for Phase 5**

---

## Success Criteria for Phase 4

Before moving to Phase 5, verify:

### Functional Tests
- [ ] Photos sync across browser tabs in real-time
- [ ] Offline operations queue and sync when online
- [ ] Can share album via email and public link
- [ ] Activity feed shows all actions
- [ ] Comments thread correctly
- [ ] Reactions update in real-time
- [ ] Notifications work

### Technical Tests
- [ ] No console errors
- [ ] Lighthouse performance > 80
- [ ] No memory leaks (check with dev tools)
- [ ] IndexedDB operations work
- [ ] Firebase quota not exceeded

### Code Quality
- [ ] All new files follow existing patterns
- [ ] No duplicate code
- [ ] Proper error handling
- [ ] TypeScript types (if applicable)

---

## Rollback Plan

If Phase 4.X fails validation:

1. Identify failing component
2. Check console errors
3. Review Firebase rules
4. Test individual functions
5. Fix and re-validate
6. Document issue in `/docs/known-issues.md`

---

## Token Optimization Tips

For each subsection, Claude Code should:

1. **Read existing patterns first** (minimize explanation needed)
2. **Ask specific questions** instead of general ones
3. **Implement incrementally** (one file at a time)
4. **Test after each file** before moving to next
5. **Reference this document** instead of asking for full specs

---

## Estimated Timeline

- Phase 4.1: 4-6 hours
- Phase 4.2: 6-8 hours  
- Phase 4.3: 2-3 hours

Total: ~12-17 hours (depending on validation issues)

---

## Next Steps After Phase 4

Once all validation gates pass:
→ Execute Phase 5 orchestration (PWA & deployment)
