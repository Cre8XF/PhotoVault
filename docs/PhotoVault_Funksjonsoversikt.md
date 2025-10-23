# 📸 PhotoVault – Funksjonsoversikt og sjekkliste

## ✅ 1. Ferdige funksjoner (per oktober 2025)

| Kategori | Funksjon | Status | Kommentar |
|-----------|-----------|--------|------------|
| **Autentisering** | Firebase Auth med brukerinnlogging | ✔️ | Email/passord fungerer |
| | Rollehåndtering (user / admin / pro) | ✔️ | Brukes for å vise admin-funksjoner |
| **Database** | Firestore lagring av bilder og album | ✔️ | Struktur: `photos`, `albums` |
| | Metadata: `aiTags`, `category`, `faces`, `favorite`, `albumId` | ✔️ | |
| **Lagring (Storage)** | Bildeopplasting til Firebase Storage | ✔️ | CORS satt korrekt |
| | Automatisk kobling mot Firestore-dokument | ✔️ | |
| **Album** | Opprett nytt album direkte fra opplastingsmodal | ✔️ | |
| | Sett album-forside (⭐) | ✔️ | Album oppdateres umiddelbart |
| | Slett enkeltbilder fra album | ✔️ | Med ConfirmModal |
| | Flytt bilder mellom album | ✔️ | Teller oppdateres automatisk |
| | Visning av antall bilder per album | ✔️ | |
| **Hjem / startside** | Viser nylig opplastede bilder | ✔️ | |
| | Viser favoritter og albumkort | ✔️ | |
| **Søk og filtrering** | Tekstsøk (navn, kategori, AI-tags) | ✔️ | |
| | Filtre: Favoritt, AI-analysert, Ansikter, Kategori, Album, Dato | ✔️ | |
| | Populære AI-tags (auto fra metadata) | ✔️ | |
| | Nullstill filtre-knapp | ✔️ | |
| **Bildevisning** | Modal med “Image X of Y” + piltaster og swipe | ✔️ | PhotoModal aktiv |
| **Redigeringsmodus** | Edit-modus med slett / sett forside | ✔️ | Kun synlig ved aktivering |
| **UI / UX** | Ripple-effekter og hoverfarger | ✔️ | Konsistent i hele appen |
| | ConfirmModal med animasjon og glassbakgrunn | ✔️ | Erstatter window.confirm |
| | Dark/light tema (via index.css variabler) | ✔️ | |
| **Internasjonalisering (i18n)** | Norsk og engelsk språkstøtte | ✔️ | Via `react-i18next` |
| **Deploy** | Netlify + Firebase-hosted database | ✔️ | Bucket: `photovault-app-a0946` |

## 🧩 2. Planlagte forbedringer og utvidelser (neste milepæl)

| Kategori | Funksjon | Prioritet | Kommentar |
|-----------|-----------|------------|------------|
| **UI/Design** | Navigasjonsmeny (Home, Albums, Search, Profile) | 🔼 Høy | Bedre flyt mellom sider |
| | Nytt “Gallery View” (grid + masonry + slideshow) | 🔼 Høy | Bytte mellom visningsmoduser |
| | Bedre bildevisning (zoom, EXIF, fullskjerm) | 🔼 Høy | Touch & keyboard support |
| | Oppdaterte kort med info-overlay (tags, kategori, dato) | 🔼 Høy | Vises ved hover |
| **Album** | Rediger navn / slett album | 🔼 Middels | Bekreft med ConfirmModal |
| | Sortering (dato, navn, størrelse) | 🔼 Middels | |
| **Brukerprofil** | Egen side: brukerdata, plan, språkvalg | 🔼 Høy | `ProfilePage.jsx` |
| | Bytte avatar / dark-light toggle | 🔼 Middels | |
| **Ytelse / teknikk** | Lazy loading av bilder | 🔼 Høy | Redusere initial load |
| | Offline caching (PWA) | 🔼 Middels | For mobilbruk |
| | Komprimering ved opplasting (client-side) | 🔼 Høy | Før Firebase-upload |
| **Admin Dashboard** | Se total storage per bruker | 🔼 Høy | |
| | Automatisk opprydding (tom album / duplikater) | 🔼 Middels | |
| **Deling / eksport** | Generer delbar lenke til album | 🔼 Middels | “Share album” funksjon |
| | Last ned bilde / album som ZIP | 🔼 Middels | |
| **Sikkerhet** | Bekreft e-post ved første innlogging | 🔼 Lav | |
| | 2FA via `capacitor-native-biometric` | 🔼 Lav | |

## 🚀 3. Fremtidige AI- og Pro-funksjoner (fase 4–5)

| Kategori | Funksjon | Planlagt fase | Kommentar |
|-----------|-----------|---------------|------------|
| **AI-analyse** | Auto-tagging (Google Vision / Gemini Vision) | 4.0 | Ferdig testet i backend |
| | Ansiktsgjenkjenning + grouping | 4.1 | AI sortering av personer |
| | Automatisk kategorisering (landskap, mennesker, dokument) | 4.1 | |
| | “Smart albums” basert på AI-tags | 4.2 | Autoalbum: “Katter”, “Reiser”, “Mennesker” |
| **AI-redigering** | Auto-enhance / bakgrunnsfjerning (PicsArt API) | 4.3 | Basert på `aiEnhance.js` |
| | Generer ny bakgrunn via prompt | 4.3 | Integrert “AI Edit Panel” |
| | Promptforbedrer via ChatGPT (AI-boosted prompt) | 4.4 | Forbedrer beskrivelser før Gemini |
| **Lagring / Pro-planer** | 5 GB gratis / 50 GB Pro | 5.0 | Firestore planbegrensning |
| | Pro-abonnement via Stripe / Firebase Billing | 5.0 | |
| | Visuell lagringsindikator (progress bar) | 5.0 | |
| **Automatisering** | Backup til Google Drive / OneDrive | 5.1 | |
| | Egendefinert cron for auto-sync | 5.1 | |

## 🧾 4. Test-sjekkliste (kan skrives ut)

| Nr | Testpunkt | OK | Kommentar |
|----|------------|----|------------|
| 1 | Logg inn fungerer | ☐ | |
| 2 | Opprett nytt album | ☐ | |
| 3 | Last opp bilder | ☐ | |
| 4 | Se bilder i album | ☐ | |
| 5 | Redigeringsmodus aktiveres | ☐ | |
| 6 | Sett bilde som forside (⭐) | ☐ | |
| 7 | Slett bilde (ConfirmModal vises) | ☐ | |
| 8 | Flytt bilde til annet album | ☐ | |
| 9 | Filtrering (favoritt, AI, ansikt) fungerer | ☐ | |
| 10 | Søker etter navn/tag fungerer | ☐ | |
| 11 | AI-tags vises korrekt i kort | ☐ | |
| 12 | Dark/light bytte fungerer | ☐ | |
| 13 | Opplasting oppdaterer umiddelbart | ☐ | |
| 14 | Forside oppdateres etter sett-forside | ☐ | |
| 15 | ConfirmModal vises korrekt i alle visninger | ☐ | |
