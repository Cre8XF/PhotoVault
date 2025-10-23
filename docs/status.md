# 🧠 PhotoVault – AI-Fase Masterplan (v2.0)

**Versjon:** v2.0 **Fokus:** Ferdigstille AI-funksjoner, Firestore-synk og helhetlig opplevelse

---

## ⚙️ Fase 4.0 – Grunnstruktur og aktivering (**Fullført**)

**Resultat:** AI-arkitekturen er aktiv i appen. Firebase er koblet til Vision API og Picsart via server-proxy. Firestore har utvidet datastruktur for `photos` og `users`.

**Hovedpunkter:**

- `AIToolsPanel.jsx`, `AISettingsPage.jsx`, `googleVision.js`, `picsartAI.js` validert.
- Nøkkelstyring for bruker/plan fungerer.
- Firestore-struktur utvidet med AI-felter.
- Proxy-endpoints testet.

---

## 🎨 Fase 4.1 – Auto-Tagging og Analyse (**Fullført**)

**Resultat:** Auto-tagging og ansiktsanalyse integrert i `UploadModal`. AI-analyse via Vision API ved opplasting, og resultat lagres i Firestore.

**Visuelt:** 🤖-badge på thumbnails, nye AI-filtre i `SearchPage`, og AI-felt (`aiTags`, `faces`, `aiAnalyzed`) synlige i databasen.

**Effekt:** AI-analyse og søk fungerer for alle brukere uten ekstra kostnad.

---

## ✂️ Fase 4.2 – Bakgrunnsfjerning (Pro)

**Mål:** Integrere Picsart API for bakgrunnsfjerning via Firebase proxy.

**Tiltak:**

- Knapp “🎭 Fjern bakgrunn” i `AIToolsPanel`.
- Backend-kall til `/ai/picsart/remove-bg`.
- Lagring av `noBgUrl` og `bgRemovedAt` i Firestore.
- Før/etter-visning i `AIResultsViewer.jsx`.

**Status:** Under arbeid. Frontend ferdig, backend testfase.

---

## ✨ Fase 4.3 – Bildeforbedring og Effekter (Pro)

**Mål:** Legge til Picsart Enhance (2x/4x) og visuelle AI-effekter.

**Tiltak:**

- Integrer `aiEnhance.js` mot `/ai/picsart/enhance`.
- Oppdater `AIToolsPanel` med nye knapper.
- Lagring: `enhancedUrl`, `enhancedAt`.
- Før/etter-visning i `AIResultsViewer.jsx`.

**Status:** Planlagt implementert etter 4.2.

---

## 🧩 Fase 4.4 – Batch-Behandling (Pro)

**Mål:** Støtte for flere bilder samtidig.

**Tiltak:**

- Ny komponent `AIBatchProcessor.jsx`.
- Implementer `aiQueue.js` (delay, retry, progressbar).
- Metadata: `batchId`, `batchProcessedAt`.

**Prioritet:** Etter stabilisering av enkel-bildeprosesser (4.2–4.3).

---

## 🔍 Fase 4.5 – AI-Søk og Tagg-Filter

**Mål:** Utvide søkefunksjonalitet for AI-tags, kategorier og filtre.

**Tiltak:**

- Integrer `SmartSearch.jsx` i `GalleryPage`.
- Bruk AI-forslag (chips, kategorier, ansikter, analysert-status).
- Filtrering via `aiTags`, `category`, `faces`.

**Status:** Delvis implementert i `SearchPage`. Ferdigstilles etter 4.3.

---

## 🧮 Fase 4.6 – Kvote, Logging og Brukerstatistikk

**Mål:** Overvåke AI-bruk per bruker og kontrollere forbruk.

**Tiltak:**

- Samlinger `aiUsage` og `aiLogs` i Firestore.
- Cloud Function: `resetMonthlyQuota` og `cleanupOldAIVersions`.
- `AILogPanel.jsx` viser statistikk og kostnad.

**Status:** Avventer etter 4.5.

---

## ⚡ Fase 4.7 – Ytelse og Feiltoleranse

**Tiltak:**

- `aiCache.js` for 7 dagers cache.
- Lazy loading av AI-komponenter.
- Web Workers for tunge kall.
- Retry/fallback ved feil.

**Status:** Løpende forbedring parallelt med øvrige faser.

---

## 🗂️ Fase 4.8 – Album- og Firestore-synk (**Ny**)

**Mål:** Permanent synk mellom lokale album og Firestore. Stabilisering av flytt-funksjon, `photoCount`, og realtidsoppdatering.

**Tiltak:**

- Sikre `addAlbum()` med `userId`.
- Opprette og vedlikeholde `albums`-samling i Firestore.
- Automatisk oppdatering av `photoCount` ved flytt/slett.
- Oppdatere `refreshData()` til å hente `albums` + `photos`.
- Valgfritt: avvikle lokal IndexedDB-lagring for album.

**Resultat:** Full Firestore-integrasjon av album og sanntidssynk mellom alle visninger.

---

## 🌅 Fase 5.x – Fremtidige Utvidelser

| Del                        | Beskrivelse                                                 | Teknologi                               |
| -------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| **5.1 Generativ bakgrunn** | Lag ny bakgrunn fra prompt                                  | Replicate / Stable Diffusion / DALL·E 3 |
| **5.2 AI-assistent**       | Naturlig språk-søk ("finn bilder av meg på stranda i fjor") | ChatGPT / Gemini 1.5 Pro                |
| **5.3 EXIF + AI fusion**   | Kombinér kamera-metadata og AI-innsikt                      | Lokal analyse + Vision API              |
| **5.4 Social AI**          | Face grouping og smart deling (opt-in)                      | TensorFlow.js lokalt                    |

---

## 🧭 Prioritert rekkefølge fremover

| Trinn | Hovedtema                              |
| ----- | -------------------------------------- |
| 1     | Fullfør Picsart-integrasjon (4.2)      |
| 2     | Aktiver Enhance + Effekter (4.3)       |
| 3     | Implementer album/Firestore-synk (4.8) |
| 4     | Utvid AI-søk og filtrering (4.5)       |
| 5     | Legg inn kvoter og logging (4.6)       |
| 6     | Batch-prosessering (4.4)               |
| 7     | Løpende ytelsesforbedring (4.7)        |
| 8     | Forbered fremtidige moduler (5.x)      |

---

**Oppsummering:** PhotoVault har nå stabil AI-grunnstruktur og Firestore-integrasjon. Neste hovedfokus er Picsart-verktøyene (4.2–4.3) og album-synk (4.8) før søk, logging og kvote-system.
