# 🧠 PhotoVault – AI-Fase Masterplan (Kombinert Claude + GPT-5)

**Versjon:** v1.0  **Periode:** Q4 2025 – Q2 2026  

---

## ⚙️ Fase 4.0 – Grunnstruktur og aktivering

**Mål:**  
Aktivere eksisterende AI-arkitektur i appen uten å bygge nytt. Forberede dataflyt, nøkkelhåndtering og server-proxy.

**Tiltak:**  
1. **Valider eksisterende filer**  
   - `AIToolsPanel.jsx`, `AISettingsPage.jsx`, `AILogPanel.jsx`, `googleVision.js`, `picsartAI.js`, `picsartClient.js`, `aiEnhance.js`, `aiSort.js`.  
2. **Legg til brukerplan-sjekk**  
   ```js
   export function getAIAuth(user, plan, key) {
     return plan === "pro" ? { mode:"server" } : { mode:"client", apiKey:key };
   }
   ```  
3. **Opprett Firestore-felt**  
   ```json
   photos/{id}: {
     aiTags:[], faces:0, category:null,
     enhanced:false, bgRemoved:false, aiAnalyzed:false
   }
   users/{uid}: { isPro:false, aiKeys:{ vision:null, picsart:null } }
   ```  
4. **Installer backend-proxy (Firebase Functions)**  
   - `/ai/picsart/remove-bg`  
   - `/ai/picsart/enhance`  
   - `/ai/vision/analyze`  

**Resultat:**  
Appen kan gjøre API-kall via bruker- eller servernøkkel, og Firestore-strukturen er klar.

---

## 🎨 Fase 4.1 – Auto-Tagging og Analyse (Gratis)

**Mål:**  
Implementere Google Vision-drevet automatisk tagging ved opplasting og søk.

**Tiltak:**  
1. **Integrer i `UploadModal`**  
   - Etter vellykket opplasting → kall `analyzeImage(url)` fra `googleVision.js`.  
2. **Oppdater Firestore:**  
   ```json
   aiTags:["nature","outdoor"], faces:2, category:"people", aiAnalyzed:true
   ```  
3. **Vis i UI:**  
   - Badge 🤖 på thumbnails (`aiAnalyzed` true).  
   - Ny “AI-tagger”-seksjon i `PhotoModal`.  
4. **Opprett `SmartSearch.jsx`**  
   - Søker i `aiTags`.  
   - Filtrering etter “Kun AI-analysert / Med ansikter / Kategori”.

**Visuelt:**  
Purple-tema (#9333EA), loading-spinner under opplasting, toast “AI-analyse fullført”.

**Resultat:**  
Gratis-brukere får automatisk tagging og AI-søk uten serverkostnader.

---

## ✂️ Fase 4.2 – Bakgrunnsfjerning (Pro)

**Mål:**  
Legge til Picsart API for fjern bakgrunn via proxy.

**Tiltak:**  
1. **Frontend:**  
   - Knapp “🎭 Fjern bakgrunn” i `AIToolsPanel`.  
   - Loader → kall `removeBackground(photo.url)` via proxy.  
2. **Backend (functions):**  
   ```js
   exports.picsartRemoveBg = functions.https.onCall(async (data, ctx) => {
     const res = await fetch("https://api.picsart.io/tools/removebg", {
       method:"POST",
       headers:{ "x-picsart-api-key":functions.config().picsart.key,
                 "Content-Type":"application/json" },
       body:JSON.stringify({ image_url:data.url })
     });
     const r=await res.json();
     return { url:r.data.url };
   });
   ```  
3. **Lagring:** `noBgUrl` + `bgRemovedAt` i Firestore.  
4. **Visuelt:**  
   - Før/etter-visning (`AIResultsViewer.jsx`).  
   - “Save ✓ / Download”-knapper.  
   - Gull-gradient for Pro.

**Resultat:**  
Pro-brukere kan fjerne bakgrunn direkte i appen med før/etter-visning.

---

## ✨ Fase 4.3 – Bildeforbedring og Effekter (Pro)

**Mål:**  
Integrere AI Enhance (2×/4× upscale) og 10 visuelle effekter.

**Tiltak:**  
1. **Koble `aiEnhance.js`** til proxy-endpoint `/ai/picsart/enhance`.  
2. **Utvid `AIToolsPanel`:**  
   - “✨ Forbedre kvalitet (2× / 4×)”  
   - “🌈 AI-effekter (velg preset)”  
3. **Lag `AIResultsViewer.jsx`**  
   - Før/etter-slider, prosess-info (tid, format).  
4. **Lagre:** `enhancedUrl`, `enhancedAt`.  

**Visuelt:**  
Gold-gradient, pulsende loader, “✓ Lagret”-toast.  
**Resultat:** Høyoppløselig AI-forbedring og effekter for Pro-brukere.

---

## 🧩 Fase 4.4 – Batch-Behandling (Pro)

**Mål:** Gi mulighet for flere bilder samtidig.

**Tiltak:**  
1. **Ny komponent `AIBatchProcessor.jsx`**  
   - Velg operasjon (auto-tag, fjern bakgrunn, enhance).  
   - Progressbar + pause/resume.  
2. **`aiQueue.js` system:**  
   - Delay = 2 sek mellom kall.  
   - Retry ×3.  
3. **Batch-metadata:** `batchId`, `batchProcessedAt`.  

**Visuelt:**  
Modal med fremdriftslinje, tidsestimat og toast ved ferdigstilling.  
**Resultat:** Effektiv bulk-prosessering med kontroll og logging.

---

## 🔍 Fase 4.5 – AI-Søk og Tagg-Filter

**Mål:** Brukervennlig AI-drevet søk på tvers av bilder.

**Tiltak:**  
- Integrer `SmartSearch` i `GalleryPage`.  
- AI-forslag vises som chips (💡 outdoor (42) osv.).  
- Filtre (checkboxer).  

**Visuelt:**  
Glass-input, resultatkort med badges 🤖✨🎭.  
**Resultat:** Intelligent søk og organisering.

---

## 🧮 Fase 4.6 – Kvote, Logging og Brukerstatistikk

**Mål:** Overvåke AI-bruk og reset månedlig kvote.

**Tiltak:**  
1. **Firestore-samlinger:**  
   - `aiUsage`: månedlig bruk.  
   - `aiLogs`: logg per operasjon.  
2. **Functions:**  
   - `resetMonthlyQuota` (Pub/Sub hver 1. dag mnd).  
   - `cleanupOldAIVersions` (ukentlig).  
3. **`AILogPanel.jsx` utvides:** vis statistikk, kostnad og graf.  

**Resultat:** Full oversikt over AI-bruk og kontroll på kostnader.

---

## 💾 Fase 4.7 – Ytelse og Feiltoleranse

**Tiltak:**  
- `aiCache.js` (lokalt cache 7 dager).  
- Lazy loading av AI-komponenter.  
- Web Workers for analyse.  
- IndexedDB for store resultater.  
- Retry + graceful fallback hvis AI feiler.

**Resultat:** Stabil og rask AI-opplevelse selv ved feil eller nettverksavbrudd.

---

## 🌅 Fase 5 – Fremtidige Utvidelser

| Del | Beskrivelse | Teknologi |
|------|--------------|------------|
| **5.1 Generativ bakgrunn** | Lag ny bakgrunn fra prompt | Replicate / Stable Diffusion / DALL-E 3 |
| **5.2 AI-assistent** | Naturlig språk-søk (“finn bilder av meg på stranda i fjor”) | ChatGPT / Gemini 1.5 Pro |
| **5.3 EXIF + AI fusion** | Kombinér kamera-metadata med AI-innsikt | Lokal analyse + Vision API |
| **5.4 Social AI** | Face grouping, smart sharing (opt-in) | TensorFlow.js lokalt |

---

## ✅ Leveranse-rekkefølge

| Trinn | Hovedtema | Varighet |
|-------|------------|-----------|
| 4.0–4.1 | Kjerne og auto-tag | 2 uker |
| 4.2 | Bakgrunnsfjerning | 1 uke |
| 4.3 | Enhance + Effekter | 1,5 uke |
| 4.4 | Batch prosessor | 2 uker |
| 4.5–4.6 | Søk + logging | 1 uke |
| 4.7 | Ytelse / feilretting | løpende |
| 5.x | Fremtidige AI-moduler | etter v2-release |

---

**Dette dokumentet er den sammenslåtte Masterplanen for PhotoVault AI-fasen.**  
Den kombinerer Claudes visuelle design og arkitektur med GPT-5s tekniske flyt og prioritering.