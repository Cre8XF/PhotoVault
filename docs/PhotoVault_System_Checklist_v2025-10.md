# 🧩 PhotoVault – Combined System + Test Checklist (v2025-10 Final)

---

## 🔹 Inkluderer

- Oppdatert fra: `PhotoVault_System_Checklist_v2025-10.md`
- Utvidet med testfaser fra: `PhotoVault_Test_Checklist.md`
- Sammenslått: Full funksjons- og valideringsplan for Phases 3 → 5

---

## 🧠 Retningslinjer

- Alle ✅ beholdes fra tidligere tester.
- Tomme eller 'Må sjekkes' = ikke testet ennå.
- Kolonnen **Status / Resultat** brukes som felles kolonne for fremtidige tester.

---

## 📋 Systemstatus (tidligere system-sjekk)

# ✅ PhotoVault – System- og funksjonssjekk (oktober 2025)

---

## 🔐 Autentisering og tilgang

| Testpunkt                        | Forventet resultat            | Status |
| -------------------------------- | ----------------------------- | ------ |
| Logg inn med e-post/passord      | Fungerer uten konsollfeil     | ✅     |
| Logout via “Mer”-meny            | Returnerer til LoginPage      | ✅     |
| Admin-rolle viser AdminDashboard | Synlig kun for `isAdmin=true` | ☐      |

---

## ☁️ Firebase-tilkobling

| Testpunkt                             | Forventet resultat                          | Status |
| ------------------------------------- | ------------------------------------------- | ------ |
| Firestore-data vises (albums, photos) | Laster uten feil                            | ✅     |
| Storage-opplasting                    | Bilde lastes opp fra Netlify uten CORS-feil | ✅     |
| Sletting av bilder                    | Fil og dokument fjernes                     | ✅     |
| Flytting mellom album                 | Teller oppdateres automatisk                | ☐      |

---

## 🤖 AI-funksjoner

| Testpunkt                                          | Forventet resultat           | Status |
| -------------------------------------------------- | ---------------------------- | ------ |
| Cloud Vision API aktivert i `photovault-app-a0946` | 200 OK ved test-kall         | ✅     |
| Auto-tagging ved opplasting                        | Felt `aiTags` fylles         | ✅     |
| Bakgrunnsfjerning (PicsArt)                        | Ny fil uten bakgrunn         | ☐      |
| Enhance-funksjon                                   | Ny `enhancedUrl` i Firestore | ☐      |

---

## 🖼️ Album / UI

| Testpunkt                               | Forventet resultat             | Status |
| --------------------------------------- | ------------------------------ | ------ |
| Opprett nytt album i UploadModal        | Opprettes og vises umiddelbart | ✅     |
| Sett album-forside                      | Cover oppdateres               | ✅     |
| Redigeringsmodus (slett / sett forside) | Knappene vises kun i edit-mode | ✅     |
| Dark / Light-toggle                     | Endrer tema umiddelbart        | ✅     |

---

## 🔎 Søk og filtrering

| Testpunkt                            | Forventet resultat       | Status |
| ------------------------------------ | ------------------------ | ------ |
| Tekstsøk (tittel / tag)              | Treffer riktig           | ✅     |
| Filter Favoritt / AI / Ansikt / Dato | Filtrerer korrekt        | ✅     |
| Nullstill filter                     | Gjenoppretter full liste | ✅     |

---

## 🌐 Deploy / integrasjon

| Testpunkt             | Forventet resultat                            | Status |
| --------------------- | --------------------------------------------- | ------ |
| Netlify build         | Fullført uten feil                            | ✅     |
| Environment-variabler | Viser riktige verdier (`firebasestorage.app`) | ✅     |
| Cloud Vision API      | Aktivert i riktig prosjekt                    | ✅     |
| Cloud Logging         | Viser data etter trafikk                      | ✅     |

---

## 📱 Generell stabilitet

| Testpunkt                                      | Forventet resultat             | Status |
| ---------------------------------------------- | ------------------------------ | ------ |
| Ingen røde feil i DevTools                     | Konsollen ren                  | ✅     |
| Alle sider (Home, Albums, Search, More) laster | Ingen tom visning              | ✅     |
| Responsiv visning (desktop / mobil)            | Elementer justerer seg korrekt | ✅     |

---

### 🧾 Bruk

- Kryss av ✅ etter hvert testet punkt.
- Når alle punkter er OK → klar for **Phase 4 / 5** (PWA, deling, sanntidssync osv.).

---

## 🧪 Utvidet testfaser (Phase 3 → 5)

# 🧪 PhotoVault – Full Test- og Valideringsliste (Phases 3 → 5)

---

## 🔐 Phase 3 – Vault & AI Extensions

| Testpunkt                       | Hva skal gjøres / Hvor sjekkes                                      | Forventet resultat                               | Resultat (OK / Må sjekkes) |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| Vault kan opprettes og låses    | Gå til Vault Setup → opprett passord                                | Vault opprettes og vises som låst område         |                            |
| Biometrisk opplåsing fungerer   | På mobil → aktiver FaceID/TouchID                                   | Appen låser opp med biometrisk godkjenning       |                            |
| Bilder krypteres før opplasting | Last opp bilde i Vault → sammenlign filstørrelse lokalt vs Firebase | Filen er endret og ikke lesbar uten dekryptering |                            |
| Dekryptering ved visning        | Åpne Vault-bilde i galleriet                                        | Bildet vises korrekt etter dekryptering          |                            |
| AI-auto-tagging aktiveres       | Last opp bilde → sjekk felt `aiTags` i Firestore                    | AI-tagger legges til automatisk                  |                            |
| Bakgrunnsfjerning fungerer      | Åpne bilde i AI Tools → bruk _Remove Background_                    | Ny fil opprettes uten bakgrunn                   |                            |
| AI-forbedring (Enhance)         | Bruk _Enhance_-funksjon                                             | Felt `enhancedUrl` viser forbedret bilde         |                            |
| Duplicate-deteksjon             | Last opp to like bilder                                             | Systemet markerer eller foreslår sammenslåing    |                            |
| i18n-tekster                    | Bytt språk i innstillinger                                          | Alle tekster vises korrekt på valgt språk        |                            |

---

## ☁️ Phase 4 – Sync, Sharing & Collaboration

| Testpunkt                | Hva skal gjøres / Hvor sjekkes                  | Forventet resultat                        | Resultat (OK / Må sjekkes) |
| ------------------------ | ----------------------------------------------- | ----------------------------------------- | -------------------------- |
| Real-time sync           | Åpne app på to enheter, endre albumtittel       | Endringen vises umiddelbart på begge      |                            |
| Offline-modus            | Koble fra nett, last opp bilde, koble til igjen | Bilde lastes opp automatisk ved nett      |                            |
| Albumdeling via link     | Generer offentlig lenke i Share Modal           | Lenken åpner album i lesemodus            |                            |
| Invitasjon via e-post    | Send invitasjon fra Share Modal                 | Mottaker ser albumet i _Shared With Me_   |                            |
| Collaborator redigering  | Gi redigeringsrettigheter, endre bildeinfo      | Endring synkroniseres og logges           |                            |
| Aktivitet feed           | Åpne Activity Feed                              | Viser opplastinger, delinger, kommentarer |                            |
| Kommentarer              | Legg til, svar, rediger, slett                  | Alt fungerer, eier kan slette alle        |                            |
| Reaksjoner               | Trykk på emoji                                  | Teller oppdateres, markering vises        |                            |
| Notifikasjoner           | Reager på andres bilde                          | Eieren får sanntidsvarsel                 |                            |
| Markere som lest         | Klikk _Mark all as read_                        | Alle varsler endres til lest              |                            |
| Naviger fra notifikasjon | Trykk på varsel                                 | Appen åpner korrekt bilde                 |                            |
| i18n-tekster             | Bytt språk                                      | Meldinger oversettes riktig               |                            |
| Bygg kompilerer          | `npm run build`                                 | Ingen feil under bygg                     |                            |

---

## 📱 Phase 5 – PWA & Deployment

| Testpunkt                | Hva skal gjøres / Hvor sjekkes                | Forventet resultat                         | Resultat (OK / Må sjekkes) |
| ------------------------ | --------------------------------------------- | ------------------------------------------ | -------------------------- |
| PWA-installasjon         | Åpne app i Chrome → _Install App_             | Appen installeres og åpnes som selvstendig |                            |
| Offline-cache            | Gå offline etter første lasting               | Lagrede sider og bilder vises fra cache    |                            |
| Oppdateringsvarsel       | Endre versjon i `manifest.json`, reload       | Melding om ny versjon vises                |                            |
| Push-varsler (Capacitor) | Send test-push via Firebase                   | Varsel mottas i PWA/mobilapp               |                            |
| Share-mål (system)       | Bruk mobilens delingsmeny                     | PhotoVault vises som delingsvalg           |                            |
| iOS-build                | `npx cap sync ios`, åpne i Xcode              | Ingen build-feil, app starter i simulator  |                            |
| Android-build            | `npx cap sync android`, åpne i Android Studio | Gyldig AAB genereres                       |                            |
| Miljøvariabler           | Åpne DevTools → `process.env`                 | Alle REACT_APP-variabler eksisterer        |                            |
| Firebase Hosting         | `firebase deploy`                             | Siden fungerer fra Firebase-URL            |                            |
| Analytics logging        | Last opp bilde, sjekk Analytics               | Event `photo_uploaded` vises               |                            |
| CI/CD pipeline           | Trigger GitHub Actions                        | Bygg gjennomføres uten feil                |                            |
| Ytelse                   | Kjør Lighthouse                               | Performance > 90, SEO > 90                 |                            |
| Konsoll-feil             | Åpne DevTools Console                         | Ingen røde feilmeldinger                   |                            |

---

## 🧾 Bruk

- Fyll ut kolonnen **Resultat (OK / Må sjekkes)** etter test.
- Legg til eventuelle kommentarer direkte under tabellene eller i egne commits som dokumentasjon.
- Filnavn anbefalt: `PhotoVault_Test_Checklist.md`
