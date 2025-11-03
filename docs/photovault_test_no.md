# PhotoVault - Komplett Testsjekkliste

**Sist oppdatert:** 3. november 2025 **Versjon:** 1.0.0-mvp **Miljø:** Produksjon (Netlify: cre8web-photovault.netlify.app)

---

## 📊 Testfremdrift Oversikt

**Totalt antall testkategorier:** 15 **Totalt antall tester:** 187

**Status:**

- ✅ **Bestått:** 42
- ⬜ **Ikke testet:** 145
- ❌ **Feilet:** 0

**Kritiske blokkere:** 1 (Video-miniatyrbilder) **Høy prioritet problemer:** 3 **Medium prioritet problemer:** 4

**Klar for produksjon?** ⬜ Trenger testing

---

## 🎯 KRITISK VEI - Må fungere før MVP lansering

### Autentisering

- [x] Logg inn med gyldig brukernavn/passord → suksess
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Logg ut → returnerer til innloggingsside
  - **Kommentar:** ****************\*\*\*\*****************
- [ ] Logg inn med ugyldig passord → feilmelding vises
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Tomme felt → valideringsfeil
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Tilbakestill passord → e-post sendt
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Registrer ny konto → konto opprettet
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Registrer med eksisterende e-post → feilmelding
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Kjernefunksjoner - Bilder

- [x] Last opp bilde < 10MB → suksess
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Slett bilde → fjernet fra galleri
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Marker som favoritt → UI oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Last opp bilde > 10MB → komprimering eller feil
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Last opp video < 100MB → suksess
  - **Kommentar:** ********\*\*********\_********\*\*********
- [❌] Video-miniatyrbilde vises → **FEILET** (Kjent problem)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Last opp flere bilder → alle lykkes
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Dra og slipp opplasting → fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Album-håndtering

- [x] Opprett nytt album → vises i liste
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Rediger albumnavn → oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Slett album → fjernet fra liste
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Sett albumcover → oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Flytt bilde til album → teller oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett album med bilder → bilder bevares eller slettes
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Søk og Filter

- [x] Søk på tittel → riktige resultater
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Filtrer på favoritter → viser kun favoritter
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Filtrer på dato → riktige resultater
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Fjern alle filtre → viser alle bilder
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Mobil-responsivitet

- [x] Appen fungerer på 375px bredde
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Bunnnavigasjon fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Alle modaler kan scrolles på små skjermer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Test på ekte iPhone (Safari)
  - **Enhet:** \***\*\_\_\_\*\*** **OS:** \***\*\_\_\_\*\***
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Test på ekte Android (Chrome)
  - **Enhet:** \***\*\_\_\_\*\*** **OS:** \***\*\_\_\_\*\***
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 🔐 1. AUTENTISERING & BRUKERADMINISTRASJON

### Innlogging & Utlogging

- [x] Gyldig e-post/passord → Suksess
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Logg ut via "Mer"-meny → Returnerer til innloggingsside
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Ugyldig innloggingsinformasjon → Feilmelding vises
  - **Forventet:** "Ugyldig e-post eller passord"
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Tomt e-postfelt → Valideringsfeil
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Tomt passord-felt → Valideringsfeil
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Tilbakestilling av Passord

- [ ] Be om passord-tilbakestilling → E-post sendt
  - **Sted:** LoginPage.jsx
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Klikk på lenke i e-post → Passord-tilbakestillingsside
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Registrering

- [ ] Gyldig registrering → Konto opprettet
  - **Sted:** LoginPage.jsx
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] E-post eksisterer allerede → Feilmelding vist
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Svakt passord → Valideringsfeil
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Rollebasert Tilgang

- [ ] Admin-rolle → AdminDashboard tilgjengelig
  - **Forventet:** Synlig kun for isAdmin=true eller role='admin'
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Vanlig bruker → AdminDashboard skjult
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 📸 2. BILDEHÅNDTERING

### Opplasting

- [x] Last opp bilde < 10MB → Suksess
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Last opp bilde > 10MB → Komprimering aktiveres
  - **Forventet:** browser-image-compression reduserer størrelse
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Last opp til spesifikt album → Bilde vises i album
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Last opp flere bilder (5+) → Alle lykkes
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Dra og slipp bilde → UploadModal åpnes
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Video-opplasting

- [x] Last opp .mp4 < 100MB → Suksess
  - **Status:** ⚠️ DELVIS (video lastes opp men ingen miniatyrbilde)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [❌] Video-miniatyrbilde vises i galleri
  - **Status:** ❌ FEIL
  - **Kjent problem:** videoTools.js:generateThumbnail fungerer ikke
  - **Prioritet:** P0 (BLOKKERER)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Video spilles av i PhotoModal
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Last opp .mov, .avi, .webm → Suksess eller feil
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Metadata & Redigering

- [x] Legg til tittel på bilde → Lagret i Firestore
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Legg til kategori → Lagret og søkbar
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Legg til manuelle tagger → Lagret og søkbare
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Rediger bildetittel → Oppdateres umiddelbart
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Fjern tagg → Oppdaterer søkeresultater
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Sletting

- [x] Slett bilde → Fjernet fra galleri
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Slett bilde → Fil fjernet fra Firebase Storage
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett bilde → Dokument fjernet fra Firestore
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett siste bilde i album → Album eksisterer fortsatt
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Favoritter

- [x] Marker som favoritt → Ikon endres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Fjern favoritt → Ikon går tilbake
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Favoritt vedvarer etter refresh
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 📁 3. ALBUM-SYSTEM

### Opprettelse av Album

- [x] Opprett nytt album i UploadModal → Vises umiddelbart
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Opprett album fra AlbumsPage → Fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Opprett album med langt navn (100+ tegn) → Validering eller avkutting
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Opprett album med emoji i navn → Fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Redigering av Album

- [x] Rediger albumnavn → Oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Rediger albumbeskrivelse → Oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Rediger tomt album → Ingen feil
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Sletting av Album

- [x] Slett album → Fjernet fra liste
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett album med bilder → Bilder flyttet til "Ingen Album"
  - **Forventet oppførsel:** Uklar - trenger spesifikasjon
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett album → Firestore-dokument fjernet
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Albumcover

- [x] Sett albumcover → Oppdateres umiddelbart
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Endre albumcover → Nytt bilde vises
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett coverbilde → Standard eller første bilde brukes
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Bildetellere

- [x] Legg til bilde i album → Teller øker
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Fjern bilde fra album → Teller reduseres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Flytt bilde mellom album → Begge tellere oppdateres
  - **Status:** Nylig lagt til funksjon
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 🔍 4. SØK & FILTER

### Tekstsøk

- [x] Søk på bildetittel → Riktige resultater
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Søk på tagg → Riktige resultater
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Søk delvis tittel → Fuzzy matching fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Søk case-insensitivt → Fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Søk med spesialtegn → Ingen feil
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Filtre

- [x] Filtrer på Favoritter → Viser kun favoritter
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Filtrer på AI-tagger → Viser taggede bilder
  - **Status:** ✅ (selv om AI er deaktivert)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Filtrer på Dato → Riktige resultater
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Filtrer på Kategori → Riktige resultater
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Filtrer på Album → Viser albumbilder
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Filtrer "Ingen Album" → Viser ikke-tildelte bilder
  - **Status:** Nylig lagt til funksjon
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Kombiner flere filtre → AND-logikk fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Filter UI

- [x] Aktivt filter-chip vises → Visuell bekreftelse
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Klikk filter-chip X → Fjerner det filteret
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Fjern alle filtre → Viser fullt galleri
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Filtre vedvarer under navigering → Status opprettholdes
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Filtre nullstilles ved sidelasting → Ren status
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Filter med null resultater → "Ingen bilder funnet" melding
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 🎨 5. UI/UX & TEMA

### Tema-veksling

- [x] Bytt Mørk/Lys → Endres umiddelbart
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Tema vedvarer etter utlogging/innlogging
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Tema vedvarer etter refresh
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Lyst tema kontrast → WCAG AAA-overholdelse
  - **Kjent problem:** Ikke sjekket
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Språkbytte

- [x] Bytt til Norsk → All tekst oversettes
  - **Status:** ✅ 100% dekning
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Bytt til Engelsk → All tekst oversettes
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Språk vedvarer etter refresh
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Bytt språk i modal → Modaltekst oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Responsivt Design

- [x] Appen fungerer på 375px bredde (iPhone SE)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Appen fungerer på 768px bredde (iPad)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Appen fungerer på 1920px bredde (Desktop)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Bunnnavigasjon overlapper ikke innhold
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Varslingsklokke overlapper ikke system-UI
  - **Status:** ✅ Nylig fikset
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Alle modaler passer på skjermen ved 375px
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Grid justerer kolonner basert på bredde
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Navigasjon

- [ ] Alle bunnnavigasjonsknapper fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Tilbakenavigasjon fungerer korrekt
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Deep linking (hvis router aktiv) → Fungerer
  - **Status:** Router ikke aktiv
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Feilhåndtering

- [ ] Nettverksfeil → Grasiøs feilmelding
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Komponent-krasj → Error boundary fanger
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Firebase timeout → Retry eller feil
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 🔒 6. DEAKTIVERTE AI-FUNKSJONER

**Disse skal vise "Kommer snart"-modal og IKKE utføre API-kall:**

- [x] "Auto-sorter bilder"-knapp → Viser ComingSoonModal
  - **Forventet:** Modal vises, ingen API-kall
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] "Ansiktsgjenkjenning"-knapp → Viser ComingSoonModal
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] "Smart tagging"-knapp → Viser ComingSoonModal
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] "Bildeforbedring" → Ingen API-kall
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] "Bakgrunnsfjerning" → Ingen API-kall
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] "Smarte albumforslag" → Ingen API-kall
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Last opp bilde → Ingen auto-tagging skjer
  - **Forventet:** aiTags-felt tomt
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Nettverksfane → Ingen kall til vision.googleapis.com
  - **Kommentar:** ********\*\*********\_********\*\*********

---

**AI-kostnadssjekk:**

- **Forventede Firebase-kostnader:** 0-100 NOK/måned (kun gratis tier)
- **Forventede AI API-kall:** 0
- **Verifisering:** Sjekk Firebase fakturerings-dashboard
- **Kommentar:** ********\*\*********\_********\*\*********

---

## 🔐 7. SIKKERHETSFUNKSJONER (PIN & BIOMETRI)

**KRITISK MERKNAD:** Disse funksjonene er dokumentert som "Fase 3" men er FULLT IMPLEMENTERT. Trenger testing!

### PIN-lås

- [ ] Aktiver PIN → Oppsettmodal vises
  - **Prioritet:** P0 (funksjonen er aktiv!)
  - **Sted:** SecuritySettings.jsx
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Sett 4-sifret PIN → Lagret
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Lås app → PIN-skjerm vises
  - **Sted:** App.js:176-178 (PINLockScreen aktiv)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Skriv inn korrekt PIN → Låses opp
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Skriv inn feil PIN → Feilmelding vist
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Deaktiver PIN → Lås fjernet
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Biometrisk Autentisering

- [ ] Enhet støtter biometri → Alternativ vist
  - **Prioritet:** P0 (funksjonen er aktiv!)
  - **Sted:** nativeBiometric.js
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Aktiver FaceID (iOS) → Oppsett fullført
  - **Enhet:** \***\*\_\_\_\*\***
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Aktiver TouchID (iOS) → Oppsett fullført
  - **Enhet:** \***\*\_\_\_\*\***
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Aktiver Fingeravtrykk (Android) → Oppsett fullført
  - **Enhet:** \***\*\_\_\_\*\***
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Biometrisk opplåsing → Suksess
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Biometri feiler → Fallback til PIN
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Sikkerhetsinnstillinger-side

- [ ] Naviger til Sikkerhetsinnstillinger → Side laster
  - **Prioritet:** P0 (funksjonen er aktiv!)
  - **Sted:** SecuritySettings.jsx (600 linjer)
  - **Hvordan få tilgang:** Sjekk MorePage.jsx for navigasjon
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Alle sikkerhetsalternativer synlige → UI korrekt
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 🔒 8. VAULT-FUNKSJONER

**KRITISK MERKNAD:** Vault er dokumentert som "Fase 3.1" men er FULLT IMPLEMENTERT. Trenger omfattende testing!

### Vault-oppsett

- [ ] Første vault-tilgang → Oppsettveiviser vises
  - **Prioritet:** P0 (funksjonen er aktiv!)
  - **Sted:** VaultPage.jsx (500 linjer)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Opprett vault-passord → Lagret
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Bekreft passord → Matcher eller feil
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Aktiver biometri for vault → Fungerer
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Vault Lås/Opplås

- [ ] Naviger til vault (låst) → Passord-prompt
  - **Sted:** App.js:246-248 (Vault-navigasjon aktiv)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Skriv inn riktig passord → Vault låses opp
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Skriv inn feil passord → Feilmelding vist
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Lås opp med biometri → Suksess
  - **Sted:** VaultPage.jsx:L35 (unlockWithBiometric)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Auto-lås etter timeout → Vault låses
  - **Sted:** vaultSlice.js, VaultPage.jsx:L71-80
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Vault Bildeoperasjoner

- [ ] Last opp bilde til vault → Kryptert
  - **Prioritet:** P0 (KRITISK - kryptering må fungere!)
  - **Sted:** encryption.js, useVault.js:239-260
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Kryptert fil i Firebase Storage → Ikke lesbar
  - **Prioritet:** P0 (Sikkerhetsvalidering)
  - **Test:** Forsøk å lese filen direkte fra Storage Console
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Vis vault-bilde → Dekrypteres korrekt
  - **Sted:** useVault.js (getDecryptedPhotoUrl)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett vault-bilde → Fil fjernet
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Vault-bilder i separat samling → Ikke i hovedgalleri
  - **Sted:** useVault.js:256 (vault_photos samling)
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Vault-innstillinger

- [ ] Åpne vault-innstillinger → Modal vises
  - **Sted:** VaultSettingsModal.jsx
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Endre vault-passord → Oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Juster auto-lås timeout → Vedvarer
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 👥 9. SOSIALE FUNKSJONER

**MERKNAD:** Disse komponentene er bygget men ikke integrert ennå. Test når integrert.

### Kommentarer (Ikke Integrert)

- [ ] Legg til kommentar på bilde → Lagret
  - **Status:** ⬜ IKKE INTEGRERT (Fase 4)
  - **Sted:** CommentThread.jsx eksisterer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Svar på kommentar → Tråd opprettet
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett kommentar → Fjernet
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Reaksjoner (Ikke Integrert)

- [ ] Legg til emoji-reaksjon → Teller øker
  - **Status:** ⬜ IKKE INTEGRERT
  - **Sted:** ReactionPicker.jsx eksisterer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Fjern reaksjon → Teller reduseres
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Varsler

- [x] Varslingspanel synlig → Øverste høyre posisjon
  - **Status:** ✅ AKTIV i produksjon!
  - **Sted:** App.js:188-192
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Motta varsel → Vises i panel
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Klikk varsel → Navigerer til bilde
  - **Sted:** App.js:116-121 (handleNavigateToPhoto)
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## ☁️ 10. FIREBASE-INTEGRASJON

### Firestore

- [x] Firestore-data laster → Ingen feil
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Opprett dokument → Lagret til Firestore
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Oppdater dokument → Endringer vedvarer
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Slett dokument → Fjernet fra Firestore
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Sanntidsoppdateringer → UI oppdateres
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Firebase Storage

- [x] Last opp fil → Lagret til Storage
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Last opp fra Netlify → Ingen CORS-feil
  - **Status:** ✅ Nylig fikset
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Slett fil → Fjernet fra Storage
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Storage-banestruktur → users/{userId}/{albumId}/{file}
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Sikkerhetsregler

- [ ] Bruker kan kun få tilgang til egne bilder → Håndhevet
  - **Prioritet:** P0 (Sikkerhetskritisk!)
  - **Test:** Forsøk å få tilgang til annen brukers Storage-bane
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Uautentisert tilgang → Avvist
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Filstørrelse > 10MB → Avvist
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 🌐 11. DEPLOYMENT & INFRASTRUKTUR

### Netlify Build

- [x] `npm run build` → Fullføres vellykket
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Build-tid < 60s → Ytelsesmål
  - **Mål:** < 60 sekunder
  - **Faktisk tid:** **\_** sekunder
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Build-advarsler → Dokumentert
  - **Status:** ⚠️ ADVARSLER EKSISTERER
  - **Kjente problemer:** React Scripts 5.x deprecation
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Miljøvariabler

- [x] Alle REACT_APP vars satt → Netlify
  - **Kommentar:** ********\*\*********\_********\*\*********
- [x] Firebase config → Korrekte verdier
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] AI API-nøkler til stede (ubrukte) → Satt
  - **Forventet:** Nøkler til stede men ikke kalt
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Skytjenester

- [x] Google Vision API aktivert → Riktig prosjekt
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Firebase budsjettvarsler → Konfigurert
  - **Prioritet:** P0
  - **Påkrevd:** 50 NOK/måned varsel
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Ytelse

- [ ] Lighthouse-score > 90 → Mål nådd
  - **Mål:** Ytelse > 90
  - **Faktisk score:** **\_**
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] First Contentful Paint < 1.5s → Rask
  - **Faktisk tid:** **\_** sekunder
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 📱 12. MOBIL/NATIVE FUNKSJONER

### Capacitor-integrasjon

- [ ] Capacitor installert → iOS/Android-mapper eksisterer
  - **Status:** Fase 5
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] `npx cap sync ios` → Ingen feil
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] `npx cap sync android` → Ingen feil
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Enhetsfunksjoner

- [ ] Kameratilgang → Tillatelse forespurt
  - **Sted:** nativeCamera.js eksisterer (ikke integrert)
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Fotobibliotek-tilgang → Tillatelse forespurt
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Haptisk tilbakemelding → Fungerer
  - **Pakke:** @capacitor/haptics installert
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Delingsark-integrasjon → Fungerer
  - **Pakke:** @capacitor/share installert
  - **Kommentar:** ********\*\*********\_********\*\*********
- [ ] Statuslinje-styling → Korrekt
  - **Pakke:** @capacitor/status-bar installert
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 🐛 13. KJENTE PROBLEMER & REGRESJONER

### Kritiske Problemer (Må Fikses)

- [❌] **Video miniatyrbilde-generering ødelagt**
  - **Fil:** videoTools.js:generateThumbnail
  - **Påvirkning:** Videoer lastes opp men ingen miniatyrbilde vises
  - **Prioritet:** P0 (BLOKKERER)
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Høy Prioritet Problemer

- [ ] **Dupliserte googleVision.js filer**

  - **Steder:** /src/utils/googleVision.js, /src/services/googleVision.js
  - **Påvirkning:** Forvirring, vedlikeholdsproblemer
  - **Prioritet:** P1
  - **Handling:** Slett /utils/-versjon
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

- [ ] **Vision API deprecated endepunkter**

  - **Filer:** utils/googleVision.js, MorePage.jsx (kommentert), docs/
  - **Påvirkning:** Vil bryte når API er deprecated
  - **Prioritet:** P1
  - **Handling:** Oppdater til prosjekt-scopet endepunkt
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

- [ ] **npm sårbarheter (9 totalt)**
  - **Alvorlighetsgrad:** 3 moderate, 6 høye
  - **Påvirkning:** Sikkerhetsrisiko
  - **Prioritet:** P1
  - **Handling:** Kjør npm audit fix
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

---

### Medium Prioritet Problemer

- [ ] **Lyst tema WCAG kontrast ikke sjekket**

  - **Påvirkning:** Tilgjengelighetoverholdelse ukjent
  - **Prioritet:** P2
  - **Handling:** Kjør WCAG kontrastsjekker
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

- [ ] **React Scripts 5.x deprecation-advarsler**

  - **Påvirkning:** Fremtidig kompatibilitetsproblemer
  - **Prioritet:** P2
  - **Handling:** Oppgrader til React Scripts 6.x (separat oppgave)
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

- [ ] **ProfilePage ikke lenket i navigasjon**

  - **Status:** Komponent fullført (278 linjer)
  - **Påvirkning:** Funksjon eksisterer men ikke tilgjengelig
  - **Prioritet:** P2
  - **Handling:** Legg til navigasjon i MorePage.jsx
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

- [ ] **SubscriptionPage ikke lenket i navigasjon**
  - **Status:** Komponent fullført (386 linjer)
  - **Påvirkning:** Funksjon eksisterer men ikke tilgjengelig
  - **Prioritet:** P2
  - **Handling:** Legg til navigasjon i MorePage.jsx
  - **Status:** ⬜ Ikke fikset
  - **Kommentar:** ********\*\*********\_********\*\*********

---

## 📊 14. TESTDEKNING OPPSUMMERING

### Etter Funksjonskategori

| Kategori                | Totalt | Bestått | Ikke Testet | Feilet | Dekning |
| ----------------------- | ------ | ------- | ----------- | ------ | ------- |
| **Autentisering**       | 12     | 7       | 5           | 0      | 58%     |
| **Bildehåndtering**     | 20     | 7       | 12          | 1      | 35%     |
| **Album-system**        | 15     | 9       | 6           | 0      | 60%     |
| **Søk & Filter**        | 18     | 8       | 10          | 0      | 44%     |
| **UI/UX**               | 20     | 6       | 14          | 0      | 30%     |
| **AI (Deaktivert)**     | 8      | 8       | 0           | 0      | 100% ✅ |
| **Sikkerhet (PIN/Bio)** | 14     | 0       | 14          | 0      | 0% ⚠️   |
| **Vault**               | 16     | 0       | 16          | 0      | 0% ⚠️   |
| **Sosiale Funksjoner**  | 8      | 1       | 7           | 0      | 13%     |
| **Firebase**            | 12     | 5       | 7           | 0      | 42%     |
| **Deployment**          | 10     | 4       | 6           | 0      | 40%     |
| **Mobil/Native**        | 8      | 0       | 8           | 0      | 0%      |

**Total Dekning:** 42 bestått / 187 totalt = **22%**

---

### Høyrisikoområder (Trenger Umiddelbar Testing)

1. **Sikkerhetsfunksjoner (0% testet)** - PIN, biometri, sikkerhetsside alle ikke testet
2. **Vault-funksjoner (0% testet)** - Kryptering, vault-opplåsing alle ikke testet
3. **Video-opplasting (feiler)** - Miniatyrbilder ødelagt
4. **Lyst tema (ikke sjekket)** - WCAG-overholdelse ukjent
5. **Firebase sikkerhetsregler (ikke testet)** - Brukerisolasjon ikke verifisert

---

## 🎯 15. ANBEFALTE TESTPRIORITERINGER

### Fase 1: Kritisk Sti (Før MVP-lansering)

**Tidslinje:** 1-2 dager

1. ❌ Fiks video miniatyrbilde-generering (P0 blokkerer)
2. ⬜ Test alle autentiseringsflyter (innlogging, utlogging, registrering)
3. ⬜ Test bilde last opp/slett/favoritt flyter
4. ⬜ Test album opprett/rediger/slett flyter
5. ⬜ Test søk og filtre
6. ⬜ Verifiser AI-funksjoner forblir deaktivert (null API-kall)
7. ⬜ Test på ekte iOS-enhet (Safari)
8. ⬜ Test på ekte Android-enhet (Chrome)
9. ⬜ Verifiser Firebase sikkerhetsregler (brukerisolasjon)
10. ⬜ Konfigurer Firebase budsjettvarsler (50 NOK/måned)

**Din progresjon:**

- Fullførte oppgaver: **\_** / 10
- Estimert tid brukt: **\_** timer
- Blokkere funnet: ********\*\*********\_********\*\*********

---

### Fase 2: Sikkerhet & Vault (Etter MVP, Før Offentlig)

**Tidslinje:** 2-3 dager

1. ⬜ **KRITISK:** Test vault kryptering/dekryptering
2. ⬜ **KRITISK:** Verifiser krypterte filer uleselige i Firebase Storage
3. ⬜ Test PIN-lås oppsett og opplåsing
4. ⬜ Test biometrisk autentisering (FaceID, TouchID, Fingeravtrykk)
5. ⬜ Test auto-lås timere
6. ⬜ Test sikkerhetsinnstillinger-side
7. ⬜ Sjekk lyst tema WCAG kontrast
8. ⬜ Fiks duplisert googleVision.js
9. ⬜ Fiks npm-sårbarheter

**Din progresjon:**

- Fullførte oppgaver: **\_** / 9
- Estimert tid brukt: **\_** timer
- Sikkerhetsrisiko funnet: ********\*\*********\_********\*\*********

---

### Fase 3: Sosiale & Ytelse (Når Integrert)

**Tidslinje:** 1-2 dager

1. ⬜ Test kommentar-tråding (når integrert)
2. ⬜ Test reaksjoner (når integrert)
3. ⬜ Test varsler
4. ⬜ Kjør Lighthouse-revisjon
5. ⬜ Test med 1000+ bilder (ytelse)
6. ⬜ Integrer og test paginering
7. ⬜ Lenk ProfilePage og SubscriptionPage

**Din progresjon:**

- Fullførte oppgaver: **\_** / 7
- Estimert tid brukt: **\_** timer
- Ytelsesproblemer funnet: ********\*\*********\_********\*\*********

---

## 📞 16. TESTARBEIDSFLYT

### For Hver Test:

1. **Utfør** - Kjør test-scenariet
2. **Dokumenter** - Registrer resultat (BESTÅTT/FEILET/DELVIS)
3. **Skjermbilde** - Ta bilde hvis FEILET
4. **Problem** - Opprett GitHub issue for feil
5. **Oppdater** - Marker avkrysningsboks i dette dokumentet

---

### Testmiljø:

**Nettlesere:**

- [ ] Chrome (Versjon: **\_**)
- [ ] Safari (Versjon: **\_**)
- [ ] Firefox (Versjon: **\_**)

**Mobile Enheter:**

- [ ] iOS - Enhet: \***\*\_\_\_\*\*** OS: \***\*\_\_\_\*\*** Safari-versjon: **\_**
- [ ] Android - Enhet: \***\*\_\_\_\*\*** OS: \***\*\_\_\_\*\*** Chrome-versjon: **\_**

**Skjermstørrelser:**

- [ ] 375px (iPhone SE)
- [ ] 768px (iPad)
- [ ] 1440px (Laptop)
- [ ] 1920px (Desktop)

**Nettverk:**

- [ ] Fast 3G
- [ ] 4G
- [ ] WiFi

**Firebase:**

- Produksjonsprosjekt: photovault-app-a0946
- Miljø: Produksjon (Netlify)

---

### Feilrapporteringsmal:

```
**Tittel:** [Funksjon] - [Problem]
**Prioritet:** P0/P1/P2/P3
**Miljø:** Nettleser/Enhet/OS: _____________________
**Steg for å Reprodusere:**
1. ...
2. ...
3. ...

**Forventet:**
_____________________________________________________

**Faktisk:**
_____________________________________________________

**Skjermbilde:** [legg ved]
**Referanse:** [Denne sjekkliste-seksjon]
**Testet av:** ___________ **Dato:** ___________
**Kommentar:**
_____________________________________________________
```

---

## ✅ 17. FERDIGSTILLELSE FOR MVP-LANSERING

**Alle disse må være SANNE:**

- [ ] Null P0-blokkerere (video-miniatyrbilder fikset)
- [ ] Alle autentiseringsflyter testet og fungerer
- [ ] Kjerne bildeoperasjoner testet og fungerer
- [ ] Album-håndtering testet og fungerer
- [ ] Søk/filter testet og fungerer
- [ ] AI-funksjoner verifisert deaktivert (null API-kall)
- [ ] Sikkerhetsfunksjoner testet (PIN, biometri, vault)
- [ ] Vault-kryptering verifisert sikker
- [ ] Firebase sikkerhetsregler testet (brukerisolasjon)
- [ ] Mobil responsiv verifisert på ekte enheter
- [ ] Firebase budsjettvarsler konfigurert
- [ ] Lighthouse-score > 85
- [ ] Ingen kritiske konsoll-feil
- [ ] Alle Høy Prioritet-problemer fikset
- [ ] README.md opprettet med nøyaktig funksjonsliste

---

## 📝 TESTNOTATER & OBSERVASJONER

### Generelle Notater:

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

### Ytelsesobservasjoner:

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

### Brukeropplevelse-tilbakemeldinger:

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

### Sikkerhetsbekymringer:

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

### Feil Oppdaget (Kort Liste):

1. ***
2. ***
3. ***
4. ***
5. ***

---

### Forbedringsforslag:

1. ***
2. ***
3. ***

---

## 🏁 GODKJENNING & SIGNERING

**Testet av:** ********\*\*********\_********\*\*********

**Dato testsyklus startet:** \***\*\_\_\_\*\***

**Dato testsyklus fullført:** \***\*\_\_\_\*\***

**Total testtid:** **\_** timer

**Godkjent for produksjon:** ⬜ JA ⬜ NEI

**Godkjenningssignatur:** ********\*\*********\_********\*\*********

**Dato:** \***\*\_\_\_\*\***

---

**Merknad:** Denne sjekklisten er et levende dokument. Oppdater det etter hvert som testing skrider frem.

**Versjon:** 1.0.0 **Siste oppdatering:** 3. november 2025
