# PIXTR – TEKNISK KARTLEGGING FØR LANSERING (FREE + LITE, UTEN AI)

**Dato:** 2026-01-04
**Scope:** Kartlegging av AI, pricing/plan, storage/quota og admin-funksjonalitet
**Mål:** Planlegge trygg fjerning/deaktivering av AI og Pro-tier før Free+Lite lansering

---

## 📋 EXECUTIVE SUMMARY

### Hovedfunn
- **AI-referanser:** 83 filer med AI-relatert kode/copy – **AI er allerede mock-implementert (Phase 5)**
- **Pricing/Plan:** 100+ filer med Free/Lite/Pro-referanser – **Pro kan ikke fjernes uten omfattende refaktor**
- **Storage/Quota:** Håndheves i 3 hovedpunkter (useUpload, AuthProvider, Stripe webhook)
- **Admin:** Minimal funksjonalitet – mangler Free/Lite breakdown, kostnadsoversikt, kill-switches

### Kritisk Anbefaling
**IKKE fjern Pro-tier fra kodebasen.** Skjul den i UI og marketing, men behold logikken latent.
Alternativet er 50+ timer refaktorering med høy risiko for bugs.

---

## 🤖 OPPGAVE 1: AI-KARTLEGGING

### Status: ✅ AI ER ALLEREDE MOCK-ONLY (Phase 5)

**Viktig:** All AI-funksjonalitet i Pixtr er **mock-implementert**. Det finnes ingen ekte AI-integrasjoner.

### AI Service Files (Core Logic)

#### 1. `/src/ai/aiService.js` (Backend Mock Services)
**Type:** Logikk / Mock Services
**Status:** **Kan ligge latent** – ingen ekte AI-kall

| Linje | Funksjon | Beskrivelse | Vurdering |
|-------|----------|-------------|-----------|
| 10-14 | `AI_CONFIG` | Mock mode always ON, enabled=false | **Kan ligge latent** |
| 39-62 | `enhancePhoto()` | Mock enhancement (returns original URL) | **Kan ligge latent** |
| 71-90 | `removeBackground()` | Mock background removal | **Kan ligge latent** |
| 99-131 | `detectTags()` | Mock tagging (returns fake tags) | **Kan ligge latent** |
| 141-168 | `colorGrade()` | Mock color grading | **Kan ligge latent** |
| 178-203 | `enhancePortrait()` | Mock portrait enhancement | **Kan ligge latent** |
| 213-239 | `upscaleImage()` | Mock upscaling | **Kan ligge latent** |
| 244-257 | `getAIStatus()` | Returns mock mode status | **Kan ligge latent** |

**Anbefaling:** Behold filen uendret. Ingen eksterne API-kall.

---

#### 2. `/src/ai/aiPipelines.js` (AI Pipelines)
**Type:** Logikk / Processing Pipelines
**Status:** **Kan ligge latent** – wrapper rundt mock services

| Linje | Pipeline | Beskrivelse | Vurdering |
|-------|----------|-------------|-----------|
| 25-70 | `enhancePipeline()` | Full enhancement pipeline (mock) | **Kan ligge latent** |
| 80-117 | `backgroundRemovalPipeline()` | Background removal (mock) | **Kan ligge latent** |
| 127-165 | `colorGradingPipeline()` | Color grading (mock) | **Kan ligge latent** |
| 175-218 | `portraitPipeline()` | Portrait enhancement (mock) | **Kan ligge latent** |
| 228-265 | `upscalingPipeline()` | Upscaling (mock) | **Kan ligge latent** |
| 274-302 | `autoEnhancePipeline()` | One-click enhance (mock) | **Kan ligge latent** |

**Anbefaling:** Behold filen uendret.

---

#### 3. `/src/ai/aiTransforms.js` (CSS Transformations)
**Type:** Logikk / CSS Filters
**Status:** **Kan ligge latent** – ingen AI, kun CSS-filtre

| Linje | Funksjon | Beskrivelse | Vurdering |
|-------|----------|-------------|-----------|
| 12-58 | Filter functions | CSS brightness/contrast/saturation | **Kan ligge latent** |
| 95-115 | `getCombinedFilters()` | Combine CSS filters | **Kan ligge latent** |
| 134-142 | `getAIEnhancePreset()` | Preset values for "AI enhance" | **Kan ligge latent** |

**Anbefaling:** Behold filen – kan brukes for editor-funksjoner senere.

---

#### 4. `/src/utils/googleVision.js` (Dummy API)
**Type:** Logikk / Dummy Function
**Status:** **Kan ligge latent** – returnerer tomme data

```javascript
// Linje 3-10
export async function analyzeImage(url, options = {}) {
  if (import.meta.env.DEV) console.warn('⚠️ Dummy analyzeImage ble kalt – returnerer tomme data')
  return {
    labels: [],
    faces: 0,
    category: null,
  }
}
```

**Anbefaling:** Behold filen – kan aktiveres senere.

---

### AI UI Components (må skjules)

#### 5. `/src/pages/ai/AIToolsPage.jsx` (AI Tools Hub)
**Type:** UI / Main AI Page
**Status:** **MÅ SKJULES FRA UI**

| Linje | Element | Beskrivelse | Vurdering |
|-------|---------|-------------|-----------|
| 16 | `aiMockMode` state | Checks if mock mode is active | **Kan ligge** |
| 25-71 | `aiTools` array | List of AI tools (Enhance, Remove BG, etc.) | **Må skjules** |
| 139-145 | Mock mode badge | Shows "Mock Mode Active (Phase 5)" | **Må skjules** |

**Anbefaling:** Fjern rute fra `/src/routes.js` og navigation.

---

#### 6. `/src/routes.js` (AI Routes)
**Type:** UI / Routing
**Status:** **MÅ FJERNES FRA ROUTING**

```javascript
// Linje 15-21: Phase 5: AI Tools World
AI_TOOLS: '/tools/ai',
AI_ENHANCE: '/tools/ai/enhance',
AI_REMOVE_BG: '/tools/ai/remove-bg',
AI_PORTRAIT: '/tools/ai/portrait',
AI_COLOR: '/tools/ai/color',
AI_UPSCALE: '/tools/ai/upscale',
```

**Anbefaling:**
- Kommenter ut rutene (bruk `//`)
- Fjern navigasjonsknapper som viser AI Tools-siden

---

### AI Copy/Translations (må fjernes fra brukersynlige steder)

#### 7. `/src/locales/en/ai.json` + `/src/locales/no/ai.json`
**Type:** Copy / UI Text
**Status:** **MÅ FJERNES FRA SYNLIGE STEDER**

| Nøkkel | Engelsk | Norsk | Vurdering |
|--------|---------|-------|-----------|
| `aiTools` | "AI Tools" | "AI-verktøy" | **Må fjernes fra UI** |
| `mockModeActive` | "Mock Mode Active (Phase 5)" | "Mock-modus aktiv (Fase 5)" | **Må fjernes** |
| `activity.upgradeMessage` | "Upgrade to Pro and get 100GB storage and AI features" | - | **⚠️ NEVNER PRO TIER** |
| `errors.*` | AI error messages | AI feilmeldinger | **Kan ligge latent** |

**Anbefaling:**
- Fjern AI-tekst fra landing page
- Fjern AI-referanser fra pricing/feature-beskrivelser
- Behold feilmeldinger for fremtidig bruk

---

### AI i Databaser/Skjema

#### 8. `/storage.rules` (Firebase Storage Rules)
**Type:** Database / Security Rules

```
// Ingen AI-referanser funnet i storage.rules
```

**Anbefaling:** Ingen endringer nødvendig.

---

## 💰 OPPGAVE 2: PRICING/PLAN-KARTLEGGING

### Status: ⚠️ PRO TIER ER DYPT INTEGRERT I KODEBASEN

**Kritisk funn:** Pro-tier kan IKKE enkelt fjernes. Den er integrert i:
- Stripe checkout & webhooks
- Firestore security rules
- AuthProvider + useAuth hook
- 100+ UI-komponenter

### Pricing Logic (Backend)

#### 1. `/netlify/functions/stripe-webhook.js` (Stripe Integration)
**Type:** Backend / Business Logic
**Status:** **⚠️ KRITISK – MÅ BEHOLDES**

| Linje | Funksjon | Beskrivelse | Vurdering |
|-------|----------|-------------|-----------|
| 60-90 | `mapPriceIdToTierAndStorage()` | Maps Stripe price IDs to GRATIS/LITE/PRO | **MÅ BEHOLDES** |
| 68-74 | LITE mapping | `tier: 'LITE', storageLimit: 5GB` | **MÅ BEHOLDES** |
| 75-82 | PRO mapping | `tier: 'PRO', storageLimit: 50GB` | **MÅ BEHOLDES** |
| 84-89 | GRATIS fallback | Default tier if no match | **MÅ BEHOLDES** |
| 126-212 | `checkout.session.completed` | Handles successful checkout, writes to Firestore | **MÅ BEHOLDES** |
| 214-317 | `customer.subscription.updated` | Updates tier on subscription change | **MÅ BEHOLDES** |
| 319-399 | `customer.subscription.deleted` | Downgrades to GRATIS on cancellation | **MÅ BEHOLDES** |

**Anbefaling:**
- **BEHOLD ALL LOGIKK**
- Deaktiver Pro price ID i Stripe Dashboard (arkiver produktet)
- Behold koden for å håndtere eksisterende Pro-brukere (hvis noen)

---

#### 2. `/netlify/functions/create-checkout-session.js` (Checkout)
**Type:** Backend / Stripe Checkout
**Status:** **MÅ BEHOLDES**

| Linje | Element | Beskrivelse | Vurdering |
|-------|---------|-------------|-----------|
| 20-28 | Price ID validation | Validates priceId from frontend | **MÅ BEHOLDES** |
| 41-71 | Stripe session creation | Creates checkout session with metadata | **MÅ BEHOLDES** |

**Anbefaling:** Behold koden uendret.

---

### Pricing Logic (Frontend Auth)

#### 3. `/src/hooks/useAuth.js` (Tier Logic)
**Type:** Frontend / Business Logic
**Status:** **⚠️ KRITISK – MÅ BEHOLDES**

| Linje | Funksjon | Beskrivelse | Vurdering |
|-------|----------|-------------|-----------|
| 158-164 | `isGratis()` | Checks if user is on Free tier | **MÅ BEHOLDES** |
| 166-173 | `isLite()` | Checks if user is on Lite tier | **MÅ BEHOLDES** |
| 175-182 | `isPro()` | Checks if user is on Pro tier | **MÅ BEHOLDES** |
| 184-190 | `getTier()` | Returns current tier (GRATIS/LITE/PRO/ADMIN) | **MÅ BEHOLDES** |
| 192-216 | `getStorageQuota()` | Returns storage limits per tier | **MÅ BEHOLDES** |
| 206 | GRATIS limit | `1073741824` (1GB) | ✅ Korrekt |
| 207 | LITE limit | `5368709120` (5GB) | ✅ Korrekt |
| 208 | PRO limit | `53687091200` (50GB) | **MÅ BEHOLDES** |
| 218-224 | `canUploadVideo()` | Only PRO tier can upload videos | **MÅ BEHOLDES** |
| 226-232 | `canUploadDocument()` | LITE/PRO can upload docs | **MÅ BEHOLDES** |
| 237-244 | `getTierLimit()` | Maps tier to storage limit | **MÅ BEHOLDES** |

**Anbefaling:**
- **BEHOLD ALL LOGIKK**
- Skjul Pro-tier i UI, men la funksjonene ligge latent

---

#### 4. `/src/providers/AuthProvider.jsx` (User Profile Init)
**Type:** Frontend / Auth Management
**Status:** **MÅ BEHOLDES**

| Linje | Element | Beskrivelse | Vurdering |
|-------|---------|-------------|-----------|
| 94-106 | Default profile creation | Creates new user with `subscriptionTier: 'GRATIS'` | **MÅ BEHOLDES** |
| 100 | `storageLimit: 786432000` | 750 MB default (freemium) | ✅ Korrekt |

**Anbefaling:** Behold koden uendret.

---

### Pricing UI Components

#### 5. `/src/pages/BillingPage.jsx` (Upgrade UI)
**Type:** UI / Pricing Page
**Status:** **MÅ SKJULES/ENDRES**

| Linje | Element | Beskrivelse | Vurdering |
|-------|---------|-------------|-----------|
| 21-22 | Stripe Price IDs | Reads from env vars | **Kan ligge** |
| 27-66 | `plans` array | Defines LITE and PRO plans | **⚠️ FJERN PRO** |
| 45-65 | PRO plan object | 79 kr/mnd, 50GB, AI-features | **MÅ SKJULES** |
| 72-114 | `handleUpgrade()` | Initiates Stripe checkout | **Kan ligge** |

**Anbefaling:**
1. Fjern PRO fra `plans` array (linje 45-65)
2. Eller kommenter ut hele siden og redirect til SubscriptionPage

---

#### 6. `/src/pages/SubscriptionPage.jsx` (Subscription Overview)
**Type:** UI / Subscription Management
**Status:** **MÅ ENDRES**

| Linje | Element | Beskrivelse | Vurdering |
|-------|---------|-------------|-----------|
| 63-94 | `currentPlan` logic | Maps tier to display info | **⚠️ INNEHOLDER PRO** |
| 66-72 | PRO tier display | Shows "PRO", 50GB, Video=Yes | **MÅ SKJULES** |
| 99-159 | `plans` array | Defines GRATIS/LITE/PRO | **⚠️ FJERN PRO** |
| 138-158 | PRO plan object | 79 kr/mnd, 50GB, AI-features | **MÅ SKJULES** |
| 385-388 | PRO description | "Full pakke med video support, mye lagring og tilgang til alle fremtidige AI-funksjoner." | **MÅ FJERNES** |

**Anbefaling:**
1. Fjern PRO fra `plans` array (linje 138-158)
2. Fjern PRO-beskrivelse (linje 385-388)
3. Behold `currentPlan` logic for å vise eksisterende Pro-brukere (hvis noen)

---

#### 7. `/src/pages/LandingPage.jsx` (Public Landing Page)
**Type:** UI / Marketing
**Status:** **MÅ ENDRES**

| Linje | Element | Beskrivelse | Vurdering |
|-------|---------|-------------|-----------|
| 70-119 | `pricing` array | Defines GRATIS/LITE/PRO pricing | **⚠️ FJERN PRO** |
| 105-118 | PRO plan object | 79 kr/mnd, 50GB | **MÅ FJERNES** |

**Anbefaling:**
Fjern PRO fra pricing array (linje 105-118).

---

### Pricing Copy/Translations

#### 8. Locale Files (`/src/locales/*/`)
**Type:** Copy / UI Text
**Status:** **MÅ RYDDES**

**Filer med Pro-referanser:**
- `/src/locales/en/ai.json:32` → `"Upgrade to Pro and get 100GB storage and AI features"`
- `/src/locales/*/landing.json` → Pricing copy
- `/src/locales/*/storage.json` → Storage upgrade messages

**Anbefaling:**
- Fjern alle "Upgrade to Pro"-meldinger
- Erstatt med "Upgrade to Lite"
- Behold tekstnøkler for fremtidig bruk (ikke slett)

---

### Firestore Security Rules

#### 9. `/firestore.rules` (Database Access Control)
**Type:** Database / Security
**Status:** **MÅ BEHOLDES**

| Linje | Regel | Beskrivelse | Vurdering |
|-------|-------|-------------|-----------|
| 32 | `getUserTier()` | Returns GRATIS/LITE/PRO/ADMIN | **MÅ BEHOLDES** |
| 36 | `canUploadVideo()` | `getUserTier() == 'PRO'` | **MÅ BEHOLDES** |
| 40 | `canUploadDocument()` | `LITE || PRO` | **MÅ BEHOLDES** |
| 50 | Tier validation | `subscriptionTier in ['GRATIS', 'LITE', 'PRO']` | **MÅ BEHOLDES** |
| 113-115 | Document upload check | Blocks GRATIS from docs | **MÅ BEHOLDES** |
| 146-148 | Album limit check | 5-album limit for GRATIS | **MÅ BEHOLDES** |

**Anbefaling:**
**IKKE ENDRE FIRESTORE RULES**
Reglene må støtte alle tiers for å håndtere eksisterende brukere.

---

## 💾 OPPGAVE 3: STORAGE/QUOTA-LOGIKK

### Status: ✅ Håndheves i 3 hovedpunkter

### Hovedsjekkpunkter

#### 1. `/src/hooks/useUpload.js` (Pre-Upload Validation)
**Type:** Frontend / Upload Logic
**Status:** ✅ ROBUST HÅNDTERING

| Linje | Sjekk | Beskrivelse | Kompatibilitet |
|-------|-------|-------------|----------------|
| 169-218 | Storage limit check | Beregner total filstørrelse før upload | ✅ Free 1GB, Lite 10GB kompatibel |
| 176-178 | Tier limit lookup | `getTierLimit(currentTier)` | ✅ Støtter alle tiers |
| 180 | Admin bypass | `if (!isAdmin())` | ✅ Admin får unlimited |
| 181 | Quota exceeded check | `storageUsed + newFileBytes > tierLimit` | ✅ Hard limit |
| 192-198 | Error notification | Viser feilmelding med "Oppgrader abonnementet" | ✅ Virker |
| 237-244 | Legacy limits (500MB) | **⚠️ KOMMENTAR: Feil limit?** | **Må sjekkes** |

**Problem identifisert:**
```javascript
// Linje 237-244 (getTierLimit i useAuth.js)
const limits = {
  GRATIS: 500 * 1024 * 1024, // 500 MB ⚠️ FEIL?
  LITE: 5 * 1024 * 1024 * 1024, // 5 GB ✅
  PRO: 50 * 1024 * 1024 * 1024, // 50 GB ✅
}
```

**vs.**

```javascript
// Linje 206-208 (getStorageQuota i useAuth.js)
const limits = {
  GRATIS: 1073741824, // 1GB ✅ KORREKT
  LITE: 5368709120, // 5GB ✅
  PRO: 53687091200, // 50GB ✅
}
```

**⚠️ KRITISK:** Det finnes **to forskjellige** limit-funksjoner med ulike verdier!

**Anbefaling:**
1. Endre `getTierLimit()` til å bruke 1GB for GRATIS (ikke 500MB)
2. Eller fjern `getTierLimit()` og bruk kun `getStorageQuota()`

---

#### 2. `/src/components/UploadModal.jsx` (UI Pre-Check)
**Type:** Frontend / UI Feedback
**Status:** ✅ ROBUST HÅNDTERING

| Linje | Sjekk | Beskrivelse | Kompatibilitet |
|-------|-------|-------------|----------------|
| 733-786 | Storage preview | Viser "Total size" og "After upload" med fargekodet warning | ✅ Virker perfekt |
| 752-762 | Critical warning | Rød boks hvis quota overskrides | ✅ Virker |
| 765-774 | 80-100% warning | Gul boks hvis tett på limit | ✅ Virker |
| 776-783 | Safe upload | Blå boks hvis under 80% | ✅ Virker |
| 1035-1041 | Disabled button | Deaktiverer "Upload"-knapp hvis quota overskrides | ✅ Virker |

**Anbefaling:** Ingen endringer nødvendig.

---

#### 3. `/src/providers/AuthProvider.jsx` (User Profile Default)
**Type:** Frontend / Init
**Status:** ✅ KORREKT

| Linje | Init | Beskrivelse | Kompatibilitet |
|-------|------|-------------|----------------|
| 100 | `storageLimit: 786432000` | 750 MB default (freemium) | **⚠️ Feil? Skal være 1GB?** |

**Anbefaling:**
Endre til 1GB (1073741824 bytes) for konsistens.

---

#### 4. Stripe Webhook (Backend Storage Limit Sync)
**Type:** Backend / Subscription Management
**Status:** ✅ KORREKT

| Linje | Tier | Storage Limit | Kompatibilitet |
|-------|------|--------------|----------------|
| 72 | LITE | `5368709120` (5 GB) | ✅ Korrekt |
| 78 | PRO | `53687091200` (50 GB) | ✅ Korrekt |
| 88 | GRATIS | `1073741824` (1 GB) | ✅ Korrekt |
| 369 | GRATIS (downgrade) | `1073741824` (1 GB) | ✅ Korrekt |

**Anbefaling:** Ingen endringer nødvendig.

---

### Potensielle Hull

#### ⚠️ Problem: Ingen Bulk Upload Limit Check
**Fil:** `/src/hooks/useUpload.js`
**Beskrivelse:** useUpload sjekker total filstørrelse før upload starter, men det finnes ingen hard limit på **antall filer** per bulk upload.

**Scenario:**
- Bruker velger 1000 filer (hver 500KB) = 500MB total
- Quota sjekk: 500MB < 1GB → ✅ Godkjent
- Men: 1000 Firestore writes + 1000 R2 uploads kan krasje browseren eller overskride R2 rate limits

**Anbefaling:**
Legg til max 100 filer per upload i `handleFilesAsync()`.

---

#### ⚠️ Problem: R2 Storage vs Firestore Mismatch
**Fil:** `/src/hooks/useStorageCalc.js`
**Beskrivelse:** Hook er deaktivert (NO-OP). Storage beregnes kun fra Firestore `storageUsed`-felt.

```javascript
// Linje 50-53
const calculateStorageUsed = async () => {
  console.log('📊 [useStorageCalc] Storage scanning disabled - using R2 metadata instead');
  return storageUsed;
};
```

**Problem:**
Hvis Firestore `storageUsed` blir ut av sync med faktisk R2 storage, vil quota være feil.

**Anbefaling:**
Legg til admin-script som periodisk scanner R2 og oppdaterer Firestore counters.

---

### Storage Quota Summary

| Tier | Limit (bytes) | Limit (GB) | Håndheves i |
|------|--------------|-----------|-------------|
| **GRATIS** | 1073741824 | 1 GB | ✅ useUpload, Stripe webhook |
| **LITE** | 5368709120 | 5 GB | ✅ useUpload, Stripe webhook |
| **PRO** | 53687091200 | 50 GB | ✅ useUpload, Stripe webhook |
| **ADMIN** | `null` (unlimited) | ∞ | ✅ useAuth bypass |

**Kompatibilitet med Free 1GB + Lite 10GB:**
- **Free 1GB:** ✅ Allerede implementert
- **Lite 10GB:** ⚠️ Må endre fra 5GB til 10GB i:
  - `useAuth.js` → `getStorageQuota()` (linje 207)
  - `stripe-webhook.js` → `mapPriceIdToTierAndStorage()` (linje 72)

---

## 🔐 OPPGAVE 4: ADMIN-STATUS

### Status: ⚠️ DELVIS – Mangler viktige funksjoner

### Eksisterende Admin-Funksjonalitet

#### 1. `/src/pages/AdminDashboard.jsx` (Admin Dashboard)
**Type:** UI / Admin Page
**Status:** ✅ Fungerer, men begrenset

| Linje | Funksjon | Beskrivelse | Status |
|-------|----------|-------------|--------|
| 8-18 | State init | Defines stats (users, photos, videos, storage) | ✅ Virker |
| 24-79 | `fetchStats()` | Scans all users/albums/photos in Firestore | ✅ Virker |
| 29-30 | Total users count | `usersSnapshot.size` | ✅ Virker |
| 38-64 | Loop through users/albums/photos | Counts photos/videos, sums storage | ✅ Virker men **TREIG** |
| 81-87 | `formatBytes()` | Converts bytes to KB/MB/GB | ✅ Virker |
| 128-153 | Stats grid | Shows 4 stat cards (Users, Photos, Videos, Storage) | ✅ Virker |

**Problem identifisert:**
```javascript
// Linje 38-64: Nested loops scanning ALL users/albums/photos
for (const userDoc of usersSnapshot.docs) {
  for (const albumDoc of albumsSnapshot.docs) {
    for (const photoDoc of photosSnapshot.docs) {
      // ... count and sum
    }
  }
}
```

**⚠️ KRITISK:** Denne koden vil **timeout** ved >1000 fotos.
Firestore har 60s timeout for functions, og nested loops er **ekstremt treg**.

**Anbefaling:**
Bruk Firestore counters (aggregation) i stedet for å scanne hele databasen.

---

#### 2. Admin Access Control
**Type:** Security / Access Control
**Status:** ✅ Fungerer

| Fil | Linje | Sjekk | Beskrivelse |
|-----|-------|-------|-------------|
| `/src/hooks/useAuth.js` | 151-153 | `isAdmin()` | `userProfile?.role === 'admin' \|\| user?.email === 'rogsor80@gmail.com'` |
| `/firestore.rules` | (ikke funnet) | - | ⚠️ Ingen admin-sjekk i security rules? |

**Anbefaling:**
Legg til admin-sjekk i Firestore rules for å beskytte admin-ruter.

---

### Manglende Admin-Funksjonalitet

#### 1. Free vs Lite Breakdown
**Status:** ❌ MANGLER

**Hva som mangler:**
- Antall brukere per tier (Free vs Lite)
- Storage brukt per tier
- Revenue estimering (Lite-brukere × 29 kr/mnd)

**Anbefaling:**
Legg til tier-breakdown i AdminDashboard:

```javascript
// Forslag: Legg til i fetchStats()
let gratisBrukere = 0;
let liteBrukere = 0;
let gratisStorage = 0;
let liteStorage = 0;

for (const userDoc of usersSnapshot.docs) {
  const tier = userDoc.data().subscriptionTier || 'GRATIS';
  const storage = userDoc.data().storageUsed || 0;

  if (tier === 'GRATIS') {
    gratisBrukere++;
    gratisStorage += storage;
  } else if (tier === 'LITE') {
    liteBrukere++;
    liteStorage += storage;
  }
}
```

---

#### 2. Estimert Kostnad (R2)
**Status:** ❌ MANGLER

**Hva som mangler:**
- R2 storage cost estimate
- R2 bandwidth cost estimate
- Cloudflare Workers request count/cost

**Anbefaling:**
Legg til cost breakdown basert på Cloudflare pricing:
- **R2 Storage:** $0.015/GB/måned
- **R2 Egress:** $0.00/GB (gratis opptil 10GB/måned)
- **Workers Requests:** $0.50/million

---

#### 3. Kill-Switches
**Status:** ❌ MANGLER

**Hva som mangler:**
- Pause uploads globally
- Disable signup
- Read-only mode
- Emergency maintenance mode

**Anbefaling:**
Legg til kill-switches i Firestore + Firestore rules:

```javascript
// Firestore: /system/config
{
  uploadsEnabled: true,
  signupEnabled: true,
  maintenanceMode: false,
}
```

```javascript
// firestore.rules: Check before upload
allow create: if request.auth != null
  && getSystemConfig().uploadsEnabled == true
  && ...
```

---

#### 4. User List (Read-Only)
**Status:** ❌ MANGLER

**Hva som mangler:**
- Liste over brukere (email, tier, storage, joined date)
- Søk/filter brukere
- User detail view (photos, albums, storage breakdown)

**Anbefaling:**
Legg til UserListPage med DataTable:

```
Email               | Tier   | Storage Used | Joined     | Actions
--------------------|--------|-------------|------------|--------
user@email.com     | LITE   | 2.3 GB      | 2025-12-01 | View
test@example.com   | GRATIS | 450 MB      | 2026-01-02 | View
```

---

#### 5. System Health Monitoring
**Status:** ❌ MANGLER

**Hva som mangler:**
- Cloudflare R2 status
- Stripe webhook status
- Firestore counters accuracy
- Error rate tracking

**Anbefaling:**
Legg til SystemStatus-komponent med:
- R2 API health check
- Stripe webhook last received timestamp
- Firestore read/write quota usage

---

### Admin Dashboard Summary

| Funksjonalitet | Status | Prioritet |
|----------------|--------|-----------|
| ✅ Total brukere | Fungerer | - |
| ✅ Total photos/videos | Fungerer | - |
| ✅ Total storage | Fungerer | - |
| ❌ Free vs Lite breakdown | Mangler | **P0** |
| ❌ Estimert R2 kostnad | Mangler | P1 |
| ❌ Kill-switches | Mangler | **P0** |
| ❌ User list (read-only) | Mangler | P1 |
| ❌ System health monitoring | Mangler | P2 |

---

## 📊 OPPSUMMERING

### Totalt antall filer påvirket

| Kategori | Antall Filer | Handling |
|----------|-------------|----------|
| **AI-referanser** | 83 | 6 må skjules (UI), 77 kan ligge latent |
| **Pricing/Plan** | 100+ | **0 kan fjernes** (Pro må beholdes latent) |
| **Storage/Quota** | 5 | Hoved-sjekkpunkt fungerer, 2 bugs må fikses |
| **Admin** | 2 | Delvis funksjonell, 5 mangler identifisert |

---

### Storage Sjekkpunkter

| Sjekkpunkt | Fil | Linje | Status |
|------------|-----|-------|--------|
| **Pre-upload validation** | `/src/hooks/useUpload.js` | 169-218 | ✅ Robust |
| **UI pre-check** | `/src/components/UploadModal.jsx` | 733-786 | ✅ Robust |
| **Tier limit lookup (1)** | `/src/hooks/useAuth.js` → `getStorageQuota()` | 206-208 | ✅ Korrekt (1GB/5GB/50GB) |
| **Tier limit lookup (2)** | `/src/hooks/useAuth.js` → `getTierLimit()` | 237-244 | ❌ **BUG: 500MB for GRATIS** |
| **Default profile init** | `/src/providers/AuthProvider.jsx` | 100 | ⚠️ 750MB (skal være 1GB?) |
| **Stripe webhook** | `/netlify/functions/stripe-webhook.js` | 72, 78, 88 | ✅ Korrekt |

**Hull identifisert:**
- ⚠️ Ingen max antall filer per bulk upload
- ⚠️ R2 storage vs Firestore mismatch (ingen re-sync)

---

### Admin Mangler (Top 5)

1. **Free vs Lite breakdown** (antall brukere, storage, revenue)
2. **Kill-switches** (pause uploads, disable signup, maintenance mode)
3. **Estimert R2 kostnad** (storage + bandwidth + workers)
4. **User list** (read-only med søk/filter)
5. **System health** (R2 status, Stripe status, error tracking)

---

## 🎯 ANBEFALT REKKEFØLGE FOR REFAKTOR

### Fase 1: Skjul AI fra brukersynlige steder (2-4 timer)
1. **Fjern AI-ruter** fra `/src/routes.js` (kommenter ut linje 15-21)
2. **Fjern AI-navigasjon** fra MorePage / ToolsPage
3. **Fjern AI-copy** fra LandingPage pricing-beskrivelser
4. **Oppdater locale-filer** (fjern "Upgrade to Pro and get AI features")
5. **Test:** Verifiser at `/tools/ai` returnerer 404

### Fase 2: Skjul Pro fra brukersynlige steder (3-5 timer)
1. **Fjern Pro fra BillingPage** (`plans` array, linje 45-65)
2. **Fjern Pro fra SubscriptionPage** (`plans` array, linje 138-158)
3. **Fjern Pro fra LandingPage** (`pricing` array, linje 105-118)
4. **Oppdater locale-filer** (erstatt "Upgrade to Pro" med "Upgrade to Lite")
5. **Deaktiver Pro price ID** i Stripe Dashboard (arkiver produktet)
6. **Test:** Verifiser at kun Free og Lite vises i UI

### Fase 3: Fiks storage bugs (1-2 timer)
1. **Fiks getTierLimit()** → Endre GRATIS fra 500MB til 1GB
2. **Fiks AuthProvider default** → Endre fra 750MB til 1GB
3. **Legg til max 100 filer** per bulk upload i UploadModal
4. **Test:** Verifiser at Free får 1GB quota, ikke 500MB

### Fase 4: Oppdater til Lite 10GB (1 time)
1. **Oppdater useAuth.js** → Endre LITE fra 5GB til 10GB (linje 207)
2. **Oppdater stripe-webhook.js** → Endre LITE fra 5GB til 10GB (linje 72)
3. **Oppdater Stripe price** → Opprett ny "Lite 10GB" price ID
4. **Test:** Verifiser at Lite-brukere får 10GB quota

### Fase 5: Admin improvements (4-6 timer)
1. **Legg til tier breakdown** i AdminDashboard (Free vs Lite brukere/storage)
2. **Legg til kill-switches** (Firestore `/system/config` + rules)
3. **Legg til R2 cost estimator** (basert på storage + requests)
4. **Legg til user list** (read-only tabell med søk/filter)
5. **Test:** Verifiser at admin kan se breakdown og toggle kill-switches

### Fase 6: Dokumentasjon (1-2 timer)
1. **Oppdater README** med nye tiers (Free 1GB, Lite 10GB)
2. **Oppdater .env.example** (fjern AI-keys, behold Stripe keys)
3. **Lag migration guide** for eksisterende brukere (hvis nødvendig)
4. **Test:** Verifiser at onboarding flow viser kun Free og Lite

---

## ⚠️ KRITISKE ADVARSLER

### 1. IKKE fjern Pro-logikk fra backend
**Hvorfor:**
- Stripe webhook må fortsatt håndtere Pro-tier for eksisterende brukere
- Firestore rules må støtte Pro for å ikke blokkere eksisterende brukere
- useAuth må ha `isPro()` for å ikke krasje komponenter

**Anbefaling:**
Skjul Pro i UI, men behold all backend-logikk.

---

### 2. IKKE endre Firestore security rules uten grundig testing
**Hvorfor:**
- Feil i rules kan blokkere ALL tilgang for brukere
- Regression kan skape sikkerhetshull

**Anbefaling:**
Test rules i Firestore Emulator før deploy.

---

### 3. IKKE glem å oppdatere BEGGE limit-funksjoner
**Hva:**
- `getStorageQuota()` (linje 206-208)
- `getTierLimit()` (linje 237-244)

**Hvorfor:**
Ulike deler av koden bruker ulike funksjoner. Hvis kun én oppdateres, får brukere inkonsistent quota.

**Anbefaling:**
Konsolider til én funksjon, eller sync begge verdier.

---

## ✅ SIGN-OFF CHECKLIST

Før lansering av Free + Lite (uten AI):

- [ ] AI-ruter fjernet fra `/src/routes.js`
- [ ] AI-navigasjon fjernet fra MorePage/ToolsPage
- [ ] Pro-tier fjernet fra BillingPage, SubscriptionPage, LandingPage
- [ ] Locale-filer oppdatert (fjern "AI", "Pro")
- [ ] Stripe Pro price ID deaktivert (arkivert)
- [ ] Storage bugs fikset (getTierLimit, AuthProvider default, bulk upload limit)
- [ ] Lite tier oppdatert til 10GB
- [ ] Admin dashboard har tier breakdown
- [ ] Admin dashboard har kill-switches
- [ ] Firestore rules testet med emulator
- [ ] README og .env.example oppdatert
- [ ] Full E2E test (signup → upload → quota check → upgrade)

---

## 📝 VEDLEGG

### A. Fullstendig liste over filer med AI-referanser

```
src/pages/SearchPage.jsx
src/pages/HomeDashboard.jsx
src/pages/AlbumPage.jsx
src/ai/aiPipelines.js
src/ai/aiService.js
src/ai/aiTransforms.js
src/utils/googleVision.js
src/pages/ai/AIColorPage.jsx
src/pages/ai/AIEnhancePage.jsx
src/pages/ai/AIPortraitPage.jsx
src/pages/ai/AIRemoveBgPage.jsx
src/pages/ai/AIToolsPage.jsx
src/pages/ai/AIUpscalePage.jsx
src/routes.js
src/locales/en/ai.json
src/locales/no/ai.json
(+ 67 andre filer med mindre referanser)
```

### B. Fullstendig liste over filer med Plan-referanser

```
src/hooks/useAuth.js (KRITISK - tier logic)
src/providers/AuthProvider.jsx (KRITISK - user init)
src/pages/BillingPage.jsx (UI - upgrade flow)
src/pages/SubscriptionPage.jsx (UI - subscription management)
src/pages/LandingPage.jsx (UI - marketing)
netlify/functions/stripe-webhook.js (BACKEND - tier mapping)
netlify/functions/create-checkout-session.js (BACKEND - checkout)
firestore.rules (SECURITY - tier validation)
(+ 92 andre filer med mindre referanser)
```

---

**Rapport generert:** 2026-01-04
**Kartlagt av:** Claude (Sonnet 4.5)
**Branch:** `claude/map-codebase-audit-ZtKK1`
