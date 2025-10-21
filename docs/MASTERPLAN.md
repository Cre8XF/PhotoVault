# 📘 PhotoVault Masterplan

Etappevis utviklingsplan for PhotoVault (React + Firebase)  
Status: **Oktober 2025**

---

## ✅ FASE 1 – Grunnstruktur og Datamodell

**Mål:** Få hele kjernesystemet opp og kjøre stabilt.

**Fullført:**

- React-app struktur (`App.js`, `HomePage.jsx`, `AlbumPage.jsx`, `GalleryPage.jsx`)
- Firebase-integrasjon (Auth, Firestore, Storage)
- IndexedDB støtte (`db.js`)
- Roller: user / admin / pro
- Albumhåndtering med opplasting, sletting, dekning og sortering
- Ny opplastingsdialog med fremdriftsindikator
- PhotoModal med bildevisning og navigasjon
- Full støtte for mørk/lys modus

---

## 🔥 FASE 2 – UI-forbedring (Ripple Effects)

**Mål:** Gi alle hovedknapper en moderne "ripple"-effekt.

**Fullført:**

- `HomeDashboard.jsx` ✅
- `UploadModal.jsx` ✅
- `PhotoModal.jsx` ✅
- `MorePage.jsx` ⚙️ (ferdigstilles)

**Neste filer (Fase 3-grense):**

- `AlbumsPage.jsx`
- `SearchPage.jsx`
- `ConfirmModal.jsx`
- `AlbumCard.jsx`

---

## 🟡 FASE 3 – Interaktivitet og Animasjoner

**Mål:** Mer levende appopplevelse og bedre flyt.

**Planlagt:**

- Mikroanimasjoner på kort (hover, klikk, fade)
- Overganger mellom sider (fade-in/out, slide)
- Lazy loading av bilder
- “Quick actions” på albumkort (delete/edit)
- Toast-forbedringer (visuelle + timing)

---

## 🟢 FASE 4 – AI og Smart-funksjoner

**Mål:** Integrere AI-basert støtte for sortering og bildeforbedring.

**Planlagt:**

- Gemini / PicsArt-integrasjon for AI-redigering
- AI Sort & Enhance-knapper i `HomeDashboard`
- Automatisk tagging (ansikter, objekter, motiv)
- “AI Assistant Panel” i AdminDashboard

---

## 🔵 FASE 5 – Optimalisering og Klargjøring for Release

**Mål:** Gjøre appen produksjonsklar (v2.0).

**Planlagt:**

- Optimalisering av bildecache og minnebruk
- Komprimering av bilder før opplasting
- Fjern unødvendige filer og kodekommentarer
- Legg til appversjon i footer og om-seksjon
- Android-build (Capacitor)
- Netlify / Firebase Hosting

---

## 🧩 Fremtidige ideer

- Multi-device synk (desktop ↔ mobil)
- AI prompt-forbedring (beskrevet i Photovault AI Extension)
- Privat deling av album via QR-koder
- Lokal redigering av metadata
- Galleri-visning med lys/kontrastfilter

---

## 🏁 Neste steg (prioritert)

1. Fullfør Fase 2 (`MorePage.jsx` + ConfirmModal)
2. Start Fase 3 (visuelle overganger og hover-effekter)
3. Sett opp `AISettingsPage` for neste versjon (Fase 4)
4. Gjør klar build for **Netlify** og test produksjon
5. Dokumentér alle komponenter i README.md
