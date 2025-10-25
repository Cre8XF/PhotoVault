## FILE: README.md (for /docs folder)

# PhotoVault Modernization Documentation

This folder contains all documentation for the PhotoVault modernization project.

## 📁 Structure

```
/docs
├── MODERNIZATION_PLAN.md      # Master plan and token strategy
├── design-system.md            # Design tokens and components
├── /prompts                    # Individual prompt files
│   ├── 01-home-hero.md
│   ├── 02-home-content.md
│   ├── 03-album-grid.md
│   ├── 04-album-features.md
│   ├── 05-search.md
│   ├── 06-more-profile.md
│   ├── 07-more-settings.md
│   ├── 08-albums.md
│   ├── 09-ai-settings.md
│   ├── 10-security.md
│   ├── 11-login.md
│   └── 12-admin.md
└── /progress                   # Progress tracking
    ├── completed.md
    ├── token-usage.md
    └── issues.md
```

## 🚀 How to Use

### Starting a New Session

1. **Open Claude Code** and connect to GitHub
2. **Start with this prompt:**

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Then execute @docs/prompts/[XX-name].md

Implement all changes directly.
Test thoroughly.
Commit when done.
Update progress files.
```

3. **Claude will:**
   - Read the context
   - Implement changes
   - Test the implementation
   - Commit to Git
   - Update progress tracking

### After Each Session

Update these files:

- `progress/completed.md` - Mark task as done
- `progress/token-usage.md` - Log tokens used
- `progress/issues.md` - Document any problems

### Token Management

- Each session should stay under 40K tokens
- If approaching limit, start new chat
- Reference previous work with @file mentions
- Use design-system.md instead of repeating styles

## 📊 Estimated Timeline

- **Week 1:** Core experience (5 sessions × 35K = 175K tokens)
- **Week 2:** Enhancement (3 sessions × 25K = 75K tokens)
- **Week 3:** Polish (4 sessions × 20K = 80K tokens)
- **Total:** ~330K tokens across 12 sessions

## ✅ Success Criteria

Each page must have:

- ✅ Smooth 60fps animations
- ✅ Mobile responsive
- ✅ No console errors
- ✅ i18n working (NO/EN)
- ✅ Performance: <100ms interactions
- ✅ Auto-committed to Git

## 🆘 If Something Goes Wrong

1. **Check issues.md** for similar problems
2. **Start new Claude Code chat** if stuck
3. **Reference previous work** with @file
4. **Document the issue** for future reference

## 📝 Notes

- Always test on mobile after implementation
- Screenshot before/after for documentation
- Commit frequently with clear messages
- Don't skip the testing checklist

---

END OF README.md
