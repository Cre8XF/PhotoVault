# CLAUDE CODE GUIDE - COLLAGE V3 PHASE CV IMPLEMENTATION

## 📚 DOKUMENTER SOM SKAL LESES (I REKKEFØLGE)

### 1. COLLAGE_V3_COLLAGEVIEW.md
**Fra:** ChatGPT
**Inneholder:** Overordnet struktur for CollageView, thumbnail system, album integration
**Les dette for:** Forstå hva som skal bygges

### 2. COLLAGE_V3_EXTRAS.md  
**Fra:** ChatGPT
**Inneholder:** Replace Photo, Reorder Photos, UI refinements
**Les dette for:** Forstå ekstra features

### 3. COLLAGE_V3_FIXES.md
**Fra:** Roger + Claude (dette dokumentet)
**Inneholder:** KRITISKE RETTELSER + manglende implementasjonsdetaljer
**Les dette for:** Riktig implementasjon med korrekte feltnavn

---

## 🎯 HVORDAN CLAUDE CODE SKAL BRUKE DISSE

### STEG 1: Les alle tre dokumentene
```bash
# Claude Code kommando:
Read the following files:
1. COLLAGE_V3_COLLAGEVIEW.md
2. COLLAGE_V3_EXTRAS.md  
3. COLLAGE_V3_FIXES.md
```

### STEG 2: Anvend korreksjoner fra FIXES
**VIKTIG:** Alt i `COLLAGE_V3_FIXES.md` overstyrer de to originale dokumentene.

**Eksempel:**
```javascript
// COLLAGE_V3_COLLAGEVIEW.md sier:
thumbnailURL: "https://..."  // ❌ FEIL

// COLLAGE_V3_FIXES.md sier:
thumbnailUrl: "https://..."  // ✅ RIKTIG

// Claude Code bruker: thumbnailUrl ✅
```

### STEG 3: Følg implementeringsprioritet
Fra `COLLAGE_V3_FIXES.md` seksjon "IMPLEMENTATION PRIORITY":

**Phase CV-1: Core Viewing (MUST HAVE)**
1. Fix all field names (url, thumbnailUrl)
2. Implement renderCollageToCanvas.js
3. Create CollageView.jsx
4. Add routing
5. Thumbnail generation on save

**Phase CV-2: Edit & Delete (HIGH PRIORITY)**
6. Edit existing collage
7. Delete collage
8. Update AlbumCard

**Phase CV-3: Replace Photo (MEDIUM PRIORITY)**
9. Long press detection
10. ActionMenu component
11. ReplacePhotoModal

**Phase CV-4: Reorder (NICE TO HAVE)**
12. Install @dnd-kit
13. Reorder mode UI
14. Drag & drop implementation

---

## 🚨 KRITISKE REGLER

### Regel 1: Alltid bruk riktige feltnavn
```javascript
// ✅ ALWAYS USE:
photo.url
photo.thumbnailUrl
photo.name
photo.filename

// ❌ NEVER USE:
photo.downloadURL
photo.thumbnailURL
photo.thumbnail
```

### Regel 2: Bruk ferdig kode fra FIXES
Når `COLLAGE_V3_FIXES.md` gir konkret kode, **kopier den direkte**.

**Eksempel:**
- renderCollageToCanvas.js → Bruk koden fra FIXES (ikke lag ny)
- ActionMenu.jsx → Bruk koden fra FIXES (ikke lag ny)
- Long press handler → Bruk koden fra FIXES (ikke lag ny)

### Regel 3: PropTypes må matche Firestore
```javascript
// Fra COLLAGE_V3_FIXES.md
photo: PropTypes.shape({
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,          // ✅ Not downloadURL
  thumbnailUrl: PropTypes.string,            // ✅ Not thumbnailURL
  name: PropTypes.string,
  filename: PropTypes.string
})
```

---

## 📋 CLAUDE CODE PROMPT (COPY-PASTE KLAR)

```
You are implementing Phase CV (CollageView & Thumbnail System) for Pixtr Collage Builder V3.

READING ORDER:
1. Read COLLAGE_V3_COLLAGEVIEW.md (overall structure)
2. Read COLLAGE_V3_EXTRAS.md (extra features)
3. Read COLLAGE_V3_FIXES.md (CRITICAL CORRECTIONS - apply these!)

CRITICAL RULES:
- ALWAYS use photo.url (NOT downloadURL)
- ALWAYS use photo.thumbnailUrl (NOT thumbnailURL or thumbnail)
- ALWAYS use code examples from COLLAGE_V3_FIXES.md
- ALWAYS follow implementation priority (CV-1 → CV-2 → CV-3 → CV-4)

PHASE CV-1 TASKS (implement first):
1. Fix all field names throughout codebase
2. Create src/utils/renderCollageToCanvas.js (use code from FIXES.md)
3. Create src/pages/CollageView.jsx
4. Add route to App.jsx
5. Update CollageBuilder.jsx to generate thumbnails on save

After completing CV-1, output:
"PHASE CV-1 COMPLETE - Ready for CV-2"

Do NOT proceed to CV-2 until user confirms CV-1 works.

START WITH: Reading all three files and confirming field name corrections.
```

---

## ✅ TESTING ETTER HVER FASE

### Test Phase CV-1:
```bash
# 1. Lagre en collage
# 2. Sjekk Firestore:
#    - thumbnailUrl field finnes (IKKE thumbnailURL)
#    - url field brukes (IKKE downloadURL)
# 3. Sjekk Storage:
#    - users/{uid}/collages/thumbnails/{id}.jpg finnes
# 4. Åpne /collage/{id}
#    - Ser du collaget?
# 5. Console:
#    - Ingen PropTypes warnings?
```

### Test Phase CV-2:
```bash
# 1. Klikk Edit på en collage
#    - Åpner CollageBuilder?
#    - Riktig layout loaded?
#    - Riktig photos loaded?
# 2. Klikk Delete
#    - Confirmation modal?
#    - Forsvinner fra lista?
# 3. Sjekk AlbumCard
#    - Thumbnail vises?
```

### Test Phase CV-3:
```bash
# 1. Long-press et bilde (mobil)
#    - Meny vises?
# 2. Hover bilde (desktop)
#    - ⋮ knapp vises?
# 3. Velg Replace Photo
#    - ImagePickerV3 åpner?
#    - Kun 1 valg tillatt?
# 4. Velg nytt bilde
#    - Preview oppdateres?
```

### Test Phase CV-4:
```bash
# 1. Klikk Reorder Photos
#    - Drag handles vises?
# 2. Dra et bilde
#    - Kan flytte det?
#    - Preview oppdateres?
# 3. Klikk Done
#    - Normal modus?
```

---

## 🔧 TROUBLESHOOTING

### Problem: Thumbnails vises ikke
```javascript
// Sjekk 1: Riktig field name?
console.log('Thumbnail URL:', collage.thumbnailUrl) // NOT thumbnailURL

// Sjekk 2: URL finnes i Firestore?
// Gå til Firebase Console → Firestore → collages → {id}

// Sjekk 3: Fil finnes i Storage?
// Gå til Firebase Console → Storage → users/{uid}/collages/thumbnails/
```

### Problem: PropTypes warnings
```javascript
// Feil:
downloadURL: PropTypes.string.isRequired  // ❌

// Riktig:
url: PropTypes.string.isRequired  // ✅
```

### Problem: Canvas ikke renderer
```javascript
// Legg til logging i renderCollageToCanvas.js:
console.log('Canvas dimensions:', canvas.width, canvas.height)
console.log('Photos to render:', photos.length)
console.log('Layout slots:', layout.slots.length)

// Sjekk at:
// 1. photos.length > 0
// 2. Alle photos har .url
// 3. layout.canvas.width og .height er definert
```

---

## 🎯 SUCCESS KRITERIER

Phase CV er FERDIG når:

**CV-1:**
- ✅ Thumbnails genereres og lagres
- ✅ CollageView viser hele collaget
- ✅ Alle felt bruker riktig navn (url, thumbnailUrl)
- ✅ Ingen PropTypes warnings

**CV-2:**
- ✅ Edit åpner med riktig data
- ✅ Delete funker med confirmation
- ✅ AlbumCard viser thumbnail

**CV-3:**
- ✅ Long press viser meny
- ✅ Replace Photo funker
- ✅ Preview oppdateres

**CV-4:**
- ✅ Reorder mode funker
- ✅ Drag & drop smooth
- ✅ Preview oppdateres

---

## 📦 DEPENDENCIES SOM TRENGS

```bash
# For Phase CV-4 (Reorder):
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**INGEN andre dependencies er nødvendig for CV-1, CV-2, CV-3.**

---

## 🚀 START IMPLEMENTERING

Når Claude Code er klar:

```bash
# I Claude Code:
Begin Phase CV-1 implementation

# Claude Code vil da:
1. Read all three .md files
2. Apply corrections from FIXES.md
3. Implement renderCollageToCanvas.js
4. Create CollageView.jsx
5. Update CollageBuilder.jsx
6. Output: "PHASE CV-1 COMPLETE"
```

**Lykke til!** 🎉
