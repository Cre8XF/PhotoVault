PhotoVault AI-fase: Detaljert Implementasjonsplan

1. Overordnede Mål for AI-fasen 1.1 Gratis Tier

Auto-tagging: Analyse med Google Vision ved opplasting (1000 requests/måned gratis) Smart søk: Søk basert på AI-genererte tagger Kategorisering: Automatisk sortering i kategorier (natur, mennesker, mat, etc.) API-nøkkel: Bruker må sette opp egen Google Vision API-nøkkel

1.2 Pro Tier

Bakgrunnsfjerning: Picsart API via server-proxy (100 requests/måned gratis) Bildeforbedring: AI upscaling og kvalitetsforbedring (2x/4x) Effekter: 10+ AI-baserte bildeeffekter Batch-operasjoner: Flere bilder samtidig Ingen API-nøkkel nødvendig: Server håndterer kall med egen nøkkel Utvidet kvote: 500 requests/måned for Pro-brukere

2. Frontend-struktur 2.1 Komponenter som må kobles sammen src/ ├── components/ │ ├── AIToolsPanel.jsx ✓ (Eksisterer) │ ├── AIResultsViewer.jsx [NY] │ ├── AIBatchProcessor.jsx [NY] │ └── AIOnboardingTour.jsx [NY] ├── pages/ │ ├── AISettingsPage.jsx ✓ (Eksisterer) │ ├── AILogPanel.jsx ✓ (Eksisterer) │ └── AIGalleryView.jsx [NY] └── utils/ ├── googleVision.js ✓ (Eksisterer) ├── picsartAI.js ✓ (Eksisterer) ├── aiQueue.js [NY] └── aiCache.js [NY]

```

### **2.2 Brukerflyt**

#### **Flyt 1: Opplasting med Auto-tagging**
```

1. Bruker laster opp bilde(r) ↓
2. UploadModal viser progress ↓
3. Firebase Storage → Upload fullført ↓
4. Auto-tagging toggle sjekkes (localStorage) ↓
5. Google Vision analyser bilde (hvis aktivert) ↓
6. Firestore oppdateres med:
   - aiTags: ['person', 'outdoor', 'nature']
   - faces: 2
   - category: 'people'
   - aiAnalyzed: true
   - analyzedAt: timestamp ↓
7. UI oppdateres med nye tagger

```

#### **Flyt 2: Manuell AI-behandling**
```

1. Bruker velger bilde → PhotoModal åpnes ↓
2. Bruker klikker AI-ikon → AIToolsPanel slide-in ↓
3. Bruker velger handling:
   - Auto-tag (Google Vision)
   - Fjern bakgrunn (Picsart)
   - Forbedre kvalitet (Picsart)
   - Effekter (Picsart) ↓
4. Processing state → Loader animasjon ↓
5. API-kall (direkte eller via proxy) ↓
6. AIResultsViewer viser før/etter ↓
7. Bruker godkjenner → Firestore oppdateres ↓
8. Ny versjon lagres i Storage

```

#### **Flyt 3: Batch-operasjoner (Pro)**
```

1. Bruker velger flere bilder (multi-select mode) ↓
2. Batch-knapp aktiveres i toolbar ↓
3. AIBatchProcessor modal åpnes ↓
4. Bruker velger operasjon + innstillinger ↓
5. Queue system (aiQueue.js) håndterer:
   - Rate limiting (2 sek mellom kall)
   - Progress tracking
   - Error handling
   - Retry logic ↓
6. Bulk Firestore update etter fullføring

7. Backend-flyt 3.1 API-håndtering: To modeller Modell A: Bruker-API (Gratis) javascript// Frontend → Direkte til API const result = await analyzeImage(photoUrl, { detectLabels: true, detectFaces: true });

// googleVision.js bruker REACT_APP_GOOGLE_VISION_KEY fetch(`${VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`, ...) Fordeler:

Enkel implementasjon Ingen server-kostnader Bruker kontrollerer kostnader

Ulemper:

Bruker må sette opp API-nøkkel API-nøkkel eksponeres i frontend (men OK for Google Vision)

Modell B: Server-proxy (Pro) javascript// Frontend → Firebase Function → Picsart API const result = await removeBackground(photoUrl);

// Firebase Function exports.picsartProxy = functions.https.onCall(async (data, context) => { // Sjekk autentisering if (!context.auth) throw new HttpsError('unauthenticated');

// Sjekk Pro-status const userDoc = await db.collection('users').doc(context.auth.uid).get(); if (!userDoc.data().isPro) throw new HttpsError('permission-denied');

// Sjekk kvote const usage = await checkUserQuota(context.auth.uid); if (usage.monthlyRequests >= 500) throw new HttpsError('resource-exhausted');

// Utfør API-kall med server-nøkkel const result = await fetch('https://api.picsart.io/tools/removebg', { headers: { 'X-Picsart-API-Key': PICSART_KEY } });

// Oppdater kvote await incrementUserQuota(context.auth.uid);

return result; }); Fordeler:

API-nøkkel skjult Kvotekontroll på server Enklere for bruker (Pro)

Ulemper:

Server-kostnader (Firebase Functions) Mer kompleks implementasjon

3.2 Firestore-struktur javascript// Collection: photos { id: "photo123", userId: "user456", url: "https://storage...", name: "IMG_001.jpg",

// AI-data aiAnalyzed: true, analyzedAt: "2025-10-22T10:00:00Z", aiTags: ["nature", "outdoor", "tree", "landscape"], faces: 2, category: "nature", // fra categorizeImage()

// AI-behandlinger enhanced: false, enhancedUrl: null, enhancedAt: null,

bgRemoved: false, noBgUrl: null, bgRemovedAt: null,

// Batch-tracking batchId: null, batchProcessedAt: null }

// Collection: aiUsage (ny) { userId: "user456", month: "2025-10",

// Teller googleVisionRequests: 45, picsartRequests: 12, totalRequests: 57,

// Detaljer requestsByType: { autoTag: 30, removeBg: 5, enhance: 7 },

// Kostnader estimatedCost: 0.00, // innenfor gratis tier isPro: true, quotaLimit: 500,

updatedAt: timestamp }

// Collection: aiLogs (ny) { userId: "user456", photoId: "photo123", operation: "removeBg", // autoTag, enhance, removeBg, effect status: "success", // success, failed, pending provider: "picsart", // google, picsart

// Input inputUrl: "https://...",

// Output outputUrl: "https://...",

// Metadata processingTime: 2500, // ms cost: 0.001, error: null,

createdAt: timestamp } 3.3 Firebase Functions (nye) javascript// functions/index.js

// 1. Proxy for Picsart (Pro-brukere) exports.picsartProxy = functions.https.onCall(async (data, context) => { // Se Modell B over });

// 2. Auto-tag ved opplasting (valgfri) exports.autoTagOnUpload = functions.firestore .document('photos/{photoId}') .onCreate(async (snap, context) => { const photo = snap.data();

    // Sjekk om auto-tagging er aktivert for bruker
    const userDoc = await db.collection('users').doc(photo.userId).get();
    if (!userDoc.data().aiAutoTag) return;

    // Analyser bilde
    const analysis = await analyzeImageServer(photo.url);

    // Oppdater Firestore
    await snap.ref.update({
      aiTags: analysis.labels,
      faces: analysis.faces,
      category: analysis.category,
      aiAnalyzed: true,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Logg bruk
    await logAIUsage(photo.userId, 'autoTag', 'google');

});

// 3. Oppdater månedlig kvote (automatisk reset) exports.resetMonthlyQuota = functions.pubsub .schedule('0 0 1 \* \*') // Første dag i måneden .onRun(async (context) => { const usageRef = db.collection('aiUsage'); const snapshot = await usageRef.get();

    // Reset alle brukere
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        googleVisionRequests: 0,
        picsartRequests: 0,
        totalRequests: 0,
        requestsByType: {},
        estimatedCost: 0
      });
    });

    await batch.commit();

});

// 4. Cleanup gamle AI-versjoner (storage optimization) exports.cleanupOldAIVersions = functions.pubsub .schedule('0 2 \* \* 0') // Hver søndag kl 02:00 .onRun(async (context) => { // Slett AI-genererte bilder eldre enn 90 dager // som ikke er merket som "keep" });

```

---

## **4. Design og UX**

### **4.1 AIToolsPanel (oppdatert design)**

**Layout:**
```

┌─────────────────────────────────────┐ │ 🪄 AI-verktøy ✕ │ ├─────────────────────────────────────┤ │ │ │ ┌─────────────────────────────┐ │ │ │ [Bilde preview 300x200] │ │ │ │ │ │ │ └─────────────────────────────┘ │ │ IMG_001.jpg • 2.4 MB │ │ │ ├─────────────────────────────────────┤ │ ANALYSE │ │ ┌─────────────────────────────┐ │ │ │ 🔍 Auto-tagging → │ │ ← Gratis │ │ Finn tagger automatisk │ │ │ └─────────────────────────────┘ │ │ │ │ FORBEDRINGER (Pro) │ │ ┌─────────────────────────────┐ │ │ │ ✨ Fjern bakgrunn → │ │ ← Pro │ │ AI bakgrunnsfjerning │ │ │ └─────────────────────────────┘ │ │ ┌─────────────────────────────┐ │ │ │ 🎨 Forbedre kvalitet → │ │ ← Pro │ │ Oppskaler til 2x/4x │ │ │ └─────────────────────────────┘ │ │ ┌─────────────────────────────┐ │ │ │ 🌟 Effekter → │ │ ← Pro │ │ 10+ AI-effekter │ │ │ └─────────────────────────────┘ │ │ │ │ ⚡ 45/1000 requests brukt │ │ 📊 Estimert kostnad: $0.00 │ └─────────────────────────────────────┘

```

**Farger:**
- **Gratis funksjoner**: Purple-600 (`#9333EA`)
- **Pro funksjoner**: Gold gradient (`linear-gradient(135deg, #FFD700, #FFA500)`)
- **Success**: Green-500 (`#10B981`)
- **Error**: Red-500 (`#EF4444`)
- **Processing**: Animated purple pulse

**Animasjoner:**
- **Slide-in**: `translate-x-full → translate-x-0` (300ms ease-out)
- **Processing**: Rotating loader + pulserende background
- **Success**: Scale + fade-in checkmark (500ms)

### **4.2 AIResultsViewer (ny komponent)**

**Layout:**
```

┌─────────────────────────────────────┐ │ Resultat: Bakgrunn fjernet │ ├─────────────────────────────────────┤ │ │ │ ┌─────────┬─────────────┐ │ │ │ FØR │ ETTER │ │ │ ├─────────┼─────────────┤ │ │ │ [img] │ [img] │ │ │ │ │ │ │ │ │ │ │ │ │ └─────────┴─────────────┘ │ │ │ │ [────────●─────────] Før/Etter │ ← Slider │ │ │ 📊 Detaljer: │ │ • Prosesseringstid: 2.3s │ │ • Filstørrelse: 2.4 MB → 1.8 MB │ │ • Format: JPG → PNG │ │ │ │ [Avbryt] [Last ned] [Lagre ✓] │ └─────────────────────────────────────┘

```

**Interaksjon:**
- **Før/etter slider**: Drag horisontalt for sammenligning
- **Zoom**: Pinch/scroll for zoom inn/ut
- **Download**: Last ned uten å lagre i vault
- **Save**: Erstatt original eller behold begge

### **4.3 AIBatchProcessor (ny komponent)**

**Layout:**
```

┌─────────────────────────────────────┐ │ Batch-behandling: 15 bilder │ ├─────────────────────────────────────┤ │ │ │ Velg operasjon: │ │ ○ Auto-tagging │ │ ○ Fjern bakgrunn │ │ ● Forbedre kvalitet │ │ │ │ Innstillinger: │ │ Upscale: [2x ▼] │ │ Format: [JPG ▼] │ │ □ Behold original │ │ │ │ Progress: 7/15 (47%) │ │ ████████░░░░░░░░░░ │ │ │ │ ✓ IMG_001.jpg (2.3s) │ │ ✓ IMG_002.jpg (2.1s) │ │ ⏳ IMG_003.jpg... │ │ ⏸ IMG_004.jpg │ │ │ │ Estimert tid: 18 sekunder │ │ │ │ [Avbryt] [Start batch] │ └─────────────────────────────────────┘ Funksjonalitet:

Pause/Resume: Pause batch ved behov Skip: Hopp over problematiske bilder Error handling: Vis feil per bilde, fortsett med resten Notification: Toast ved fullføring

4.4 AI-indikatorer i gallery Badge-system: javascript// På bilde-thumbnails:

<div className="absolute top-2 right-2 flex gap-1">
  {photo.aiAnalyzed && (
    <span className="px-2 py-1 bg-purple-500/80 backdrop-blur rounded-full text-xs">
      🤖 AI
    </span>
  )}
  {photo.enhanced && (
    <span className="px-2 py-1 bg-gold-500/80 backdrop-blur rounded-full text-xs">
      ✨
    </span>
  )}
  {photo.bgRemoved && (
    <span className="px-2 py-1 bg-blue-500/80 backdrop-blur rounded-full text-xs">
      🎭
    </span>
  )}
</div>
```

### **4.5 Smart search med AI-tagger**

```
┌─────────────────────────────────────┐
│  🔍 Søk i PhotoVault                │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ outdoor nature...          🔍│   │
│  └─────────────────────────────┘   │
│                                     │
│  Forslag:                           │
│  💡 outdoor (42)                    │
│  💡 nature (38)                     │
│  💡 tree (25)                       │
│                                     │
│  Populære kategorier:               │
│  [Mennesker] [Natur] [Mat] [Dyr]   │
│                                     │
│  Filtre:                            │
│  ☑ Kun AI-analysert                │
│  ☐ Med ansikter                     │
│  ☐ Forbedret kvalitet               │
└─────────────────────────────────────┘

5. Utvidelser og fremtid
5.1 Fase 2: Generativ AI (6-12 måneder)
Background generation:
javascript// Generer ny bakgrunn basert på prompt
const result = await generateBackground(photoUrl, {
  prompt: "sunset beach scene",
  style: "realistic",
  resolution: "1024x1024"
});
```

**API-integrasjon:**

- **Stable Diffusion** (via Replicate)
- **DALL-E 3** (via OpenAI)
- **Midjourney** (via API når tilgjengelig)

**UI:**

- Prompt-input i AIToolsPanel
- Style presets (realistic, artistic, abstract, etc.)
- Multiple variations

### **5.2 Fase 3: AI-assistent (12+ måneder)**

**Natural language queries:**

```
Bruker: "Finn alle bilder av meg på stranda i fjor sommer"
AI: [Søker etter: person, beach, summer, date:2024-06-01..2024-08-31]
```

**Smart collections:**

```
AI: "Jeg fant 45 bilder fra ferien din i Spania.
     Vil du at jeg skal lage et album?"
```

**Auto-organize:**

```
AI: "Du har 500 uorganiserte bilder.
     Jeg kan sortere dem i 12 albums basert på:
     - Hendelse (bryllup, bursdag, etc.)
     - Sted (hjemme, reise, etc.)
     - Personer (familie, venner, etc.)"
5.3 Fase 4: Avansert metadata (12+ måneder)
EXIF + AI fusion:
javascript{
  // EXIF data
  camera: "iPhone 14 Pro",
  lens: "26mm f/1.78",
  iso: 64,
  shutter: "1/120",

  // AI-generert
  weather: "sunny",
  timeOfDay: "golden hour",
  mood: "happy",
  composition: "rule of thirds",

  // Kombinert innsikt
  suggestion: "Bildet er tatt i gylne time med god komposisjon.
               Vurder å øke kontrast for mer dramatikk."
}
5.4 Fase 5: Social AI features (18+ måneder)
Face recognition (opt-in):
javascript// Gruppere bilder per person
await groupPhotosByPerson(photos);

// Output:
// {
//   "person_1": [photo1, photo5, photo12],
//   "person_2": [photo3, photo7],
//   ...
// }
```

**Smart sharing:**

```
AI: "Jeg fant 15 bilder der Anna er med.
     Vil du dele dem med henne?"
Privacy-first:

Lokal processing (TensorFlow.js)
Opt-in per bruker
Kryptering av face embeddings
Ingen cloud-lagring av identitetsdata


6. Teknisk gjeld og forbedringer
6.1 Umiddelbare forbedringer
Cache-system (aiCache.js):
javascript// Unngå re-analyse av samme bilde
export const cacheKey = (url, operation) => {
  return `ai_${operation}_${hashUrl(url)}`;
};

export const getCached = (key) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const data = JSON.parse(cached);
  if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
    // Expired (7 dager)
    localStorage.removeItem(key);
    return null;
  }

  return data.result;
};
Queue-system (aiQueue.js):
javascriptclass AIQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 1;
    this.delayBetweenRequests = 2000; // 2 sek
  }

  async add(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const { operation, resolve, reject } = this.queue.shift();

    try {
      const result = await operation();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      await new Promise(r => setTimeout(r, this.delayBetweenRequests));
      this.processing = false;
      this.process();
    }
  }
}

export const aiQueue = new AIQueue();
6.2 Performance-optimalisering
Lazy loading av AI-komponenter:
javascriptconst AIToolsPanel = React.lazy(() => import('./components/AIToolsPanel'));
const AIResultsViewer = React.lazy(() => import('./components/AIResultsViewer'));
Web Workers for tung prosessering:
javascript// ai.worker.js
self.addEventListener('message', async (e) => {
  const { operation, data } = e.data;

  if (operation === 'analyze') {
    const result = await analyzeImageInWorker(data);
    self.postMessage({ result });
  }
});
IndexedDB for store resultater:
javascript// Unngå localStorage limit (5-10 MB)
import { openDB } from 'idb';

const db = await openDB('PhotoVaultAI', 1, {
  upgrade(db) {
    db.createObjectStore('aiResults', { keyPath: 'id' });
  }
});

await db.put('aiResults', {
  id: photoId,
  result: largeAnalysisData,
  timestamp: Date.now()
});
6.3 Error handling og resilience
Retry logic:
javascriptasync function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

// Bruk:
const result = await withRetry(() => analyzeImage(url));
Graceful degradation:
javascript// Hvis AI feiler, fortsett uten AI-features
try {
  const analysis = await analyzeImage(url);
  photo.aiTags = analysis.labels;
} catch (error) {
  console.error('AI failed, continuing without tags:', error);
  photo.aiTags = [];
  photo.aiAnalyzedFailed = true;
}

7. Testing og kvalitetssikring
Unit tests:
javascriptdescribe('googleVision', () => {
  test('analyzes image and returns labels', async () => {
    const result = await analyzeImage(mockUrl);
    expect(result.labels).toBeInstanceOf(Array);
    expect(result.labels[0]).toHaveProperty('name');
    expect(result.labels[0]).toHaveProperty('confidence');
  });
});
Integration tests:
javascriptdescribe('AI workflow', () => {
  test('auto-tags on upload', async () => {
    const photo = await uploadPhoto(mockFile);
    await waitFor(() => expect(photo.aiAnalyzed).toBe(true));
    expect(photo.aiTags.length).toBeGreaterThan(0);
  });
});
E2E tests (Playwright):
javascripttest('complete AI enhancement flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="photo-thumbnail"]');
  await page.click('[data-testid="ai-tools-button"]');
  await page.click('[data-testid="enhance-quality"]');
  await expect(page.locator('[data-testid="ai-result"]')).toBeVisible();
  await page.click('[data-testid="save-result"]');
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
});

Dette er en komplett, detaljert plan klar til sammenligning med GPT-5s plan. Strukturen følger eksisterende kode og utvider den logisk med konkrete komponenter, API-flows, og UX-design.
```
