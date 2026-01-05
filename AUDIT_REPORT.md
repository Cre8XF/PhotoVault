# PhotoVault (Pixtr) Codebase Audit Report
**Date:** 2026-01-05
**Auditor:** Senior Frontend Auditor
**Scope:** Hardcoded colors, i18n issues, critical UI areas
**Status:** READ-ONLY AUDIT (No modifications made)

---

## PART 1: Hardcoded Colors Audit

### A. React Component Files (.jsx)

| File Path | Line | Value | Context | Suggested Token |
|-----------|------|-------|---------|-----------------|
| `/src/pages/ai/AIToolsPage.jsx` | 97 | `linear-gradient(to bottom right, #f8fafc, #ede9fe, #f8fafc)` | AI tools hero background | `--gradient-hero` |
| `/src/features/collage/components/PhotoPickerPanel.jsx` | 133 | `#8b5cf6` | Active filter button background | `--color-primary-500` |
| `/src/features/collage/components/PhotoPickerPanel.jsx` | 134 | `#ffffff` | Active filter button text | `--color-white` |
| `/src/features/collage/components/PhotoPickerPanel.jsx` | 150 | `#8b5cf6` | Favorites filter button background | `--color-primary-500` |
| `/src/features/collage/components/PhotoPickerPanel.jsx` | 151 | `#ffffff` | Favorites filter button text | `--color-white` |
| `/src/features/collage/components/CollagePreview.jsx` | 72 | `#000` | Collage preview background | `--bg-black` |
| `/src/components/SharePixtrModal.jsx` | 64 | `#6B21A8` | QR code dark color (purple-800) | `--color-purple-800` |
| `/src/components/SharePixtrModal.jsx` | 65 | `#FFFFFF` | QR code light color | `--color-white` |
| `/src/features/collage/components/TextToolPanel.jsx` | 17 | `#FFFFFF` | Default text color | `--color-white` |
| `/src/features/collage/components/TextToolPanel.jsx` | 38 | `#FFFFFF` | Text layer color | `--color-white` |
| `/src/pages/PhotoPage.jsx` | 974 | `#ef4444` | Favorite icon color (red) | `--color-error` |
| `/src/pages/PhotoPage.jsx` | 1017 | `#60a5fa` | Info button active color (blue) | `--color-info` |
| `/src/components/UpgradeModal.jsx` | 168 | `from-[#1a1a2e] to-[#16213e]` | Modal gradient background | `--gradient-modal-dark` |
| `/src/components/CollageCard.jsx` | 114 | `#000` | Collage card background | `--bg-black` |
| `/src/features/editor/components/CropPanel.jsx` | 108 | `#0a0a0a` | Panel background | `--bg-editor-dark` |
| `/src/features/editor/components/CropPanel.jsx` | 147 | `#2a2a2a` / `#3a3a3a` | Button backgrounds (hover) | `--bg-button-dark` / `--bg-button-dark-hover` |
| `/src/features/editor/components/AdjustPanel.jsx` | 45 | `#0a0a0a` | Panel background | `--bg-editor-dark` |
| `/src/features/editor/components/RotatePanel.jsx` | 64 | `#0a0a0a` | Panel background | `--bg-editor-dark` |
| `/src/features/editor/components/RotatePanel.jsx` | 84, 91 | `#2a2a2a` / `#3a3a3a` | Button backgrounds (hover) | `--bg-button-dark` / `--bg-button-dark-hover` |
| `/src/features/editor/components/RotatePanel.jsx` | 128 | `#2a2a2a` | Slider background | `--bg-slider-dark` |
| `/src/features/editor/components/RotatePanel.jsx` | 181 | `#1a1a1a` | Info box background | `--bg-info-dark` |
| `/src/features/editor/pages/EditorPage.jsx` | 288, 305, 339 | `#0a0a0a` | Editor page background | `--bg-editor-dark` |
| `/src/features/editor/pages/EditorPage.jsx` | 314 | `#1a1a1a` | Error box background | `--bg-info-dark` |
| `/src/features/editor/components/FiltersPanel.jsx` | 47 | `#0a0a0a` | Panel background | `--bg-editor-dark` |
| `/src/features/editor/components/FiltersPanel.jsx` | 83 | `#2a2a2a` / `#3a3a3a` | Button backgrounds (hover) | `--bg-button-dark` / `--bg-button-dark-hover` |
| `/src/features/editor/components/FiltersPanel.jsx` | 115 | `#2a2a2a` | Slider background | `--bg-slider-dark` |
| `/src/features/editor/components/FiltersPanel.jsx` | 140 | `#1a1a1a` | Info box background | `--bg-info-dark` |
| `/src/features/editor/components/Slider.jsx` | 41 | `#2a2a2a` | Slider background | `--bg-slider-dark` |
| `/src/components/Particles.jsx` | 42-43 | `rgba(167, 139, 250, ${opacity})` / `rgba(139, 92, 246, ${opacity})` | Particle gradient colors | `--color-purple-300` / `--color-primary-500` |
| `/src/features/collage/components/RepositionModal.jsx` | 341 | Complex gradient with `rgb(59 130 246)` and `rgba(255,255,255,0.1)` | Zoom slider gradient | `--gradient-slider` |

### B. CSS Files

| File Path | Line | Value | Context | Suggested Token |
|-----------|------|-------|---------|-----------------|
| `/src/index.css` | 10-40 | Multiple hex colors | CSS variable definitions (GOOD PRACTICE) | Already using variables ✅ |
| `/src/index.css` | 247 | `#a78bfa` | Border color | Should use `var(--color-purple-300)` |
| `/src/index.css` | 387, 392, 408, 499 | Multiple hex colors | Light mode text/background | Should use CSS variables |
| `/src/index.css` | 749, 755, 760 | `linear-gradient(180deg, #8b5cf6, #a78bfa)` | Button gradients | `--gradient-primary` |
| `/src/index.css` | 926, 930, 934 | Multiple gradients with hex | Avatar/badge gradients | `--gradient-avatar-*` |
| `/src/components/AlbumModal.css` | 47, 87, 110, 154 | `#a78bfa`, `#ef4444` | Purple and red colors | `--color-purple-300`, `--color-error` |
| `/src/styles-enhanced.css` | Multiple | Many hardcoded purple/yellow colors | Animations, shadows, gradients | Should use CSS variables |
| `/src/features/editor/styles/editor.css` | 14-142 | `#0a0a0a`, `#1a1a1a`, `#2a2a2a`, `#3a3a3a` | Editor dark theme colors | `--bg-editor-*` tokens |
| `/src/styles/home.css` | 8-27 | `#f3f4f6`, `#c4b5fd`, `#a78bfa`, etc. | Home page custom colors | Should use global CSS variables |
| `/src/styles/album.css` | 8-22 | Multiple hex colors | Album page custom colors | Should use global CSS variables |
| `/src/styles/timeGroups.css` | Multiple | Many purple/blue gradients | Time group styling | Should use CSS variables |
| `/src/styles/memories.css` | Multiple | Purple/gold gradients with rgba | Memories widget styling | Should use CSS variables |
| `/src/styles/collageTeaser.css` | Multiple | Purple/pink gradients | Collage teaser styling | Should use CSS variables |

### C. Inline Styles with Color/Opacity

| File Path | Line | Property | Context | Suggested Fix |
|-----------|------|----------|---------|---------------|
| `/src/pages/PhotoPage.jsx` | 974 | `color: photo.favorite ? '#ef4444' : 'var(--text-primary)'` | Favorite icon conditional color | Use `--color-error` token |
| `/src/pages/PhotoPage.jsx` | 1017 | `color: showInfo ? '#60a5fa' : 'var(--text-primary)'` | Info button conditional color | Use `--color-info` token |
| `/src/components/SmartViews.jsx` | 182 | `opacity: view.count === 0 ? 0.5 : 1` | Disabled state opacity | Use `--opacity-disabled` token |
| `/src/pages/HomeDashboard.jsx` | 247 | `opacity: Math.min(pullDistance / 80, 1)` | Pull-to-refresh opacity | Keep dynamic (OK) |
| `/src/components/PhotoGridUnified.jsx` | 30 | `opacity: isDragging ? 0.5 : 1` | Drag state opacity | Use `--opacity-dragging` token |

---

## PART 2: i18n Issues

### A. Hardcoded Norwegian Strings

| File Path | Line | Text | Language | Suggested i18n Key |
|-----------|------|------|----------|-------------------|
| `/src/pages/SubscriptionPage.jsx` | 69 | `"Ja"` | NO | `subscription:features.yes` |
| `/src/pages/SubscriptionPage.jsx` | 70 | `"Ja"` | NO | `subscription:features.yes` |
| `/src/pages/SubscriptionPage.jsx` | 78 | `"Ja"` | NO | `subscription:features.yes` |
| `/src/pages/SubscriptionPage.jsx` | 79 | `"Nei"` | NO | `subscription:features.no` |
| `/src/pages/SubscriptionPage.jsx` | 88 | `"Nei (original)"` | NO | `subscription:features.noOriginal` |
| `/src/pages/SubscriptionPage.jsx` | 89 | `"Nei"` | NO | `subscription:features.no` |
| `/src/pages/SubscriptionPage.jsx` | 104 | `"for alltid"` | NO | `subscription:periods.forever` |
| `/src/pages/SubscriptionPage.jsx` | 106 | `"Original kvalitet"` | NO | `subscription:features.originalQuality` |
| `/src/pages/SubscriptionPage.jsx` | 109 | `"1 GB lagring"` | NO | `subscription:features.storage_1gb` |
| `/src/pages/SubscriptionPage.jsx` | 110 | `"Original bildekvalitet"` | NO | `subscription:features.originalImageQuality` |
| `/src/pages/SubscriptionPage.jsx` | 111 | `"Album-organisering"` | NO | `subscription:features.albumOrganization` |
| `/src/pages/SubscriptionPage.jsx` | 112 | `"QR-kode deling"` | NO | `subscription:features.qrSharing` |
| `/src/pages/SubscriptionPage.jsx` | 113 | `"Collage Builder"` | EN (OK) | Keep or use `subscription:features.collageBuilder` |
| `/src/pages/SubscriptionPage.jsx` | 114 | `"Timeline"` | EN (OK) | Keep or use `subscription:features.timeline` |
| `/src/pages/SubscriptionPage.jsx` | 115 | `"Søk i bilder"` | NO | `subscription:features.imageSearch` |
| `/src/pages/SubscriptionPage.jsx` | 124 | `"per måned"` | NO | `subscription:periods.perMonth` |
| `/src/pages/SubscriptionPage.jsx` | 129 | `"Alt i GRATIS"` | NO | `subscription:features.allInFree` |
| `/src/pages/SubscriptionPage.jsx` | 130 | `"10 GB lagring"` | NO | `subscription:features.storage_10gb` |
| `/src/pages/SubscriptionPage.jsx` | 131 | `"Bildekomprimering"` | NO | `subscription:features.imageCompression` |
| `/src/pages/SubscriptionPage.jsx` | 132 | `"Prioritert support"` | NO | `subscription:features.prioritySupport` |
| `/src/pages/SubscriptionPage.jsx` | 266 | `"Kritisk lav lagring!"` | NO | `subscription:alerts.criticalLowStorage` |
| `/src/pages/SubscriptionPage.jsx` | 270 | `"Du har kun {amount} igjen..."` | NO | `subscription:alerts.lowStorageMessage` |
| `/src/pages/SubscriptionPage.jsx` | 282 | `"Oppgrader abonnement"` | NO | `subscription:actions.upgradeSubscription` |
| `/src/pages/SubscriptionPage.jsx` | 293 | `"Lav lagring"` | NO | `subscription:alerts.lowStorage` |
| `/src/pages/SubscriptionPage.jsx` | 297 | `"Du har brukt {percent}%..."` | NO | `subscription:alerts.storageUsageMessage` |
| `/src/pages/SubscriptionPage.jsx` | 369 | `"Oppgrader til {plan}"` | NO | `subscription:actions.upgradeToPlan` |
| `/src/pages/SubscriptionPage.jsx` | 381-390 | Multiple feature descriptions | NO | Move to translation file |
| `/src/pages/AlbumPage.jsx` | 2 | `"OPPDATERT: Fjernet dobbeltbekreftelse"` | NO | Comment (can stay) |
| `/src/pages/AlbumPage.jsx` | 533 | `"Tilbake til album"` | NO | `albums:actions.backToAlbum` |
| `/src/pages/AlbumsPage.jsx` | 134 | Fallback `'Slettet'` | NO | Already has translation (good) ✅ |
| `/src/pages/BillingCancelPage.jsx` | 28 | `"Tilbake til Abonnementer"` | NO | `billing:actions.backToSubscriptions` |
| `/src/pages/HomeDashboard.jsx` | 301 | `"Fjern filter ({count})"` | NO | `home:actions.removeFilter` |

### B. Hardcoded English Strings (Should be in i18n)

| File Path | Line | Text | Context | Suggested i18n Key |
|-----------|------|------|----------|-------------------|
| `/src/components/UpgradeModal.jsx` | 16 | `"You've hit the album limit!"` | Modal title | `upgrade:albumLimit.title` |
| `/src/components/UpgradeModal.jsx` | 17 | `"But you're clearly loving Pixtr 🎉"` | Modal subtitle | `upgrade:albumLimit.subtitle` |
| `/src/components/UpgradeModal.jsx` | 18 | `"GRATIS = 5 albums max"` | Pain point | `upgrade:albumLimit.painPoint` |
| `/src/components/UpgradeModal.jsx` | 19 | `"LITE = Unlimited albums"` | Solution | `upgrade:albumLimit.solution` |
| `/src/components/UpgradeModal.jsx` | 32 | `"Album full!"` | Modal title | `upgrade:photoLimit.title` |
| `/src/components/UpgradeModal.jsx` | 47 | `"Love this edit?"` | Modal title | `upgrade:editorSave.title` |
| `/src/components/UpgradeModal.jsx` | 64 | `"Beautiful collage!"` | Modal title | `upgrade:collageSave.title` |
| `/src/features/editor/components/RotatePanel.jsx` | 67 | `"Rotate & Flip"` | Panel header | `editor:tools.rotateFlip` |
| `/src/features/editor/components/RotatePanel.jsx` | 73 | `"Reset"` | Button text | `common:reset` |
| `/src/features/editor/components/RotatePanel.jsx` | 80 | `"Quick Rotate"` | Section label | `editor:labels.quickRotate` |
| `/src/pages/ToolsPage.jsx` | 85 | `"Your tools"` | Page title | `tools:title` |

### C. Comments in Norwegian (Non-critical, but noted)

| File Path | Line | Comment | Note |
|-----------|------|---------|------|
| `/src/features/qr-sharing/components/QRShareModal.jsx` | 57 | `// Lagre til Firestore` | Code comment |
| `/src/features/timeline/components/TimelineView.jsx` | 26, 34 | Date format comments | Code comments |
| `/src/pages/AlbumPage.jsx` | 2-8 | `// OPPDATERT: Fjernet...` | Header comments |
| `/src/pages/SearchPage.jsx` | 135, 140, 719 | Various Norwegian comments | Code comments |
| `/src/components/TagInput.jsx` | 20 | `// DEFENSIVE:...` | Code comment |

---

## PART 3: Critical UI Areas

### High-Risk UI Areas Requiring Immediate Attention

#### 1. **Security / PIN / Biometric Screens** 🔴 CRITICAL
- **File:** `/src/components/PINLockScreen.jsx`
- **Status:** ✅ Mostly good (uses i18n)
- **Issues:**
  - Hardcoded gradient colors in Tailwind classes (lines 126, 161)
  - Could benefit from `--gradient-security` token
- **Priority:** MEDIUM (functional, but not themeable)

#### 2. **Modals (Confirm Delete, Warnings)** 🔴 CRITICAL
- **File:** `/src/components/ConfirmModal.jsx`
- **Status:** ✅ EXCELLENT (fully i18n, uses CSS variables)
- **Issues:** None found
- **Priority:** LOW

#### 3. **Upload & Storage Info Screens** 🟡 HIGH
- **File:** `/src/components/UploadModal.jsx`
- **Status:** ⚠️ Partially i18n
- **Issues:**
  - Some hardcoded strings (need to review full file)
  - Uses CSS variables (good)
- **Priority:** MEDIUM

- **File:** `/src/components/StorageIndicator.jsx`
- **Status:** ✅ Good (uses i18n)
- **Issues:** None found
- **Priority:** LOW

#### 4. **Subscription/Billing Pages** 🔴 CRITICAL
- **File:** `/src/pages/SubscriptionPage.jsx`
- **Status:** 🔴 MAJOR ISSUES
- **Issues:**
  - 30+ hardcoded Norwegian strings
  - Feature descriptions not in translation files
  - Hardcoded "Ja"/"Nei" values
- **Priority:** 🔴 HIGH - User-facing, financial impact

#### 5. **Error / Warning Messages** 🟡 HIGH
- **File:** `/src/components/VerificationBanner.jsx`
- **Status:** ✅ Good (uses i18n)
- **Issues:** None found
- **Priority:** LOW

#### 6. **Editor / Photo Tools** 🟡 HIGH
- **Files:**
  - `/src/features/editor/components/CropPanel.jsx`
  - `/src/features/editor/components/AdjustPanel.jsx`
  - `/src/features/editor/components/RotatePanel.jsx`
  - `/src/features/editor/components/FiltersPanel.jsx`
- **Status:** 🔴 CRITICAL COLOR ISSUES
- **Issues:**
  - Heavy use of hardcoded dark theme colors (`#0a0a0a`, `#1a1a1a`, `#2a2a2a`, `#3a3a3a`)
  - Editor panels won't respect light mode
  - Some hardcoded English strings ("Rotate & Flip", "Reset", "Quick Rotate")
- **Priority:** 🔴 HIGH - UX impact (light mode broken)

#### 7. **Collage Builder** 🟡 HIGH
- **Files:**
  - `/src/features/collage/components/PhotoPickerPanel.jsx`
  - `/src/features/collage/components/TextToolPanel.jsx`
  - `/src/features/collage/components/CollagePreview.jsx`
- **Status:** ⚠️ Multiple issues
- **Issues:**
  - Hardcoded purple colors (`#8b5cf6`, `#ffffff`)
  - Hardcoded white text color (`#FFFFFF`)
  - Black backgrounds (`#000`)
  - Some i18n, but incomplete
- **Priority:** MEDIUM

#### 8. **Disabled Buttons & Toggles** 🟡 MEDIUM
- **Status:** ⚠️ Inconsistent
- **Issues:**
  - Opacity hardcoded in inline styles (0.5)
  - Should use `--opacity-disabled` token
- **Priority:** MEDIUM

---

## PART 4: Summary & Recommended Fix Order

### Statistics

- **Total hardcoded colors found:** 150+
  - JSX files: ~40 instances
  - CSS files: ~110 instances
  - Inline styles: ~10 instances

- **Total i18n issues found:** 50+
  - Hardcoded Norwegian strings: 35+
  - Hardcoded English strings: 15+
  - Missing translations: Multiple

### Severity Breakdown

| Severity | Count | Impact |
|----------|-------|--------|
| 🔴 Critical | 3 areas | Blocks light mode, Norwegian text in production |
| 🟡 High | 4 areas | UX degradation, partial functionality |
| 🟢 Medium | 5 areas | Minor issues, cosmetic |

### Recommended Fix Order (Priority 1-5)

#### Priority 1: CRITICAL 🔴 (Fix Immediately)
1. **Subscription Page Norwegian Strings** (SubscriptionPage.jsx)
   - Impact: User-facing, financial, language barrier
   - Effort: 2-3 hours
   - Fix: Move all strings to `/src/locales/*/subscription.json`

2. **Editor Dark Theme Hardcoded Colors** (editor/*.jsx, editor/styles/editor.css)
   - Impact: Light mode completely broken in editor
   - Effort: 4-6 hours
   - Fix: Create `--bg-editor-*` CSS variables, update all panels

#### Priority 2: HIGH 🟡 (Fix This Sprint)
3. **Photo Picker / Collage Builder Colors** (collage/components/*.jsx)
   - Impact: Theming inconsistency
   - Effort: 2-3 hours
   - Fix: Replace `#8b5cf6`, `#ffffff`, `#000` with CSS variables

4. **AlbumPage & HomeDashboard Norwegian Strings**
   - Impact: Language consistency
   - Effort: 1-2 hours
   - Fix: Move to i18n files

#### Priority 3: MEDIUM 🟢 (Fix Next Sprint)
5. **Upgrade Modal English Strings** (UpgradeModal.jsx)
   - Impact: i18n completeness
   - Effort: 1 hour
   - Fix: Move all strings to `upgrade.json`

6. **Disabled State Opacity** (SmartViews.jsx, PhotoGridUnified.jsx)
   - Impact: Theming consistency
   - Effort: 30 minutes
   - Fix: Add `--opacity-disabled: 0.5` variable

7. **Photo Page Color Conditionals** (PhotoPage.jsx lines 974, 1017)
   - Impact: Theming
   - Effort: 15 minutes
   - Fix: Use `--color-error` and `--color-info` tokens

#### Priority 4: LOW 🟢 (Tech Debt)
8. **CSS Files Using Hardcoded Colors** (styles/*.css, styles-enhanced.css)
   - Impact: Maintainability
   - Effort: 3-4 hours
   - Fix: Replace hex with CSS variables where not already using variables

9. **Gradient Definitions** (Various files)
   - Impact: Theming flexibility
   - Effort: 2 hours
   - Fix: Define gradient CSS variables (`--gradient-primary`, etc.)

#### Priority 5: OPTIONAL (Nice to Have)
10. **Norwegian Comments in Code**
    - Impact: Developer experience only
    - Effort: 1 hour
    - Fix: Translate to English for international contributors

---

## Detailed Recommendations

### For Hardcoded Colors:
1. **Create missing CSS variables:**
   ```css
   /* Editor tokens */
   --bg-editor-dark: #0a0a0a;
   --bg-editor-surface: #1a1a1a;
   --bg-editor-elevated: #2a2a2a;
   --bg-editor-hover: #3a3a3a;

   /* State tokens */
   --opacity-disabled: 0.5;
   --opacity-dragging: 0.5;

   /* Gradient tokens */
   --gradient-primary: linear-gradient(180deg, #8b5cf6, #a78bfa);
   --gradient-modal-dark: linear-gradient(135deg, #1a1a2e, #16213e);
   ```

2. **Replace inline styles** with CSS classes using variables
3. **Update editor components** to respect light/dark mode

### For i18n Issues:
1. **Create missing translation files:**
   - `/src/locales/en/subscription.json`
   - `/src/locales/no/subscription.json`
   - `/src/locales/en/upgrade.json`
   - `/src/locales/no/upgrade.json`

2. **Move hardcoded Norwegian strings** to translation files
3. **Add fallback values** in `t()` calls for safety
4. **Test language switching** thoroughly

### For Critical UI:
1. **Editor:** Immediate fix for light mode support
2. **Subscription:** Immediate fix for Norwegian strings
3. **Collage Builder:** Medium priority for theming
4. **All modals:** Verify i18n completeness

---

## Conclusion

The codebase has **good i18n infrastructure** in place (using react-i18next), but **inconsistent application**. The main issues are:

1. **SubscriptionPage has 35+ Norwegian strings** hardcoded (🔴 CRITICAL)
2. **Editor components bypass theming** with hardcoded dark colors (🔴 CRITICAL)
3. **Collage/Photo tools use hardcoded purple/white colors** (🟡 HIGH)
4. **CSS files have good variable usage** in index.css but inconsistent in component-specific CSS

**Estimated Total Fix Time:** 15-20 hours for Priority 1-3 items

**Next Steps:**
1. Review and approve this audit
2. Create Jira tickets for Priority 1 items
3. Assign developers to subscription and editor fixes
4. Schedule QA testing for language switching and theming

---

**End of Audit Report**
