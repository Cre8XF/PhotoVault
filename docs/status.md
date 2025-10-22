| Område                             | Status | Kommentar                                                                    |
| ---------------------------------- | ------ | ---------------------------------------------------------------------------- |
| 🔐 Firebase Auth                   | ✅     | Innlogging og brukersesjon fungerer.                                         |
| ☁️ Storage-opplasting              | ✅     | Bilder lastes opp korrekt til Firebase Storage med riktig mappestruktur.     |
| 📷 Firestore–lagring av bilder     | ✅     | Nye bilder registreres i `photos`-samlingen med alle metadata.               |
| 🧠 AI-analyse (valgfritt)          | ✅     | AI-analyse fungerer (tagging, faces, analysert status).                      |
| 📦 Lokal IndexedDB-cache (`db.js`) | ✅     | Brukes til midlertidig lagring og caching.                                   |
| 🗂️ Albumvisning i appen            | ✅     | Album vises riktig i UI (fra React-state).                                   |
| 🪄 Flytt-funksjon UI               | ✅     | Valg og flytting via `MoveModal` fungerer, `albumId` oppdateres i Firestore. |

| Område | Problem | Årsak | Tiltak |
| --- | --- | --- | --- |
| 📁 **Album-oppretting (addAlbum)** | Album vises i appen men ikke i Firestore. | `addAlbum()` kalles uten `userId`. Dermed opprettes ikke dokument i `albums`. | Legg til `userId: user.uid` i kallet til `addAlbum()` i `UploadModal.jsx`, `AlbumPage.jsx`, og evt. `HomeDashboard.jsx`. |
| 🔄 **refreshData() etter flytting** | UI oppdaterer ikke alltid etter flytt. | `refreshData()` henter kun `photos`, ikke `albums`. | Utvid `refreshData()` til også å kjøre `getAlbumsByUser(user.uid)`. |
| 🔍 **SearchPage-filtrering etter flytting** | Bilder blir stående som “uten album” til siden reloades. | Filteret bruker cached `photos`. | Kall `refreshData()` etter vellykket flytt. |
| 🧭 **Albumdata i Firestore** | Ingen `albums`-samling eksisterer. | Lokal state brukes i stedet for database. | Når `addAlbum` får `userId`, vil samlingen opprettes automatisk. |
| 🧩 **Kobling IndexedDB ↔ Firestore** | Lokale og skybaserte album kan bli usynkronisert. | Begge systemer lagrer hver for seg. | Avklar strategi: skal album ligge _kun_ i Firestore (anbefales). |

| Område | Feil / Mangler | Løsning |
| --- | --- | --- |
| 🧱 **Ingen synlig `albums`-samling i Firestore** | Må etableres slik at album blir del av skydata. | Sørg for at `addAlbum()` alltid mottar `userId` (se over). |
| 🔗 **Ingen oppdatering av `photoCount` i album etter flytting** | Telling oppdateres kun ved opplasting. | Etter flytt: kall `updateAlbumPhotoCount(albumId, newCount)` eller lag en hjelpefunksjon som teller antall bilder per album. |
| 🔍 **Flytt-funksjon sjekker ikke gyldige ID-er** | Noen bilder mangler `id`-felt. | Valider `photo.id` før `updateDoc()`. Hvis mangler, logg feilen (du har robust versjon klar). |

🔧 Anbefalt rekkefølge for videre arbeid

Rett addAlbum()-kall slik at album faktisk lagres i Firestore med userId.

Bekreft at albums-samling opprettes (skal dukke opp automatisk i Firestore).

Oppdater refreshData() slik at den henter både photos og albums.

Legg inn updateAlbumPhotoCount() etter flytt og slett for riktig telling.

(Valgfritt) Konsolider IndexedDB — vurder å bruke kun Firestore for album for enklere drift.

| Fil | Hensikt | Hva som må sjekkes / endres |
| --- | --- | --- |
| **`src/firebase.js`** | Inneholder `addAlbum()`, `updateAlbumPhotoCount()`, Firestore-tilkobling | ✅ Funksjonen `addAlbum()` er riktig. **Ingen endring nødvendig**, men sørg for at du importerer og bruker denne i stedet for eventuell lokal versjon fra `db.js`. |
| **`src/db.js`** | Lokal IndexedDB-lagring | ⚠️ Hvis denne også har `addAlbum()` eller lignende, **fjern eller deaktiver** den versjonen slik at album opprettes i Firestore, ikke lokalt. |
| **`src/components/UploadModal.jsx`** | Her opprettes nye album | 🔧 Finn `handleCreateAlbum()` eller `onCreateAlbum()` og legg til `userId: user.uid` når du kaller `addAlbum()`. Eksempel: `js const newAlbum = await addAlbum({ name, userId: user.uid }); ` |
| **`src/pages/HomeDashboard.jsx`** _(eller `HomePage.jsx`)_ | Viser oversikt over album | 🔧 Kontroller at `refreshData()` henter album via `getAlbumsByUser(user.uid)` slik at nye album vises uten reload. |
| **`src/pages/AlbumPage.jsx`** | Viser enkeltalbum og inneholder opplasting/flytting | ⚠️ Kontroller at opplasting/flytt bruker album-ID fra Firestore, ikke lokal state. |
| **`src/pages/SearchPage.jsx`** | Har flytt-knapp og MoveModal | 🔧 Etter flytt: legg til `await refreshData()` og valider at filtrering fjernes for flyttede bilder. |
| **`src/components/MoveModal.jsx`** | Modal for å velge album ved flytting | ✅ Ingen endring nødvendig nå, men bør vise album fra Firestore-listen (`albums`-prop). |
| **`src/utils/firebaseHelpers.js`** _(hvis finnes)_ | Eventuelle hjelpefunksjoner | ⚠️ Dobbeltsjekk at `getAlbumsByUser()` peker til Firestore. |

Kort oppsummert

Fokusér først på: UploadModal.jsx → må sende userId inn i addAlbum().

Deretter på: HomeDashboard.jsx og SearchPage.jsx → må bruke refreshData() som henter både bilder og album fra Firestore.

Til slutt: db.js → vurder å deaktivere lokal album-lagring helt for å unngå forvirring.
