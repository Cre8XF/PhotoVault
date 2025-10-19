# 📸 PhotoVault - Prosjektdokumentasjon

**Versjon:** 3.1  
**Sist oppdatert:** 19. oktober 2025  
**Status:** I utvikling - Redesign fase  
**Målsetting:** Kommersiell app for iOS/Android App Store

---

## 🎯 Prosjektoversikt

### **Hva er PhotoVault?**
En sikker, privat photo vault-app med fokus på:
- **Privacy-first** - Alle bilder kryptert og private
- **AI-funksjoner** - Auto-tagging, ansiktsgjenkjenning, bildeforbedring
- **Smart organisering** - Album, favoritter, smart albums
- **Cross-platform** - Web, iOS, Android (via Capacitor)

### **Målgruppe:**
- Privatpersoner som vil ha sikker bildelagring
- Folk som ønsker bedre organisering enn Google Photos
- Brukere som verdsetter privacy over gratis-tjenester

### **Business modell:**
```
GRATIS (500 MB)
├── Basis opplasting
├── Album og favoritter
└── Grunnleggende søk

PRO (kr 49/mnd eller kr 499/år)
├── 50 GB lagring
├── AI auto-tagging
├── Ansiktsgjenkjenning
├── Smart albums
└── Prioritert support

PREMIUM (kr 99/mnd eller kr 999/år)
├── 500 GB lagring
├── Familie-deling (5 brukere)
├── Video-støtte
└── Avansert bilderedigering
```

---

## 🏗️ Teknisk Stack

### **Frontend:**
```javascript
React 18.2.0
- Hooks (useState, useEffect, useMemo, useCallback)
- No external routing (custom state-based navigation)
- Tailwind CSS via CDN
- Lucide React icons
```

### **Backend:**
```javascript
Firebase
├── Authentication (Email/Password)
├── Firestore (Metadata database)
├── Storage (Image hosting)
└── Cloud Functions (Planned for thumbnails)
```

### **Planned additions:**
- **Capacitor** - Native app wrapper
- **Stripe/RevenueCat** - Subscriptions
- **Picsart API** - AI image processing
- **Algolia/Typesense** - Advanced search (future)

---

## 📁 Prosjektstruktur

```
photovault/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AILogPanel.jsx          # AI operations log
│   │   ├── AlbumCard.jsx           # Album card with 3D tilt
│   │   ├── AlbumModal.jsx          # Create/edit album modal
│   │   ├── ConfirmModal.jsx        # Confirmation dialogs
│   │   ├── Loading.jsx             # Loading states & spinners
│   │   ├── LoginPage.jsx           # Legacy (not used)
│   │   ├── Notification.jsx        # Toast notifications
│   │   ├── Particles.jsx           # Animated background
│   │   ├── PhotoGrid.jsx           # ⭐ Grid display with favorites
│   │   ├── PhotoModal.jsx          # ⭐ Lightbox with metadata
│   │   └── UploadModal.jsx         # ⭐ Upload interface
│   ├── pages/
│   │   ├── AdminDashboard.jsx      # Admin user management
│   │   ├── AlbumPage.jsx           # Individual album view
│   │   ├── DashboardPage.jsx       # ⭐ Main dashboard
│   │   ├── DatabaseTools.jsx       # Dev tools for IndexedDB
│   │   ├── GalleryPage.jsx         # ⭐ Photo gallery with search
│   │   ├── HomePage.jsx            # Alternative home view (legacy)
│   │   ├── LoginPage.jsx           # ⭐ Login/register
│   │   ├── ProfilePage.jsx         # User profile
│   │   └── SettingsPage.jsx        # App settings
│   ├── styles/
│   │   ├── album.css               # Album-specific styles
│   │   ├── home.css                # Home-specific styles
│   │   └── (index.css in root)
│   ├── utils/
│   │   ├── aiEnhance.js            # AI image enhancement
│   │   ├── aiSort.js               # AI auto-sorting
│   │   ├── picsart.js              # Picsart API wrapper
│   │   ├── picsartClient.js        # Picsart API client
│   │   └── searchPhotos.js         # Photo search utility
│   ├── App.js                      # ⭐ Main app component
│   ├── db.js                       # IndexedDB wrapper
│   ├── firebase.js                 # ⭐ Firebase configuration
│   ├── index.css                   # ⭐ Global styles + theme
│   └── index.js                    # Entry point
├── .gitignore
├── package.json
├── changelog.md                    # Version history
├── cors.json                       # Firebase storage CORS
├── deployment.md                   # Deployment guide
└── readme.md                       # Main documentation
```

**⭐ = Kritiske filer som endres ofte**

---

## 🎨 Nåværende Design (v3.0 - Før redesign)

### **Navigasjonsstruktur (GAMMEL):**
```
┌─────────────────────────────────────────────────┐
│  Dashboard | Galleri | [+] | Profil | Admin | Theme │
└─────────────────────────────────────────────────┘
```

**Problemer:**
- ❌ Dashboard vs Galleri overlap (forvirrende)
- ❌ Admin i hovedmeny (99% brukere trenger ikke dette)
- ❌ Tema-toggle tar verdifull plass
- ❌ Profil nesten tom
- ❌ AI-funksjoner skjult

### **Fargepalett:**

#### Dark Mode (Standard):
```css
--bg-gradient: #1e1b4b → #a78bfa
--bg-primary: #0A0E1A
--bg-secondary: #1A1F2E
--text-primary: #FFFFFF
--text-secondary: #A0A0A8
--accent-purple: #8B5CF6
--accent-yellow: #FDB022
--glass-bg: rgba(255, 255, 255, 0.08)
--glass-border: rgba(255, 255, 255, 0.18)
```

#### Light Mode:
```css
--bg-gradient: #ffffff → #fae8ff
--bg-primary: #FAFAFA
--bg-secondary: #FFFFFF
--text-primary: #1C1C1E
--text-secondary: #6B7280
--accent-purple: #8B5CF6
--image-bg: #f8fafc
--glass-bg: rgba(255, 255, 255, 0.8)
--glass-border: rgba(139, 92, 246, 0.15)
```

### **Temaer:**
- Twilight gradient bakgrunn (animated)
- Glassmorphism på cards
- 3D tilt-effekt på album-kort
- Partikkel-animasjoner i bakgrunnen

---

## 🔄 Pågående Redesign (v4.0)

### **NY Navigasjonsstruktur:**
```
┌─────────────────────────────────────────────────┐
│  🏠 Hjem  |  📂 Album  |  [+]  |  🔍 Søk  |  ☰ Mer │
└─────────────────────────────────────────────────┘
```

### **Side-oversikt:**

#### 1️⃣ **Hjem** (erstatter Dashboard)
**Formål:** Personlig oversikt og quick access

**Innhold:**
- 👋 Personlig velkomst
- ⭐ Favoritter (grid preview)
- 🕐 Siste opplastninger (horizontal scroll)
- 💎 Smarte album (auto-generert)
  - Siste 30 dager
  - Bilder med ansikter
  - Bilder uten album
- 🤖 AI-verktøy (quick actions)

---

#### 2️⃣ **Album** (erstatter Galleri)
**Formål:** Organisert visning av alle bilder

**Innhold:**
```
[ Vis: Alt ▼ ]  [+ Nytt album]

📸 ALLE BILDER (245)
   [Preview grid - 4 siste]         [Se alle →]

───────────────────────────────────────

📂 MINE ALBUM (3)

   [Album card 1]
   [Album card 2]
   [Album card 3]

───────────────────────────────────────

📍 BILDER UTEN ALBUM (24)
   [Preview grid - 4 siste]         [Organiser →]
```

**Dropdown-alternativer:**
- ✓ Alt (standard)
- 📂 Kun album
- 📸 Alle bilder
- ⭐ Favoritter
- 📍 Uten album
- 📅 Etter dato

**Interaksjoner:**
- Klikk "Se alle" → Full grid-visning av alle bilder
- Klikk album → AlbumPage
- Klikk "Organiser" → Bulk-selection mode

---

#### 3️⃣ **[+] Legg til** (Modal)
**Formål:** Upload hub

**Innhold:**
- 📸 Ta bilde (native kamera)
- 🖼️ Velg fra galleriet
- 📁 Drag & drop område
- 📂 Velg album (dropdown)
- 🤖 AI auto-tag ved opplasting (toggle)
- [LAST OPP] knapp

---

#### 4️⃣ **Søk**
**Formål:** Kraftig søk og filtrering

**Innhold:**
- 🔍 Søkefelt (real-time)
- Filtre:
  - 📅 Dato (i dag, uke, måned, år, custom)
  - 🏷️ Tags (AI-tagger)
  - ⭐ Favoritter
  - 👤 Ansikter
  - 📂 Album
- Populære søk (shortcuts)
- Søkeresultater (grid)

---

#### 5️⃣ **Mer** (erstatter Profil)
**Formål:** Innstillinger, AI-funksjoner, profil

**Innhold:**
```
👤 Roger_admin  [Admin badge]
   rogsor80@gmail.com
   Album: 1 • Bilder: 7

───────────────────────────────────────

💾 LAGRING
   7.7 MB / 500 MB (2%)
   [Progress bar]
   [Oppgrader til Pro →]

───────────────────────────────────────

🤖 AI-FUNKSJONER
   • Auto-sortering
   • Bildeforbedring
   • Ansiktsgjenkjenning
   • Smart tagging
   • Bakgrunnsfjerning
   • Duplikat-deteksjon

───────────────────────────────────────

⚙️ INNSTILLINGER
   • Sikkerhet & PIN-kode
   • Tema (Lys/Mørk)
   • Språk
   • Notifikasjoner
   • Auto-backup

───────────────────────────────────────

👤 KONTO
   • Min profil
   • Abonnement
   • Betalingsmetode
   • Logg ut
   • Slett konto

───────────────────────────────────────

ℹ️ INFO
   • Hjelp og support
   • Privacy policy
   • Terms of service
   • Om PhotoVault
   • Versjon 3.1

───────────────────────────────────────

🔰 ADMIN (kun hvis admin)
   • Brukeradministrasjon
   • Database-verktøy
   • Analytics
```

---

## 🚀 Implementeringsplan

### **FASE 1: Redesign (Nåværende - Uke 1)**
**Status:** 🟡 I gang

**Oppgaver:**
- [x] Planlagt ny navigasjonsstruktur
- [x] Designet wireframes
- [ ] Implementere ny navigasjon i App.js
- [ ] Lage ny Hjem-side (HomeDashboard.jsx)
- [ ] Refaktorere Album-siden
- [ ] Lage dedikert Søk-side
- [ ] Lage Mer-siden
- [ ] Teste på desktop
- [ ] Teste på mobil

**Filer som må endres:**
```
src/App.js                 → Ny navigasjonslogikk
src/pages/HomeDashboard.jsx → NY FIL (erstatter DashboardPage)
src/pages/AlbumPage.jsx     → Redesign med dropdown
src/pages/SearchPage.jsx    → NY FIL
src/pages/MorePage.jsx      → NY FIL (erstatter ProfilePage)
src/index.css              → Oppdaterte styles
```

---

### **FASE 2: Performance & UX (Uke 2)**
**Status:** 🔴 Ikke startet

**Oppgaver:**
- [ ] Thumbnail-system (Firebase Functions)
- [ ] Lazy loading med react-virtualized
- [ ] Image compression ved upload
- [ ] Drag & drop opplasting
- [ ] Bulk-operasjoner (velg flere)
- [ ] Skeleton loaders overalt
- [ ] Smooth page transitions

---

### **FASE 3: Sikkerhet (Uke 3)**
**Status:** 🔴 Ikke startet

**Oppgaver:**
- [ ] PIN-kode setup
- [ ] Biometrisk lås (Capacitor plugin)
- [ ] Auto-lock etter 5 min
- [ ] End-to-end kryptering
- [ ] Secure storage for sensitive data

---

### **FASE 4: Native App (Uke 4)**
**Status:** 🔴 Ikke startet

**Oppgaver:**
- [ ] Capacitor setup
- [ ] iOS build
- [ ] Android build
- [ ] Native kamera-integrasjon
- [ ] Push notifications
- [ ] App icons og splash screens

---

### **FASE 5: Monetization (Uke 5)**
**Status:** 🔴 Ikke startet

**Oppgaver:**
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Upgrade prompts
- [ ] Payment success/failure handling
- [ ] Restore purchases (iOS)

---

### **FASE 6: AI Features (Uke 6-8)**
**Status:** 🔴 Ikke startet

**Oppgaver:**
- [ ] Picsart API integration
- [ ] Auto-tagging pipeline
- [ ] Ansiktsgjenkjenning
- [ ] Smart albums generator
- [ ] Duplikat-deteksjon

---

## 📊 Firebase Datastruktur

### **Collections:**

#### **users/**
```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  role: "user" | "admin" | "pro",
  isPro: false,
  storageUsed: 7700000, // bytes
  storageLimit: 524288000, // 500 MB
  createdAt: "2025-10-17T10:00:00Z",
  lastLogin: "2025-10-19T08:30:00Z"
}
```

#### **albums/**
```javascript
{
  id: "album123",
  name: "Sommerferie 2024",
  description: "Ferien i Italia",
  userId: "user123",
  cover: "https://...", // URL til cover-bilde
  photoCount: 156,
  createdAt: "2025-06-01T12:00:00Z",
  updatedAt: "2025-08-15T14:30:00Z"
}
```

#### **photos/**
```javascript
{
  id: "photo123",
  name: "IMG_1234.jpg",
  url: "https://firebasestorage.../photo.jpg",
  userId: "user123",
  albumId: "album123", // null hvis uten album
  storagePath: "users/user123/albums/album123/IMG_1234.jpg",
  size: 2457600, // bytes
  type: "image/jpeg",
  favorite: false,
  
  // AI-metadata
  aiTags: ["beach", "sunset", "people"],
  faces: 2,
  enhancedUrl: "https://...", // AI-forbedret versjon
  
  // Timestamps
  createdAt: "2025-06-15T18:45:00Z",
  updatedAt: "2025-06-15T18:45:00Z",
  enhancedAt: "2025-06-16T10:00:00Z"
}
```

---

## 🔑 Miljøvariabler

**`.env` (lokal utvikling):**
```bash
# Firebase Config (allerede i kode)
# REACT_APP_FIREBASE_API_KEY=... (hardkodet i firebase.js)

# Picsart API
REACT_APP_PICSART_KEY=your_api_key_here

# Stripe (fremtidig)
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_STRIPE_SECRET_KEY=sk_test_...

# Environment
REACT_APP_ENV=development
```

---

## 🐛 Kjente problemer og løsninger

### **Problem 1: Full-size bilder laster tregt**
**Status:** 🔴 Ikke løst  
**Løsning:** Implementere thumbnail-system med Firebase Functions  
**Prioritet:** Høy

### **Problem 2: Ingen offline-støtte**
**Status:** 🔴 Ikke løst  
**Løsning:** Service Worker + IndexedDB caching  
**Prioritet:** Middels

### **Problem 3: Ingen feilhåndtering ved upload**
**Status:** 🟡 Delvis løst  
**Løsning:** Bedre error states og retry-logikk  
**Prioritet:** Middels

### **Problem 4: Mangler onboarding for nye brukere**
**Status:** 🔴 Ikke løst  
**Løsning:** Intro-slides ved første innlogging  
**Prioritet:** Høy (for lansering)

---

## 📝 Kode-konvensjoner

### **Navngiving:**
```javascript
// Komponenter: PascalCase
PhotoModal.jsx
AlbumCard.jsx

// Funksjoner: camelCase
toggleFavorite()
refreshUserData()

// Konstanter: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880;

// CSS-klasser: kebab-case
.album-card
.photo-grid
```

### **Fil-organisering:**
```javascript
// Component structure
import React, { useState, useEffect } from "react";
import { Icon1, Icon2 } from "lucide-react";

const ComponentName = ({ prop1, prop2 }) => {
  // 1. State
  const [state, setState] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3. Functions
  const handleClick = () => {
    // ...
  };
  
  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### **Firebase-kall:**
```javascript
// Alltid async/await med try-catch
const fetchData = async () => {
  try {
    const data = await getPhotosByUser(userId);
    setPhotos(data);
  } catch (err) {
    console.error("Error:", err);
    setNotification({ message: "Feil ved lasting", type: "error" });
  }
};
```

---

## 🧪 Testing

### **Manuell testing-sjekkliste:**
- [ ] Login/logout fungerer
- [ ] Opplasting av bilder
- [ ] Album-opprettelse
- [ ] Favoritt-toggle
- [ ] Søk og filtrering
- [ ] Tema-bytte (lys/mørk)
- [ ] Responsivitet (mobil/tablet/desktop)
- [ ] Lysboks-navigasjon (←/→/ESC)
- [ ] Sletting av bilder/album

### **Browser-testing:**
- Chrome (desktop + mobil)
- Safari (iOS)
- Firefox
- Edge

---

## 🚀 Deployment

### **Nåværende:**
- **Hosting:** Netlify / Vercel (web only)
- **URL:** TBD
- **Build command:** `npm run build`

### **Fremtidig (Native):**
- **iOS:** TestFlight → App Store
- **Android:** Google Play Console → Play Store

---

## 📚 Ressurser

### **Dokumentasjon:**
- Firebase: https://firebase.google.com/docs
- Capacitor: https://capacitorjs.com/docs
- Picsart API: https://docs.picsart.io
- Stripe: https://stripe.com/docs

### **Design-inspirasjon:**
- Google Photos
- Apple Photos
- 1Password (vault concept)
- Notion (clean UI)

---

## 👤 Kontaktinfo

**Utvikler:** Roger / Cre8Web  
**Email:** rogsor80@gmail.com  
**Prosjektstart:** 17. oktober 2025  
**Estimert lansering:** Januar 2026

---

## 🎯 Viktige beslutninger

### **Beslutning 1: React vs React Native**
**Valgt:** React + Capacitor  
**Grunn:** Kan gjenbruke 100% av koden, raskere utvikling  
**Dato:** 19. oktober 2025

### **Beslutning 2: Navigasjonsstruktur**
**Valgt:** 5-tab bottom navigation (Hjem, Album, +, Søk, Mer)  
**Grunn:** Standard pattern, tydelig separasjon, skalerer godt  
**Dato:** 19. oktober 2025

### **Beslutning 3: Album-side innhold**
**Valgt:** Kombinert visning (Album + Alle bilder + Uten album)  
**Grunn:** Fleksibelt, håndterer usorterte bilder, dropdown for ulike visninger  
**Dato:** 19. oktober 2025

### **Beslutning 4: Light mode optimalisering**
**Valgt:** Dedikerte styles for lyst tema (ikke bare inverse)  
**Grunn:** Bedre lesbarhet, profesjonelt utseende  
**Dato:** 19. oktober 2025

---

## 📌 Neste AI-samtale (Quick Start)

Når du starter en ny samtale med Claude, send denne filen og si:

```
"Jeg jobber med PhotoVault - se PROJECT.md for full oversikt.

Vi er nå på FASE 1 - Redesign.

Status:
- [x] Planlagt ny navigasjonsstruktur
- [ ] Implementere ny navigasjon i App.js
- [ ] Lage ny Hjem-side

Kan du hjelpe meg med [spesifikk oppgave]?"
```

Dette gir AI umiddelbar kontekst uten at du må forklare alt på nytt.

---

**🎉 Lykke til med utviklingen!**

*Denne filen oppdateres kontinuerlig etter hvert som prosjektet utvikler seg.*
