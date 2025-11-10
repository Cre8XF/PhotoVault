# ⚡ Quick Start - PhotoVault Refactor

## Download and Install Documentation (2 min)

```bash
cd ~/PhotoVault

# Create folders
mkdir -p docs/phases docs/audit

# Download files from Claude chat (assume they're in Downloads)
cd ~/Downloads/outputs/en

# Copy all files
cp REFACTOR_PLAN.md ~/PhotoVault/docs/
cp CLAUDE_CODE_INSTRUCTIONS.md ~/PhotoVault/docs/
cp README.md ~/PhotoVault/docs/
cp QUICK_START.md ~/PhotoVault/docs/
cp phases/PHASE_*.md ~/PhotoVault/docs/phases/

# Go back to project
cd ~/PhotoVault

# Commit documentation
git add docs/
git commit -m "docs: add refactor plan and phase documentation"
git push
```

---

## Start Claude Code (1 min)

```bash
cd ~/PhotoVault
claude-code
```

**Paste this message:**

```
Read docs/CLAUDE_CODE_INSTRUCTIONS.md and docs/REFACTOR_PLAN.md.

Start with Phase 1:
1. Read docs/phases/PHASE_1_dead_code.md
2. Perform all changes
3. Commit with: "chore: remove dead code (deletePhoto.js, unused functions, redundant rules)"
4. PAUSE and notify when done

Remember: Pause after each phase and wait for my approval.
```

---

## Between Each Phase

Claude Code says: **"✅ Phase X complete. Test and let me know."**

**You do:**

```bash
npm start
# Open browser → check everything works
# Console OK? Firestore OK?
```

**If OK, say:**
```
Phase X looks good! Continue to Phase Y.
```

---

## After All 4 Phases

```bash
npm start
```

**Test complete flow:**
- [ ] Create album → Check Firestore → only 1 doc
- [ ] Edit album → Instant feedback
- [ ] Click "Create" 5 times rapidly → only 1 doc
- [ ] Upload photo → No full refresh
- [ ] Delete album → Optimistic update

**Done! 🎉**

---

## If You Need to Stop Mid-Process

```bash
# Check which phase you're on
git log --oneline | head -5

# See last commit message
# "fix: add reentrancy guards..." → You're on Phase 3

# Continue later by telling Claude Code:
"We're done with Phase 3. Continue with Phase 4."
```

---

## Rollback If Something Goes Wrong

```bash
git log --oneline
git revert <commit-hash>
```

---

## What Gets Fixed

| Issue | Before | After |
|-------|--------|-------|
| Duplicate albums | 2+ docs created | 1 doc created |
| Slow edits | 1100 Firestore reads | 1 write only |
| Rapid clicks | Multiple writes | Single write |
| UI feedback | Delayed | Instant |

---

## Time Required

- **Phase 1:** 30 minutes
- **Phase 2:** 3-4 hours (most critical)
- **Phase 3:** 1-2 hours
- **Phase 4:** 2-3 hours

**Total:** 7-10 hours (can be spread over multiple days)

---

**Start now! ⚡**
