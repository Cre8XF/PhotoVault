# PhotoVault Modernization Plan

## 🎯 Mål

Transformere PhotoVault til en premium, AI-drevet fotoapp som konkurrerer med Google Photos og Synology Photos.

## 📊 Token Budget Strategy

### Per Prompt Estimat:

- **Tier 1 (kompleks):** ~25-35K tokens per session
- **Tier 2 (medium):** ~15-25K tokens per session
- **Tier 3 (enkel):** ~10-15K tokens per session

### Samtale-struktur:

1. **Oppstart:** Les plan + design system (~3K tokens)
2. **Implementering:** Direkte utførelse (~30K tokens)
3. **Verifisering:** Selvtest (~3K tokens)
4. **Total per session:** ~36K tokens

### Token-saving strategier:

- ✅ Én session per sub-task (ny chat for hver)
- ✅ Referer til @docs/design-system.md
- ✅ Bruk @file mentions i stedet for å paste kode
- ✅ INGEN godkjennings-steg - bare implementer direkte
- ✅ Selvtest og commit automatisk

---

## 🗓️ Execution Plan

### WEEK 1: Core Experience (Tier 1)

#### Day 1: HomeDashboard - Hero & Stats

**File:** `@docs/prompts/01-home-hero.md` **Tokens:** ~35K **Output:** Hero section + animated statistics

#### Day 2: HomeDashboard - Favorites & Albums

**File:** `@docs/prompts/02-home-content.md` **Tokens:** ~35K **Output:** Masonry favoritter + smart albums

#### Day 3: AlbumPage - Grid & Toolbar

**File:** `@docs/prompts/03-album-grid.md` **Tokens:** ~35K **Output:** Advanced photo grid + toolbar

#### Day 4: AlbumPage - Filters & Actions

**File:** `@docs/prompts/04-album-features.md` **Tokens:** ~35K **Output:** Smart filters + bulk actions

#### Day 5: SearchPage - Complete

**File:** `@docs/prompts/05-search.md` **Tokens:** ~35K **Output:** Intelligent search interface

**Week 1 Total: ~175K tokens**

---

### WEEK 2: Enhancement (Tier 2)

#### Day 6: MorePage - Profile & AI

**File:** `@docs/prompts/06-more-profile.md` **Tokens:** ~30K

#### Day 7: MorePage - Settings

**File:** `@docs/prompts/07-more-settings.md` **Tokens:** ~25K

#### Day 8: AlbumsPage - Complete

**File:** `@docs/prompts/08-albums.md` **Tokens:** ~25K

**Week 2 Total: ~80K tokens**

---

### WEEK 3: Polish (Tier 3)

#### Day 9: AISettingsPage

**File:** `@docs/prompts/09-ai-settings.md` **Tokens:** ~20K

#### Day 10: SecuritySettings

**File:** `@docs/prompts/10-security.md` **Tokens:** ~20K

#### Day 11: LoginPage

**File:** `@docs/prompts/11-login.md` **Tokens:** ~15K

#### Day 12: AdminDashboard

**File:** `@docs/prompts/12-admin.md` **Tokens:** ~20K

**Week 3 Total: ~75K tokens**

---

## 📝 Standard Prompt Structure

Every prompt follows this pattern:

```markdown
# [Page Name] - [Feature]

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat: [description]"

## FILES TO MODIFY

- @src/pages/[Page].jsx
- @src/components/[NewComponent].jsx (if needed)

## IMPLEMENTATION STEPS

[Detailed steps...]

## TESTING CHECKLIST

- [ ] Mobile responsive
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] i18n works (NO/EN)

## COMPLETION

After successful testing, commit changes. Update @docs/progress/completed.md Log tokens in @docs/progress/token-usage.md
```

---

## 🎯 Success Criteria

Each implementation must have:

- ✅ All features working
- ✅ Responsive (mobile/tablet/desktop)
- ✅ Smooth animations (<300ms)
- ✅ i18n intact
- ✅ No console errors
- ✅ Performance: <100ms interaction
- ✅ Auto-committed to Git

---

## 📊 Progress Tracking

Files updated automatically:

- `@docs/progress/completed.md` - Completed features
- `@docs/progress/token-usage.md` - Token consumption
- `@docs/progress/issues.md` - Any problems encountered

---

## 🔄 Claude Code Session Template

```
Read @docs/MODERNIZATION_PLAN.md and @docs/design-system.md

Then execute @docs/prompts/[XX-name].md

Implement all changes directly.
Test thoroughly.
Commit when done.
Update progress files.
```

---

## 📱 Universal Testing Requirements

Every page must pass:

- Desktop Chrome ✅
- Mobile Safari ✅
- Tablet iPad ✅
- Dark mode ✅
- Animations 60fps ✅
- No layout shift ✅
- i18n works (NO/EN) ✅

---

END OF MODERNIZATION_PLAN.md
