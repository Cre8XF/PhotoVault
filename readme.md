# 📸 PhotoVault – React + Firebase Photo Archive App

## 🧩 Om prosjektet

PhotoVault er en komplett fotoarkiv-app bygget i **React** med **Firebase-backend** (Firestore + Storage).  
Appen håndterer innlogging, album, bildeopplasting og visning, og støtter både gratis og Pro-brukere.  
Denne pakken (ZIP) inneholder alt av kildekode og tilhørende README for videre utvikling eller forbedring med AI-verktøy.

---

## 🚀 Rask start (lokalt)

1. **Installer Node.js**  
   👉 https://nodejs.org/

2. **Installer avhengigheter**
   ```bash
   npm install
   Start utviklingsserver
   ```

bash Kopier kode npm start Appen kjører da på http://localhost:3000

Bygg for produksjon

bash Kopier kode npm run build ✨ Funksjoner (nåværende versjon) 🔐 Autentisering E-post / passord via Firebase Authentication

Persistent session (localStorage)

Rollebasert tilgang: admin / pro / standard

📸 Bilder og album Last opp flere bilder samtidig

Organiser bilder i album

Sett coverbilde

Fullskjerm bildevisning

Slettes direkte fra Firestore + Storage

Sortering etter dato

🧠 AI / Pro-funksjoner (Planlagt) AI auto-tagging og promptbasert redigering

Pro: ubegrenset opplasting og tagging

🧰 Admin Dashboard Viser brukere og lagring

Statistikkoversikt for administratorer

💎 Premium-modell Gratisbruker: 50 opplastinger

Pro-bruker: Ubegrenset + AI-funksjoner

Oppgradering med ett klikk (planlagt)

🗂 Prosjektstruktur csharp Kopier kode photovault/ ├── public/ │ └── index.html # HTML-mal og Tailwind-inkludering ├── src/ │ ├── App.js # Hovedapplikasjon │ ├── index.js # React entry point │ ├── firebase.js # Firestore + Storage-funksjoner │ ├── db.js # IndexedDB caching │ ├── components/ # Modal, Grid, UploadModal, etc. │ ├── pages/ # HomePage, AlbumPage, GalleryPage, AdminDashboard │ ├── index.css # Globale stiler og tema │ ├── home.css │ └── album.css ├── package.json └── README.md 💡 Ønskede forbedringer (mål for PhotoVault v2) Område Beskrivelse 🏠 Ny Home-layout Seksjoner for album, favoritter og nylige bilder 🖼️ Galleri-visning Fullskjerm galleri med filtrering ⭐ Favoritter Brukerbasert “favoritt”-system 🔄 Auto-refresh Automatisk oppdatering etter opplasting 🔍 Søk og filtrering Etter tag, album, dato 💡 Design Moderne layout med animasjoner og jevn flyt 🧠 AI-funksjon “ChatGPT-forsterket prompt”-redigering 🧰 Admin Full oversikt over brukere, lagring og aktivitet 📲 Mobilapp Flutter/Capacitor-basert versjon senere

⚙️ For AI-utvikling (Claude, ChatGPT, Gemini) Du mottar her en komplett React-app i ZIP-format. Pakk ut filene og les denne README først. Gå deretter gjennom prosjektet og implementer ønskede forbedringer listet under “mål for PhotoVault v2”. Ikke fjern eksisterende funksjoner, men forbedre struktur, layout og ytelse. Returner alle oppdaterte filer i korrekt mappestruktur.

AI bør: Beholde all Firebase-logikk og IndexedDB-integrasjon.

Optimalisere design (bruk Tailwind eller ren CSS).

Implementere auto-refresh og favorittfunksjon.

Forbedre UI og navigasjon uten å introdusere tredjeparts-UI-rammeverk (ingen Bootstrap/MUI).

Skrive ren JSX, kommentert på norsk ved behov.

Returnere alle oppdaterte filer ferdige for npm start.

⚡ Claude-optimalisert systemprompt sql Kopier kode You are an expert React + Firebase developer. You receive a full ZIP containing the PhotoVault app and this README. Your goal: complete PhotoVault v2 with improved UI, navigation, auto-refresh, and favorites. Keep all Firebase and IndexedDB logic intact. Use Tailwind or plain CSS for styling. Return complete, deploy-ready code in full file structure. At the top of your response, briefly summarize what you changed and why. 📦 Deploy Netlify (anbefalt)

bash Kopier kode npm run build netlify deploy --prod --dir=build Eller drag-and-drop build/-mappen direkte til netlify.com.

📄 Lisens Fri bruk for personlige og kommersielle prosjekter. Laget med ❤️ og React av Roger / Cre8Web.
