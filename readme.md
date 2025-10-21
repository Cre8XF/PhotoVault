# 📷 PhotoVault

PhotoVault er et moderne, React-basert fotoarkiv med opplasting, album, AI-funksjoner og Firebase-backend.  
Utviklet som et fullverdig galleri for privat lagring, deling og administrasjon av bilder på tvers av enheter.

---

## 🚀 Funksjoner

- **Brukerpålogging** via Firebase Auth (e-post / Google)
- **Albumhåndtering:** opprett, slett, sorter og sett forside
- **Opplasting:** flere filer samtidig med progressbar
- **PhotoModal:** lysboksvisning med tastatur- og sveipnavigasjon
- **Favoritter og sortering**
- **Admin- og Pro-roller**
- **Flerspråk (NO/EN)** via `i18next`
- **Mørk / Lys modus**
- **Offline-støtte** via IndexedDB
- **Responsiv design (mobil + desktop)**
- **Ripple-effekter** på knapper (v2)
- **AI-plan:** auto-tagging, forbedring, organisering (kommende)

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

🧾 Versjoner
Versjon	Endringer
v1.0.0	Grunnstruktur og databinding
v1.5.0	Opplasting, modal, admin
v2.0.0	Ripple-effekter, språkstøtte, designforbedring
v2.5.0 (planlagt)	AI-integrasjon og auto-sortering

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
