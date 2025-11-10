# PhotoVault Refactor Plan

## 📋 Overview

This plan addresses architectural issues identified in the system audit:
- Duplicate Firestore writes
- Direct Firebase calls from components
- Missing reentrancy guards
- Inefficient refreshData()

## 🎯 Goals

✅ Eliminate duplicate album/photo creation  
✅ Centralize all Firestore logic in `usePhotoData`  
✅ Protect against StrictMode double-render  
✅ Reduce Firestore reads by 90%  

## 📊 Phases

| Phase | Description | Estimate | Priority |
|-------|-------------|----------|----------|
| 1 | Remove dead code | 30 min | P1 |
| 2 | Centralize Firestore | 3-4 hours | P1 |
| 3 | Add guards | 1-2 hours | P2 |
| 4 | Optimize refresh | 2-3 hours | P1 |

**Total estimate:** 7-10 hours

## ⚙️ Execution Instructions for Claude Code

```bash
# 1. Read master plan
cat docs/REFACTOR_PLAN.md

# 2. Execute phase 1
cat docs/phases/PHASE_1_dead_code.md
# [Perform changes]
# [PAUSE - Wait for user approval]

# 3. Execute phase 2
cat docs/phases/PHASE_2_centralize.md
# [Perform changes]
# [PAUSE - Wait for user approval]

# 4. Execute phase 3
cat docs/phases/PHASE_3_guards.md
# [Perform changes]
# [PAUSE - Wait for user approval]

# 5. Execute phase 4
cat docs/phases/PHASE_4_optimize.md
# [Perform changes]
# [PAUSE - Wait for user approval]
```

## 🧪 Testing Between Phases

After each phase, run:

```bash
npm start
```

Check:
- [ ] No console errors
- [ ] App starts without issues
- [ ] Relevant features work (see phase-specific checklist)

## 📝 Commit Messages

- **Phase 1:** `chore: remove dead code (deletePhoto.js, unused functions, redundant rules)`
- **Phase 2:** `refactor: centralize all Firestore operations in usePhotoData hook`
- **Phase 3:** `fix: add reentrancy guards to prevent duplicate writes`
- **Phase 4:** `perf: replace full refresh with optimistic updates`

## 🚨 Rollback Plan

If something goes wrong:

```bash
git log --oneline  # Find commit hash
git revert <hash>  # Revert last commit
```

## 📞 Support

For issues, refer to:
- `docs/audit/AUDIT_RESULTS.md` - Original audit
- Specific phase file under `docs/phases/`
- User can start new chat with Claude and share relevant phase file

---

**Status:** 🔴 Not started  
**Last updated:** 2025-11-08
