# PhotoVault Refactor - Claude Code Instructions

## 🎯 Overall Goal

Fix architectural issues in PhotoVault causing duplicate Firestore writes and inefficient data fetching.

---

## 📋 Execution Plan

You will execute the following **4 phases sequentially**, with pause between each for user approval:

### **IMPORTANT RULE:**
- Execute one phase at a time
- After each phase: commit, push, and **PAUSE**
- Tell user: "✅ Phase X complete. Test the app and let me know when I can proceed to Phase Y"
- Wait for explicit approval before next phase

---

## 📂 Phases

### Phase 1: Remove Dead Code ⏱️ 30 min
**File:** `/docs/phases/PHASE_1_dead_code.md`

**Tasks:**
1. Delete `src/utils/deletePhoto.js`
2. Remove unused functions in `src/hooks/usePhotoData.js`
3. Clean up `firestore.rules`

**Commit:** `chore: remove dead code (deletePhoto.js, unused functions, redundant rules)`

**PAUSE → Wait for user approval**

---

### Phase 2: Centralize Firestore ⏱️ 3-4 hours
**File:** `/docs/phases/PHASE_2_centralize.md`

**Tasks:**
1. Extend `usePhotoData.js` with all necessary handlers
2. Refactor `AlbumModal.jsx` to use props callbacks
3. Refactor `PhotoModal.jsx` to use props callbacks
4. Refactor `AlbumPage.jsx` to use hook functions
5. Update `App.js` to pass all handlers as props

**Commit:** `refactor: centralize all Firestore operations in usePhotoData hook`

**PAUSE → Wait for user approval**

---

### Phase 3: Add Guards ⏱️ 1-2 hours
**File:** `/docs/phases/PHASE_3_guards.md`

**Tasks:**
1. Add guard states to `usePhotoData.js`
2. Wrap all mutation functions with reentrancy guards
3. Export guard states for UI feedback

**Commit:** `fix: add reentrancy guards to prevent duplicate writes`

**PAUSE → Wait for user approval**

---

### Phase 4: Optimize Refresh ⏱️ 2-3 hours
**File:** `/docs/phases/PHASE_4_optimize.md`

**Tasks:**
1. Rename `refreshData` to `refreshAllData`
2. Implement optimistic updates in all mutation functions
3. Add selective refresh functions (fallback)
4. Add `getAlbum()` and `getPhoto()` to `firebase.js`

**Commit:** `perf: replace full refresh with optimistic updates (99% fewer Firestore reads)`

**PAUSE → Complete! 🎉**

---

## 🔧 General Guidelines

### For each phase:
1. **Read phase file thoroughly** before starting
2. **Make all changes** described in the phase
3. **Test that code compiles** (`npm start` mentally)
4. **Commit with correct message**
5. **PAUSE** and report to user

### Testing
User will test manually between each phase. Don't continue until instructed.

### Error Handling
If something fails:
- Report error clearly
- Suggest solution based on phase documentation
- Wait for user input

---

## 🚀 Start Command

**For you (Claude Code):**

```bash
# Read master plan
cat docs/REFACTOR_PLAN.md

# Start Phase 1
cat docs/phases/PHASE_1_dead_code.md

# [Perform changes]
# [Commit]
# [PAUSE]
```

**For user (Roger):**

```bash
# Create documentation structure first
mkdir -p docs/phases
mkdir -p docs/audit

# Copy files from outputs to docs:
cp outputs/en/REFACTOR_PLAN.md docs/
cp outputs/en/CLAUDE_CODE_INSTRUCTIONS.md docs/
cp outputs/en/phases/PHASE_*.md docs/phases/
cp outputs/en/README.md docs/

# Commit documentation
git add docs/
git commit -m "docs: add refactor plan and phase documentation"
git push

# Start Claude Code and give this message:
# "Read docs/REFACTOR_PLAN.md and start Phase 1"
```

---

## ✅ Success Criteria

After all 4 phases:
- [ ] No duplicate albums/photos on creation
- [ ] Only `usePhotoData` calls Firebase functions
- [ ] Rapid clicking doesn't create duplicates
- [ ] Edit/delete gives instant UI feedback
- [ ] 90%+ reduction in Firestore reads
- [ ] No console errors

---

**Ready? Read Phase 1 and start! 🚀**
