# 📷 PhotoVault

PhotoVault er et moderne, React-basert fotoarkiv med opplasting, album, AI-funksjoner og Firebase-backend.  
Utviklet som et fullverdig galleri for privat lagring, deling og administrasjon av bilder på tvers av enheter.

---

## 🚀 Funksjoner (MVP - v1.0.0-mvp)

### Aktive funksjoner
- ✅ **Brukerpålogging** via Firebase Auth (e-post / Google)
- ✅ **Albumhåndtering:** opprett, slett, sorter og sett forside
- ✅ **Opplasting:** flere filer samtidig med progressbar og komprimering
- ✅ **PhotoModal:** lysboksvisning med tastatur- og sveipnavigasjon
- ✅ **Favoritter og sortering**
- ✅ **Søk og filter:** etter tittel, dato, kategori, album
- ✅ **Admin- og Pro-roller**
- ✅ **Flerspråk (NO/EN)** via `i18next`
- ✅ **Mørk / Lys modus**
- ✅ **Responsiv design (mobil + desktop)**
- ✅ **Ripple-effekter** på knapper

### Kommer snart (Fase 2 - AI-funksjoner)
- 🔜 **AI Auto-tagging** (Google Vision API)
- 🔜 **Ansiktsgjenkjenning** (Google Vision API)
- 🔜 **Smart søk** (OpenAI GPT-4 Vision)
- 🔜 **Bildeforbedring** (Picsart API)
- 🔜 **Bakgrunnsfjernelse** (Picsart API)
- 🔜 **Duplikatoppdaging**

**Strategi:** AI-funksjoner aktiveres når brukerbase når 500+ brukere eller Pro-abonnementer dekker kostnader.

---

## 🧩 Teknologistack

| Komponent       | Teknologi                                                  |
| --------------- | ---------------------------------------------------------- |
| Frontend        | React (Vite)                                               |
| Backend         | Firebase Firestore & Storage                               |
| Autentisering   | Firebase Auth                                              |
| Offline-lagring | IndexedDB (`db.js`)                                        |
| UI / CSS        | Tailwind + Custom CSS (`index.css`, `styles-enhanced.css`) |
| Språk           | i18next (NO / EN)                                          |
| Distribusjon    | Netlify / Firebase Hosting                                 |
| Mobilversjon    | Capacitor (Android/iOS planlagt)                           |

---

## ⚙️ Oppsett lokalt

```bash
git clone https://github.com/Cre8XF/PhotoVault.git
cd PhotoVault
npm install
npm run dev
Åpne deretter http://localhost:3000

🗂️ Mappestruktur (kort)
bash
Kopier kode
src/
 ├─ components/     # Gjenbrukbare UI-komponenter
 ├─ pages/          # Hovedsider (Home, Album, Admin, More osv.)
 ├─ styles/         # CSS-filer
 ├─ utils/          # Hjelpefunksjoner (AI, native, osv.)
 ├─ locales/        # Språkfiler (en/no)
 ├─ contexts/       # Security & Toast Context
 └─ db.js           # IndexedDB-håndtering
🧠 Brukerroller
User: Standard tilgang (album, opplasting, sletting)

Pro User: Ekstra funksjoner (AI, lagringsplass)

Admin: Full tilgang (dashboard, database-verktøy)

🌐 Distribusjon
Produksjon: Netlify eller Firebase Hosting

Android / iOS: via Capacitor Build

## 🧾 Versjoner

| Versjon | Endringer |
|---------|-----------|
| v1.0.0-mvp | MVP-lansering uten AI-funksjoner (kostnadseffektiv) |
| v2.0.0 (planlagt) | AI-integrasjon: auto-tagging, ansiktsgjenkjenning, smart søk |
| v3.0.0 (planlagt) | Sikker vault med kryptering og biometrisk lås |
| v4.0.0 (planlagt) | Deling og samarbeid |
| v5.0.0 (planlagt) | Native mobilapper (iOS/Android)

🛠 Vedlikehold
Bruk npm run build før produksjon.

Fjern ubrukte bilder i Firebase Storage med AdminDashboard.

Oppdater språkfiler ved endringer i komponenter.

Test jevnlig på mobil.

👤 Utviklet av
Cre8XF / Roger Sørensen
📍 Fredrikstad, Norge
🌐 cre8xf.dev
📸 PhotoVault på GitHub
```
