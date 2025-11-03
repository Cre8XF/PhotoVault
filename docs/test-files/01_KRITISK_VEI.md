# 01 - KRITISK VEI (Må fungere før MVP)

**Kategori:** Kritisk Vei  
**Total tester:** 27  
**Bestått:** 18  
**Ikke testet:** 8  
**Feilet:** 1  
**Dekning:** 67% ⚠️

---

## 🎯 Autentisering

### Innlogging & Utlogging

- [x] Logg inn med gyldig brukernavn/passord → suksess
  - **Kommentar:** OK
- [x] Logg ut → returnerer til innloggingsside
  - **Kommentar:** kommer opp et vindu md teksten er du sikker på at du vil logge ut. bekreft og den logger ut, men når jeg logger inn igjen kommer den samme meldigen i en veldig kort tid før jeg er innlogget.
- [ ] Logg inn med ugyldig passord → feilmelding vises
  - **Kommentar:** OK
- [ ] Tomme felt → valideringsfeil
  - **Kommentar:** OK

### Registrering & Passord

- [ ] Tilbakestill passord → e-post sendt
  - **Kommentar:** Ser ingen slik funksjon?
- [ ] Registrer ny konto → konto opprettet
  - **Kommentar:** OK
- [ ] Registrer med eksisterende e-post → feilmelding
  - **Kommentar:** OK

---

## 📸 Kjernefunksjoner - Bilder

### Opplasting

- [x] Last opp bilde < 10MB → suksess
  - **Kommentar:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***
- [ ] Last opp bilde > 10MB → komprimering eller feil
  - **Kommentar:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***
- [ ] Last opp flere bilder → alle lykkes
  - **Kommentar:** OK
- [ ] Dra og slipp opplasting → fungerer
  - **Kommentar:** OK

### Video

- [ ] Last opp video < 100MB → suksess
  - **Kommentar:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***
- [❌] Video-miniatyrbilde vises → **FEILET** (Kjent problem)
  - **Status:** ❌ P0 BLOKKERER
  - **Problem:** videoTools.js:generateThumbnail fungerer ikke
  - **Kommentar:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***

### Sletting & Favoritter

- [x] Slett bilde → fjernet fra galleri
  - **Kommentar:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***
- [x] Marker som favoritt → UI oppdateres
  - **Kommentar:** Ja, men “ikon forveksles med cover”,

---

## 📁 Album-håndtering

### CRUD Operasjoner

- [x] Opprett nytt album → vises i liste
  - **Kommentar:** OK
- [x] Rediger albumnavn → oppdateres
  - **Kommentar:** Ser ingen funksjon for dette
- [x] Slett album → fjernet fra liste
  - **Kommentar:** Ser ingen funksjon for dette
- [x] Sett albumcover → oppdateres
  - **Kommentar:** OK
- [x] Flytt bilde til album → teller oppdateres
  - **Kommentar:** Resultat: ❌ Feilet – dropdown viser ingen album. Kommentar: Album eksisterer (4 stk i Firestore), men listen lastes ikke i modalen. Sannsynlig årsak: albums-state ikke oppdatert fra usePhotoData() ved åpning.

### Spesialtilfeller

- [ ] Slett album med bilder → bilder bevares eller slettes
  - **Kommentar:** Ser ingen funksjon i appen

---

## 🔍 Søk og Filter

### Søk

- [x] Søk på tittel → riktige resultater
  - **Kommentar:** ok

### Filtrering

- [x] Filtrer på favoritter → viser kun favoritter
  - **Kommentar:** ok
- [x] Filtrer på dato → riktige resultater
  - **Kommentar:** ok
- [x] Fjern alle filtre → viser alle bilder
  - **Kommentar:** ok

---

## 📱 Mobil-responsivitet

### Layout & UI

[x] Appen fungerer på 375px bredde Kommentar: UI skalerer korrekt, men varslingsikonet (bjelle) overlapper filter- og sorteringsknapper. Bør flyttes til header eller egen bunnseksjon på mobil.

[x] Bunnnavigasjon fungerer Kommentar: Alle knapper fungerer, men varslingsknappen dekker andre elementer når dropdown er åpen. Krever layoutjustering.

[x] Alle modaler kan scrolles på små skjermer Kommentar: Scroll fungerer som forventet. Ingen blokkerte elementer i visningen.

### Ekte Enheter

- [ ] Test på ekte iPhone (Safari)
  - **Enhet:** \***\*\_\_\*\***
  - **OS:** \***\*\_\_\*\***
  - **Kommentar:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***
- [ ] Test på ekte Android (Chrome)
  - **Enhet:** \***\*\_\_\*\***
  - **OS:** \***\*\_\_\*\***
  - **Kommentar:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***

---

## 🚨 Blokkere & Kritiske Feil

### P0 - Blokkerer MVP

1. ❌ **Video-miniatyrbilde** - generateThumbnail fungerer ikke
   - Fil: `videoTools.js`
   - Konsekvens: Videoer kan lastes opp men vises ikke i galleriet
   - Status: Ikke fikset

---

## 📋 Aksjonspunkter

### Før MVP kan lanseres:

- [ ] Fiks video-miniatyrbilde generering
- [ ] Test alle autentiseringsflyter
- [ ] Test opplasting av > 10MB bilder
- [ ] Test på ekte iOS-enhet
- [ ] Test på ekte Android-enhet

### Estimert arbeid:

- **Totalt:** 8 tester igjen + 1 kritisk fiks
- **Estimert tid:** 4-6 timer
- **Blokkerer:** 1 (video-miniatyrbilde)

---

## ✅ Ferdigstillelse

**Kategori fullført?** ⬜ NEI (1 blokkerer, 8 tester igjen)

**Testet av:** \***\*\*\*\*\*\*\***\_\***\*\*\*\*\*\*\***

**Dato:** \***\*\_\_\*\***

**Neste steg:** Fiks video-miniatyrbilde, deretter fullfør resterende tester
