# 🚀 Claude Code Quick Start

Copy and paste these exact prompts into Claude Code for each session.

---

## 📋 Before You Start

1. ✅ Install all files in `/docs` folder
2. ✅ Commit to GitHub
3. ✅ Open Claude Code
4. ✅ Connect to your repository

---

## Session 1: HomeDashboard Hero

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/01-home-hero.md

Implement directly. Test. Commit: "feat(home): animated hero and statistics"

Update:
- @docs/progress/completed.md
- @docs/progress/token-usage.md (log tokens used)
```

**Expected outcome:** Animated hero section with particles and stat counters

---

## Session 2: HomeDashboard Content

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/02-home-content.md

Implement directly. Test. Commit: "feat(home): masonry favorites and sections"

Update progress files.
```

**Expected outcome:** Masonry favorites, horizontal carousel, smart albums

---

## Session 3: AlbumPage Grid

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/03-album-grid.md

Implement directly. Test. Commit: "feat(album): advanced photo grid"

Update progress files.
```

**Expected outcome:** Multiple layout options, virtual scrolling, enhanced items

---

## Session 4: AlbumPage Features

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/04-album-features.md

Implement directly. Test. Commit: "feat(album): filters and bulk actions"

Update progress files.
```

**Expected outcome:** Advanced filters, bulk selection, smart actions

---

## Session 5: SearchPage

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/05-search.md

Implement directly. Test. Commit: "feat(search): intelligent search"

Update progress files.
```

**Expected outcome:** Smart search with AI filters and suggestions

---

## Session 6: MorePage Profile

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/06-more-profile.md

Implement directly. Test. Commit: "feat(more): enhanced profile and AI"

Update progress files.
```

**Expected outcome:** Animated profile, storage widget, AI showcase

---

## Session 7: MorePage Settings

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/07-more-settings.md

Implement directly. Test. Commit: "feat(more): settings reorganization"

Update progress files.
```

**Expected outcome:** Collapsible settings, search functionality

---

## Session 8: AlbumsPage

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/08-albums.md

Implement directly. Test. Commit: "feat(albums): enhanced album grid"

Update progress files.
```

**Expected outcome:** Masonry layout, hover effects, quick stats

---

## Session 9: AISettingsPage

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/09-ai-settings.md

Implement directly. Test. Commit: "feat(ai-settings): visual improvements"

Update progress files.
```

**Expected outcome:** API validation UI, cost calculator, charts

---

## Session 10: SecuritySettings

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/10-security.md

Implement directly. Test. Commit: "feat(security): enhanced security UI"

Update progress files.
```

**Expected outcome:** Polished animations, better flow

---

## Session 11: LoginPage

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/11-login.md

Implement directly. Test. Commit: "feat(login): modern login experience"

Update progress files.
```

**Expected outcome:** Particle background, smooth transitions

---

## Session 12: AdminDashboard

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Execute @docs/prompts/12-admin.md

Implement directly. Test. Commit: "feat(admin): enhanced admin panel"

Update progress files.
```

**Expected outcome:** Real-time stats, charts, improved UI

---

## 🎯 After All Sessions

Run final verification:

```
Check all pages:
1. Run app in development mode
2. Test on desktop (Chrome, Firefox)
3. Test on mobile (Safari, Chrome)
4. Test on tablet (iPad)
5. Verify all animations 60fps
6. Check for console errors
7. Test i18n (NO/EN switching)
8. Verify responsive breakpoints

Report any issues found.
```

---

## 💡 Pro Tips

### If Claude asks for approval

Respond: "No approval needed. Just implement it."

### If you hit token limit mid-session

Stop, commit current work, start new chat with:

```
Continue from where we left off in [session name].
Reference @docs/progress/completed.md for context.
```

### If something breaks

```
Debug session: [describe issue]

Reference:
- @docs/progress/issues.md
- @src/pages/[PageName].jsx

Fix the issue. Test. Commit fix.
```

---

## 📊 Token Tracking Template

After each session, paste this into progress/token-usage.md:

```markdown
### Session [N]: [Name]

- Date: 2025-01-[DD]
- Tokens: ~[amount]
- Status: ✅ Complete
- Issues: [None / List any]
- Next: Session [N+1]
```

---

## ✅ Quality Checklist Template

After each session, verify:

```
✅ Visual Quality
- [ ] Animations smooth (60fps)
- [ ] Design consistent
- [ ] Colors from design-system.md
- [ ] Spacing correct

✅ Functionality
- [ ] All features work
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] i18n strings present

✅ Responsive
- [ ] Mobile works (320px+)
- [ ] Tablet works (768px+)
- [ ] Desktop works (1024px+)
- [ ] Touch interactions work

✅ Performance
- [ ] Fast interactions (<100ms)
- [ ] Smooth scrolling
- [ ] No layout shift
- [ ] Images lazy load

✅ Code Quality
- [ ] Components clean
- [ ] Proper React patterns
- [ ] No unnecessary re-renders
- [ ] Good commit message
```

---

## 🆘 Emergency Commands

### Revert Last Commit

```bash
git revert HEAD
git push
```

### Check Token Usage Mid-Session

Ask Claude: "How many tokens have we used so far?"

### Save Progress and Continue Later

```
Save current state.
Commit what's done so far with message: "wip: [description]"
Update progress files with current status.
```

---

## 🎉 Completion Message

When all 12 sessions are done, celebrate!

```
All 12 sessions complete! 🎊

Summary:
- Total tokens used: [amount]
- Total commits: [count]
- Issues resolved: [count]
- Time taken: [days]

PhotoVault is now a premium, modern photo app!
```

---

END OF CLAUDE_CODE_STARTER.md
