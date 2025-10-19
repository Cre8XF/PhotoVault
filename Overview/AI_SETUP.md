# 🤖 PhotoVault AI - Setup Guide

## 📋 Oversikt

PhotoVault støtter nå AI-funksjoner via Google Cloud Vision og Picsart API.

### **AI-funksjoner:**
- ✅ Auto-tagging (Google Vision)
- ✅ Face detection (Google Vision)
- ✅ NSFW detection (Google Vision)
- ✅ Background removal (Picsart)
- ✅ Image enhancement (Picsart)
- ✅ Smart albums (basert på AI-tags)

---

## 🔑 API-nøkler (100% GRATIS for testing)

### **1. Google Cloud Vision API**

#### **Gratis tier:**
- 1000 requests/måned GRATIS
- Ingen kredittkort nødvendig for start

#### **Hvordan få API-nøkkel:**

1. **Gå til Google Cloud Console:**
   - https://console.cloud.google.com

2. **Opprett nytt prosjekt:**
   - Klikk "Select a project" → "NEW PROJECT"
   - Navn: "PhotoVault"
   - Klikk "CREATE"

3. **Aktiver Vision API:**
   - Gå til "APIs & Services" → "Library"
   - Søk etter "Cloud Vision API"
   - Klikk "ENABLE"

4. **Opprett API-nøkkel:**
   - Gå til "APIs & Services" → "Credentials"
   - Klikk "CREATE CREDENTIALS" → "API key"
   - Kopier nøkkelen

5. **Begrens API-nøkkel (anbefalt):**
   - Klikk på API-nøkkelen
   - Under "API restrictions" → Velg "Restrict key"
   - Velg "Cloud Vision API"
   - Klikk "SAVE"

---

### **2. Picsart API**

#### **Gratis tier:**
- 100 requests/måned GRATIS
- Ingen kredittkort nødvendig

#### **Hvordan få API-nøkkel:**

1. **Gå til Picsart API:**
   - https://picsart.io/api

2. **Sign up:**
   - Klikk "Get Started"
   - Registrer deg med e-post

3. **Få API-nøkkel:**
   - Gå til Dashboard
   - Klikk "Create API Key"
   - Kopier nøkkelen

---

## ⚙️ Installasjon

### **Steg 1: Kopier AI-filer**

```bash
# Utils
cp outputs/googleVision.js src/utils/
cp outputs/picsartAI.js src/utils/
cp outputs/smartAlbums.js src/utils/

# Komponenter
cp outputs/AIToolsPanel.jsx src/components/
cp outputs/SmartAlbumsView.jsx src/components/
cp outputs/UploadModal.jsx src/components/

# Sider
cp outputs/AISettingsPage.jsx src/pages/
```

### **Steg 2: Legg til API-nøkler**

Opprett eller oppdater `.env` i root:

```bash
# Google Cloud Vision API
REACT_APP_GOOGLE_VISION_KEY=AIzaSy...

# Picsart API
REACT_APP_PICSART_KEY=pk_...
```

**VIKTIG:** Legg `.env` til i `.gitignore`:

```bash
echo ".env" >> .gitignore
```

### **Steg 3: Oppdater Firebase**

Legg til AI-felter i `firebase.js`:

```javascript
// I uploadPhoto funksjonen, legg til AI-analyse hvis enabled
export const uploadPhoto = async (userId, file, albumId = null, aiTagging = false) => {
  // ... eksisterende kode ...
  
  const photoData = {
    // ... eksisterende felter ...
    aiTags: [],
    faces: 0,
    aiAnalyzed: false,
    enhanced: false,
    bgRemoved: false,
  };
  
  const docRef = await addDoc(collection(db, "photos"), photoData);
  
  // Kjør AI-analyse hvis enabled
  if (aiTagging) {
    try {
      const { analyzeImage } = await import('./utils/googleVision');
      const analysis = await analyzeImage(downloadURL);
      
      await updateDoc(docRef, {
        aiTags: analysis.labels.map(l => l.name),
        faces: analysis.faces,
        aiAnalyzed: true,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('AI analysis failed:', err);
    }
  }
  
  return docRef.id;
};
```

### **Steg 4: Start appen**

```bash
npm start
```

---

## 📦 Filstruktur

```
src/
├── utils/
│   ├── googleVision.js      # ✅ NY - Google Vision API
│   ├── picsartAI.js         # ✅ NY - Picsart API  
│   └── smartAlbums.js       # ✅ NY - Smart albums generator
├── components/
│   ├── AIToolsPanel.jsx     # ✅ NY - AI verktøy UI
│   ├── SmartAlbumsView.jsx  # ✅ NY - Smart albums visning
│   └── UploadModal.jsx      # ⚠️ OPPDATERT - AI toggle
├── pages/
│   └── AISettingsPage.jsx   # ✅ NY - AI innstillinger
└── .env                     # ✅ NY - API-nøkler
```

---

## 🚀 Bruk

### **1. Auto-tagging ved opplasting**

```javascript
// I UploadModal
const handleUpload = async (files, albumId, aiTagging) => {
  // aiTagging = true aktiverer AI-analyse
  await uploadPhoto(userId, file, albumId, aiTagging);
};
```

### **2. Manuell AI-analyse**

```javascript
// I AIToolsPanel
import { analyzeImage } from '../utils/googleVision';

const analysis = await analyzeImage(photo.url, {
  detectLabels: true,
  detectFaces: true,
  detectSafeSearch: true,
  maxLabels: 10,
});

// Resultat:
// {
//   labels: [{ name: 'nature', confidence: 95 }],
//   faces: 2,
//   isSafe: true,
//   safeSearch: { adult: 'UNLIKELY', ... }
// }
```

### **3. Background removal**

```javascript
import { removeBackground } from '../utils/picsartAI';

const result = await removeBackground(photo.url, {
  format: 'PNG',
  outputType: 'cutout',
});

// Resultat: { success: true, url: '...' }
```

### **4. Smart albums**

```javascript
import { generateAllSmartAlbums } from '../utils/smartAlbums';

const smartAlbums = generateAllSmartAlbums(photos);

// Resultat:
// {
//   content: [{ id: 'smart-people', name: 'Mennesker', count: 45, ... }],
//   time: [{ id: 'time-24h', name: 'I dag', count: 5, ... }],
//   favorites: { id: 'smart-favorites', count: 12, ... },
//   unassigned: { id: 'smart-unassigned', count: 8, ... }
// }
```

---

## 💰 Kostnader

### **Gratis tier (første 1000 bilder/måned):**

| API | Gratis tier | Pris etter gratis |
|-----|-------------|-------------------|
| **Google Vision** | 1000 req/mnd | $1.50 per 1000 |
| **Picsart** | 100 req/mnd | $9.99/mnd (1000 req) |

### **Eksempel kostnadsberegning:**

```
Scenario: 2000 bilder lastet opp per måned

Google Vision (auto-tagging):
- 1000 gratis
- 1000 betalt × $0.0015 = $1.50

Picsart (50 background removals):
- 50 av 100 gratis = $0

TOTAL: $1.50/mnd
```

### **Estimert kostnad i appen:**

Gå til **Mer → AI-innstillinger** for å se estimerte kostnader basert på bruk.

---

## 🧪 Testing

### **Test Google Vision:**

```javascript
import { analyzeImage, checkAPIKey } from './utils/googleVision';

// Sjekk API-nøkkel
const status = checkAPIKey();
console.log(status); // { isConfigured: true, key: 'AIzaSy...' }

// Test analyse
const analysis = await analyzeImage('https://example.com/photo.jpg');
console.log(analysis.labels); // [{ name: 'sky', confidence: 98 }, ...]
```

### **Test Picsart:**

```javascript
import { removeBackground, checkAPIKey } from './utils/picsartAI';

// Sjekk API-nøkkel
const status = checkAPIKey();
console.log(status); // { isConfigured: true, key: 'pk_...' }

// Test background removal
const result = await removeBackground('https://example.com/photo.jpg');
console.log(result.url); // URL til bilde uten bakgrunn
```

---

## ⚠️ Feilsøking

### **Problem: "API key not configured"**

**Løsning:**
1. Sjekk at `.env` finnes i root
2. Sjekk at variablene heter `REACT_APP_GOOGLE_VISION_KEY` (ikke `GOOGLE_VISION_KEY`)
3. Restart appen: `npm start`

### **Problem: "Google Vision API error: 400"**

**Løsning:**
1. Sjekk at Cloud Vision API er aktivert i Google Cloud Console
2. Sjekk at API-nøkkelen har riktige permissions
3. Sjekk at billing er aktivert (selv for gratis tier)

### **Problem: "Picsart API error: 401"**

**Løsning:**
1. Sjekk at API-nøkkelen er korrekt
2. Sjekk at du ikke har overskredet gratis tier (100 req/mnd)
3. Login på Picsart dashboard og verifiser nøkkel

### **Problem: CORS error**

**Løsning:**
Firebase Storage må ha CORS konfigurert. Se `cors.json` i prosjektet.

---

## 📊 Monitoring

### **Se AI-aktivitet:**

1. Gå til **Mer → AI-innstillinger**
2. Se statistikk:
   - Analyserte bilder
   - Forbedrede bilder
   - Bakgrunner fjernet
   - Total requests
3. Se estimerte kostnader

---

## 🔐 Sikkerhet

### **API-nøkler:**
- ❌ ALDRI commit `.env` til Git
- ❌ ALDRI del API-nøkler offentlig
- ✅ Bruk miljøvariabler (`process.env`)
- ✅ Begrens API-nøkler til spesifikke API-er

### **Best practices:**
```javascript
// ✅ RIKTIG
const API_KEY = process.env.REACT_APP_GOOGLE_VISION_KEY;

// ❌ FEIL
const API_KEY = 'AIzaSy...'; // Hardkodet
```

---

## 🚀 Neste steg

1. ✅ Sett opp API-nøkler
2. ✅ Test AI-funksjoner
3. ✅ Aktiver auto-tagging
4. ✅ Generer smart albums
5. 📅 Vurder AWS Rekognition for face recognition (FASE 2)

---

## 📚 Ressurser

- **Google Vision Docs:** https://cloud.google.com/vision/docs
- **Picsart API Docs:** https://docs.picsart.io
- **Firebase Storage CORS:** https://firebase.google.com/docs/storage/web/download-files

---

**Versjon:** 4.0  
**Dato:** 19. oktober 2025  
**AI-funksjoner:** ✅ Aktiv
