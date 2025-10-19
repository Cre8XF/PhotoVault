# 🤖 PhotoVault AI - Funksjonsoversikt

## ✨ AI-funksjoner

### **1. Auto-tagging** ⭐⭐⭐⭐⭐
**Hva:** Analyser bilder automatisk og legg til beskrivende tagger  
**API:** Google Cloud Vision  
**Gratis tier:** 1000 bilder/måned

**Funksjonalitet:**
- Detekterer objekter (f.eks. "nature", "sunset", "person")
- Detekterer scener (f.eks. "beach", "indoor", "city")
- Detekterer konsepter (f.eks. "fun", "romantic", "peaceful")
- 1000+ mulige labels
- Confidence score for hver tag

**Eksempel resultat:**
```javascript
{
  labels: [
    { name: 'nature', confidence: 98 },
    { name: 'landscape', confidence: 95 },
    { name: 'mountain', confidence: 92 },
    { name: 'sky', confidence: 90 },
    { name: 'cloud', confidence: 85 }
  ]
}
```

**Bruk:**
- Kraftig søk ("finn alle naturbilder")
- Smart albums (auto-genererte kategorier)
- Organisering uten manuell innsats

---

### **2. Face Detection** ⭐⭐⭐⭐
**Hva:** Tell antall ansikter i bilder  
**API:** Google Cloud Vision  
**Gratis tier:** Inkludert i 1000 req/måned

**Funksjonalitet:**
- Detekterer ansikter i bilder
- Teller antall personer
- Ansikts-landmerker (øyne, nese, munn)
- Følelsesdeteksjon (glad, trist, sint)

**Eksempel resultat:**
```javascript
{
  faces: 3,
  faceDetails: [
    { joy: 'VERY_LIKELY', sorrow: 'UNLIKELY' },
    { joy: 'LIKELY', sorrow: 'UNLIKELY' },
    { joy: 'POSSIBLE', sorrow: 'UNLIKELY' }
  ]
}
```

**Bruk:**
- Filter: "Vis alle bilder med mennesker"
- Smart album: "Mennesker"
- Søk: "Bilder med flere personer"

**⚠️ NB:** Dette er bare *detection*, ikke *recognition*. For å gruppere samme person, bruk AWS Rekognition (FASE 2).

---

### **3. NSFW Detection** ⭐⭐⭐⭐
**Hva:** Detekter upassende innhold  
**API:** Google Cloud Vision (SafeSearch)  
**Gratis tier:** Inkludert i 1000 req/måned

**Funksjonalitet:**
- Adult content detection
- Violence detection  
- Racy content detection
- Medical content detection
- Spoof detection

**Eksempel resultat:**
```javascript
{
  safeSearch: {
    adult: 'UNLIKELY',
    violence: 'VERY_UNLIKELY',
    racy: 'POSSIBLE',
    medical: 'UNLIKELY',
    spoof: 'VERY_UNLIKELY'
  },
  isSafe: true
}
```

**Bruk:**
- Auto-filter upassende bilder
- Compliance for public sharing
- Parental controls

---

### **4. Background Removal** ⭐⭐⭐⭐⭐
**Hva:** Fjern bakgrunn fra bilder automatisk  
**API:** Picsart  
**Gratis tier:** 100 bilder/måned

**Funksjonalitet:**
- AI-powered background removal
- Høy kvalitet cutout
- Transparent PNG output
- Blur background (alternativ)
- Custom background color

**Eksempel bruk:**
```javascript
const result = await removeBackground(imageUrl, {
  format: 'PNG',
  outputType: 'cutout',
  bgBlur: 0 // eller 50 for blur
});
```

**Output:**
- Original bilde: `photo.url`
- Uten bakgrunn: `photo.noBgUrl`

**Bruk:**
- Produktbilder
- Profilbilder
- Kreativt bruk
- Social media content

---

### **5. Image Enhancement** ⭐⭐⭐⭐
**Hva:** Forbedre bildekvalitet automatisk  
**API:** Picsart  
**Gratis tier:** 100 bilder/måned

**Funksjonalitet:**
- AI upscaling (2x eller 4x)
- Denoise
- Sharpen
- Auto color correction
- Detail enhancement

**Eksempel bruk:**
```javascript
const result = await enhanceImage(imageUrl, {
  upscale: 2, // 2x eller 4x
  denoise: 50,
  sharpen: 30
});
```

**Output:**
- Original: `photo.url`
- Forbedret: `photo.enhancedUrl`

**Bruk:**
- Forbedre gamle bilder
- Klarere detaljer
- Bedre utskriftskvalitet

---

### **6. Smart Albums** ⭐⭐⭐⭐⭐
**Hva:** Auto-genererte album basert på AI-tags  
**API:** Lokal prosessering (ingen kostnad)  
**Gratis tier:** ∞ (ubegrenset)

**Kategorier:**

#### **Innholdsbaserte:**
- 👤 **Mennesker** - Bilder med ansikter/personer
- 🌲 **Natur** - Landskaper, trær, fjell
- 🍽️ **Mat & Drikke** - Mat, måltider, drikke
- 🐾 **Dyr** - Kjæledyr og ville dyr
- 🏛️ **Arkitektur** - Bygninger, byer
- ✈️ **Reise** - Ferie, strender, severdigheter
- 🎉 **Arrangementer** - Fester, feiringer
- ⚽ **Sport** - Sport og aktiviteter
- 🎨 **Kunst** - Kunst og kreativitet
- 🏠 **Innendørs** - Interiør

#### **Tidsbaserte:**
- 📅 **I dag** - Siste 24 timer
- 📆 **Siste uke** - Siste 7 dager
- 🗓️ **Siste måned** - Siste 30 dager
- 📊 **Siste år** - Siste 12 måneder

#### **Spesielle:**
- ⭐ **Favoritter** - Alle favorittbilder
- 📁 **Uten album** - Usorterte bilder

**Bruk:**
- Rask tilgang til kategorier
- Null manuell organisering
- Oppdages automatisk ved nye bilder

---

## 🔄 AI Workflow

### **Ved opplasting:**
```
1. Bruker laster opp bilde
2. [AI Toggle ON] → Analyser med Google Vision
3. Lagre tags i Firestore
4. Bilde vises i relevante Smart Albums
```

### **Manuel AI-prosessering:**
```
1. Åpne bilde i PhotoModal
2. Klikk "AI-verktøy"
3. Velg funksjon (tag, remove bg, enhance)
4. Resultat lagres automatisk
```

---

## 📊 AI-statistikk (i appen)

### **Dashboard viser:**
- Total bilder analysert
- Bilder forbedret
- Bakgrunner fjernet
- Estimerte kostnader
- Gjenstående gratis requests

**Tilgjengelig i:** Mer → AI-innstillinger

---

## 💰 Kostnadsberegning

### **Scenario 1: Privat bruker (100 bilder/mnd)**
```
Google Vision: GRATIS (under 1000)
Picsart: GRATIS (under 100)
Total: $0/mnd
```

### **Scenario 2: Aktiv bruker (500 bilder/mnd)**
```
Google Vision: GRATIS (under 1000)
Picsart: $0 (50 enhancements = gratis tier)
Total: $0/mnd
```

### **Scenario 3: Power user (2000 bilder/mnd)**
```
Google Vision: 
- 1000 gratis
- 1000 betalt × $0.0015 = $1.50

Picsart:
- 100 gratis
- 50 betalt → ~$5 (50/1000 × $99)
  
Total: ~$6.50/mnd
```

### **Scenario 4: Pro user (10,000 bilder/mnd)**
```
Google Vision:
- 1000 gratis
- 9000 betalt × $0.0015 = $13.50

Picsart:
- 100 gratis  
- 900 betalt → $9.99/mnd (Pro plan)

Total: ~$23.50/mnd
```

---

## 🎯 Anbefalte innstillinger

### **For testing (gratis):**
```javascript
// Aktiver kun for utvalgte bilder
aiTagging: false (default)

// Manuell AI-prosessering via AI-verktøy panel
// Holder deg godt innenfor gratis tier
```

### **For produksjon (best UX):**
```javascript
// Auto-tag alle bilder
aiTagging: true

// Smart albums genereres automatisk
// Kraftig søk tilgjengelig umiddelbart
```

---

## 🔮 Fremtidige AI-funksjoner (FASE 2+)

### **Planlagt:**
- ✅ Face Recognition (AWS Rekognition) - Grupper samme person
- ✅ Duplicate Detection - Finn like bilder
- ✅ Scene Classification - Mer granulære kategorier
- ✅ OCR Text Extraction - Ekstraher tekst fra bilder
- ✅ Object Detection - Detekter spesifikke objekter
- ✅ Color Analysis - Finn bilder etter dominerende farge
- ✅ Video AI - Støtte for videoer

### **Under vurdering:**
- Custom AI Models (TensorFlow.js)
- Offline AI (privacy-first)
- User-trained models
- AI-genererte kollasjer

---

## 📝 Eksempel-kode

### **Auto-tag ved opplasting:**
```javascript
// I UploadModal.jsx
const handleUpload = async (files, albumId, aiTagging) => {
  for (const file of files) {
    const photoId = await uploadPhoto(userId, file, albumId);
    
    if (aiTagging) {
      const analysis = await analyzeImage(downloadURL);
      await updatePhoto(photoId, {
        aiTags: analysis.labels.map(l => l.name),
        faces: analysis.faces,
        aiAnalyzed: true
      });
    }
  }
};
```

### **Søk med AI-tags:**
```javascript
// I SearchPage.jsx
const searchByTag = (photos, searchTerm) => {
  return photos.filter(photo => 
    photo.aiTags && 
    photo.aiTags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};
```

### **Generer Smart Albums:**
```javascript
// I HomeDashboard.jsx
import { generateAllSmartAlbums } from '../utils/smartAlbums';

const smartAlbums = generateAllSmartAlbums(photos);
// {
//   content: [...], // 10 kategorier
//   time: [...],    // 4 tidsperioder
//   favorites: {...},
//   unassigned: {...}
// }
```

---

## ✅ Sjekkliste for AI-implementering

- [x] Google Vision API konfigurert
- [x] Picsart API konfigurert
- [x] Auto-tagging funksjon
- [x] Face detection
- [x] NSFW detection
- [x] Background removal
- [x] Image enhancement
- [x] Smart albums generator
- [x] AI Tools Panel UI
- [x] AI Settings Page
- [x] Cost calculator
- [x] Upload modal med AI toggle
- [x] Søk med AI-tags
- [ ] Face recognition (FASE 2)
- [ ] Duplicate detection (FASE 2)

---

**Status:** ✅ Alle grunnleggende AI-funksjoner implementert  
**Testing:** Klar for testing med gratis tiers  
**Produksjon:** Klar for lansering

---

**Versjon:** 4.0 AI Edition  
**Dato:** 19. oktober 2025  
**Neste:** Test → Deploy → Monitor kostnader
