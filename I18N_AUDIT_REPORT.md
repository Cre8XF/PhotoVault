# PhotoVault i18n Audit Report
**Date:** 2025-11-13
**Auditor:** Claude AI
**Branch:** claude/i18n-audit-photovault-011CV5ry13vmsjEmmygLZG5G

## Executive Summary

This comprehensive audit identified **~150 hardcoded text strings** across 3 major feature areas that need internationalization. The existing i18n infrastructure is well-established with 11 namespaces, but recent features (Photo Editor, Collage Builder, Timeline) were built without i18n support.

### Current i18n Status
- ✅ **Well-established:** 11 translation namespaces covering core features
- ✅ **Good coverage:** 29+ components already using i18n
- ✅ **Complete translations:** Both Norwegian (NO) and English (EN) files exist
- ❌ **Major gaps:** Photo Editor, Collage Builder, Timeline have NO i18n
- ❌ **Alert/Confirm messages:** Many hardcoded Norwegian alerts

---

## Detailed Findings

### 1. Photo Editor Feature (CRITICAL - 0% i18n)
**Impact:** HIGH | **Strings Found:** ~70 | **Files:** 6

#### Files Checked:
| File | Lines | Hardcoded Strings | Status |
|------|-------|-------------------|--------|
| PhotoEditor.jsx | 294 | 20 | ❌ No i18n |
| EditorToolbar.jsx | 58 | 5 | ❌ No i18n |
| CropTool.jsx | 138 | 12 | ❌ No i18n |
| RotateTool.jsx | 46 | 5 | ❌ No i18n |
| FilterPanel.jsx | 170 | 10 | ❌ No i18n |
| TextTool.jsx | 358 | 20 | ❌ No i18n |

#### Examples of Hardcoded Strings:
**PhotoEditor.jsx:188**
```javascript
<h1 className="text-xl font-bold">Rediger bilde</h1>
<span className="hidden sm:inline">Last ned</span>
<span className="hidden sm:inline">{saving ? 'Lagrer...' : 'Lagre'}</span>
<p className="text-gray-400">Laster bilde...</p>
alert('Kunne ikke lagre bildet (canvas mangler)')
```

**EditorToolbar.jsx:12-15**
```javascript
{ id: 'crop', label: 'Beskjær', icon: Crop },
{ id: 'rotate', label: 'Roter', icon: RotateCw },
{ id: 'filters', label: 'Filtre', icon: Palette },
{ id: 'text', label: 'Tekst', icon: Type }
```

**CropTool.jsx**
```javascript
<h3>Beskjær bilde</h3>
<label>Sideforhold</label>
<button>Fri</button>
<p>Utvalgt område</p>
<span>Bruk</span>
<span>Avbryt</span>
```

**FilterPanel.jsx**
```javascript
<h3>Filtre og justeringer</h3>
<label>Filterforhåndsvisninger</label>
<label>Lysstyrke</label>
<label>Kontrast</label>
<label>Metning</label>
<button>Tilbakestill justeringer</button>
```

**TextTool.jsx**
```javascript
<h3>Tekst Overlegg</h3>
<label>Tekst</label>
<placeholder>Skriv din tekst her...</placeholder>
<label>Skrifttype</label>
<label>Størrelse</label>
<label>Farge</label>
<label>Stil</label>
<label>Justering</label>
<label>Posisjon</label>
<label>Horisontal</label>
<label>Vertikal</label>
<label>Skygge</label>
<label>Uskarphet</label>
<label>Kontur</label>
<label>Bredde</label>
<button>Legg til tekst</button>
```

---

### 2. Collage Builder Feature (CRITICAL - 0% i18n)
**Impact:** HIGH | **Strings Found:** ~30 | **Files:** 1

#### Files Checked:
| File | Lines | Hardcoded Strings | Status |
|------|-------|-------------------|--------|
| CollageBuilder.jsx | 407 | 30 | ❌ No i18n |

#### Examples of Hardcoded Strings:
**CollageBuilder.jsx**
```javascript
// Line 173
<h1>Lag kollasj</h1>
<p>Steg 1: Velg layout</p>
<p>Steg 2: Velg bilder</p>
<p>Steg 3: Forhåndsvisning</p>

// Line 192
<span>Last ned</span>
<span>Lagrer...</span>
<span>Lagre</span>

// Line 252
<span>Rediger</span>
<span>Tekst</span>
<span>Stickers</span>

// Line 287
<span>Endre bilder</span>
<h3>Layout info</h3>
<p>bilder</p>

// Line 300-305
<h3>Tips</h3>
<li>• Trykk "Last ned" for å lagre lokalt</li>
<li>• Trykk "Lagre" for å legge til i album</li>
<li>• Bruk "Endre bilder" for å bytte bilder</li>
<li>• Legg til tekst og stickers med fanene over</li>

// Line 336-337
<h3>Velg en layout</h3>
<p>Velg en layout fra menyen til venstre for å starte</p>

// Line 358-359
<p>Laster bilder...</p>
<h3>Lagrer kollasj...</h3>
<p>Laster opp til Firebase Storage</p>

// Line 379
<h3>Feil</h3>

// Line 112
alert('Kunne ikke lagre kollasjen. Prøv igjen.')
```

---

### 3. Timeline Feature (HIGH - 0% i18n)
**Impact:** MEDIUM | **Strings Found:** ~30 | **Files:** 3

#### Files Checked:
| File | Lines | Hardcoded Strings | Status |
|------|-------|-------------------|--------|
| TimelineView.jsx | 165 | 10 | ❌ No i18n |
| JumpToDatePicker.jsx | 86 | 15 | ❌ No i18n |
| OnThisDayWidget.jsx | 107 | 8 | ❌ No i18n |

#### Examples of Hardcoded Strings:
**TimelineView.jsx:108-111**
```javascript
<h2>Ingen bilder å vise</h2>
<p>Last opp bilder for å se dem organisert i tidslinjen</p>
<p>Viser {photos.length} {photos.length === 1 ? 'bilde' : 'bilder'} i {groups.length} {
  groupBy === 'day' ? 'dager' :
  groupBy === 'month' ? 'måneder' :
  'år'
}</p>
```

**JumpToDatePicker.jsx:10-13**
```javascript
const MONTHS = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
]

<h3>Gå til dato</h3>
<span>Gå til</span>
```

**OnThisDayWidget.jsx:41-45**
```javascript
<h3>På denne dagen</h3>
<p>Minner fra {dayMonth} i tidligere år</p>
<p>{photo.yearsAgo} {photo.yearsAgo === 1 ? 'år' : 'år'} siden</p>
<p>+{memories.length - 8} flere {memories.length - 8 === 1 ? 'minne' : 'minner'}</p>
```

---

### 4. Visual Enhancement Changes (MEDIUM)
**Impact:** MEDIUM | **Strings Found:** ~15 | **Files:** 2

#### Files Checked:
| File | Lines | Hardcoded Strings | Status |
|------|-------|-------------------|--------|
| AlbumCard.jsx | 137 | 3 | ❌ Partial i18n |
| PhotoGrid.jsx | 251 | 12 | ❌ Partial i18n |

#### Examples of Hardcoded Strings:
**AlbumCard.jsx:110-118**
```javascript
album.name || 'Uten navn'
{count} {count === 1 ? 'bilde' : 'bilder'}
title="Rediger album"
```

**PhotoGrid.jsx:28-69**
```javascript
window.confirm("Vil du slette dette bildet?");
alert("Dette bildet tilhører ikke et album");
alert("Kunne ikke sette forsidebilde");
<p>Ingen bilder å vise</p>
<span>Video</span>
<span>Forside</span>
title="Sett som albumforside"
title={photo.favorite ? "Fjern favoritt" : "Legg til favoritt"}
title="Slett bilde"
```

---

### 5. Modal & Alert Messages (HIGH PRIORITY)
**Impact:** HIGH | **Strings Found:** ~20

#### Alert/Confirm Calls Found:
| File | Line | Message |
|------|------|---------|
| PhotoGrid.jsx | 28 | `window.confirm("Vil du slette dette bildet?")` |
| PhotoGrid.jsx | 59 | `alert("Dette bildet tilhører ikke et album")` |
| PhotoGrid.jsx | 69 | `alert("Kunne ikke sette forsidebilde")` |
| PhotoModal.jsx | 117 | `alert('Videoredigering er ikke støttet ennå')` |
| PhotoModal.jsx | 145 | `alert('Bildet er lagret! Du finner det redigerte bildet i albumet.')` |
| PhotoModal.jsx | 148 | `alert('Kunne ikke lagre det redigerte bildet. Prøv igjen.')` |
| PhotoEditor.jsx | 137 | `alert('Kunne ikke lagre bildet (canvas mangler)')` |
| PhotoEditor.jsx | 162 | `alert('Kunne ikke lagre bildet')` |
| PhotoEditor.jsx | 172 | `alert('Kunne ikke lagre bildet')` |
| CollageBuilder.jsx | 112 | `alert('Kunne ikke lagre kollasjen. Prøv igjen.')` |
| QRShareModal.jsx | 51 | `alert('Bruker ikke lastet. Vent litt og prøv igjen.')` |
| QRShareModal.jsx | 93 | `alert('Kunne ikke generere delingslenke: ' + error.message)` |
| QRShareModal.jsx | 151 | `alert('Bruker ikke lastet. Vent litt og prøv igjen.')` |
| QRShareModal.jsx | 187 | `alert('Kunne ikke oppdatere innstillinger: ' + error.message)` |

---

## Components Already Using i18n ✅

The following 29 components are already properly internationalized:
- ✅ AlbumPage.jsx
- ✅ AlbumsPage.jsx
- ✅ HomeDashboard.jsx
- ✅ LoginPage.jsx
- ✅ MorePage.jsx (extensive i18n usage)
- ✅ SearchPage.jsx
- ✅ SecuritySettings.jsx
- ✅ AlbumModal.jsx
- ✅ ConfirmModal.jsx
- ✅ ComingSoonModal.jsx
- ✅ CommentThread.jsx
- ✅ MoveModal.jsx
- ✅ NotificationPanel.jsx
- ✅ PhotoModal.jsx (partial)
- ✅ UploadModal.jsx
- ✅ VaultSettingsModal.jsx
- ✅ VaultSetupModal.jsx
- ✅ QRShareModal.jsx (partial)
- And 11 more...

---

## Recommendations & Action Plan

### Priority 1: Photo Editor (CRITICAL)
1. Create `src/locales/no/editor.json` and `src/locales/en/editor.json`
2. Add 70+ translation keys for all editor strings
3. Update all 6 editor components to use `useTranslation(['editor'])`
4. Replace all hardcoded Norwegian text with `t('editor:key')` calls
5. Replace all `alert()` calls with translated messages

**Estimated strings:** 70
**Estimated time:** 2-3 hours

### Priority 2: Collage Builder (HIGH)
1. Create `src/locales/no/collage.json` and `src/locales/en/collage.json`
2. Add 30+ translation keys
3. Update CollageBuilder.jsx to use `useTranslation(['collage'])`
4. Replace all hardcoded text with `t('collage:key')` calls

**Estimated strings:** 30
**Estimated time:** 1 hour

### Priority 3: Timeline (HIGH)
1. Create `src/locales/no/timeline.json` and `src/locales/en/timeline.json`
2. Add 30+ translation keys (including month names)
3. Update 3 timeline components to use `useTranslation(['timeline'])`
4. Replace all hardcoded text with `t('timeline:key')` calls

**Estimated strings:** 30
**Estimated time:** 1 hour

### Priority 4: Visual Enhancements (MEDIUM)
1. Extend existing translation files with missing keys
2. Update AlbumCard.jsx and PhotoGrid.jsx
3. Replace remaining hardcoded strings

**Estimated strings:** 15
**Estimated time:** 30 minutes

### Priority 5: Alert/Confirm Messages (HIGH)
1. Replace all `alert()` and `confirm()` calls with translated versions
2. Consider using toast notifications instead of alerts for better UX

**Estimated strings:** 20
**Estimated time:** 1 hour

### Priority 6: Update i18n Configuration
1. Update `src/i18n.js` to include new namespaces:
   - `editor`
   - `collage`
   - `timeline`

---

## Summary Statistics

| Category | Files Checked | Strings Found | Strings Fixed | Status |
|----------|---------------|---------------|---------------|--------|
| Photo Editor | 6 | 70 | 0 | ❌ Not started |
| Collage Builder | 1 | 30 | 0 | ❌ Not started |
| Timeline | 3 | 30 | 0 | ❌ Not started |
| Visual Enhancements | 2 | 15 | 0 | ❌ Not started |
| Alert/Confirm | 14 | 20 | 0 | ❌ Not started |
| **TOTAL** | **26** | **165** | **0** | **0% Complete** |

---

## Testing Checklist

After implementation, verify:
- [ ] All strings display correctly in Norwegian (NO)
- [ ] All strings display correctly in English (EN)
- [ ] Language switcher works in Photo Editor
- [ ] Language switcher works in Collage Builder
- [ ] Language switcher works in Timeline
- [ ] No console errors related to missing translation keys
- [ ] All alert/confirm messages are translated
- [ ] Toast notifications (if implemented) are translated
- [ ] Month names in JumpToDatePicker are translated
- [ ] Pluralization works correctly (photo/photos, etc.)

---

## Conclusion

PhotoVault has a solid i18n foundation, but recent feature additions bypassed the translation system. This audit identified **165 hardcoded strings** across **26 files** that require internationalization.

**Next Steps:**
1. Create 3 new translation namespace files (editor, collage, timeline)
2. Systematically replace hardcoded strings with t() calls
3. Update i18n.js configuration
4. Test language switching thoroughly
5. Commit and push changes

**Estimated Total Time:** 6-8 hours
**Impact:** HIGH - Enables full multilingual support for ALL features
