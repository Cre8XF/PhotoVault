# PhotoVault Testing - Brukerveiledning

## 📁 Testfil-struktur

Testene er delt opp i **16 filer** for å gjøre det enklere å jobbe med én kategori om gangen:

### Hoveddokument
- **00_TEST_OVERSIKT.md** - Oversikt, progresjon og prioritering

### Testfiler (1-15)
1. **01_KRITISK_VEI.md** ⚠️ **START HER** - Må fungere før MVP
2. **02_AUTENTISERING.md** - Innlogging, registrering, roller
3. **03_BILDEHÅNDTERING.md** - Opplasting, video, metadata
4. **04_ALBUM.md** - Album-system
5. **05_SOK_FILTER.md** - Søk og filtrering
6. **06_UI_UX.md** - Tema, responsivitet
7. **07_SIKKERHET.md** ⚠️ - PIN, biometri (0% testet)
8. **08_VAULT.md** ⚠️ - Kryptering (0% testet - KRITISK)
9. **09_SOSIALE.md** - Kommentarer, likes
10. **10_FIREBASE.md** - Database, storage, sikkerhet
11. **11_DEPLOYMENT.md** - Netlify, CI/CD
12. **12_MOBIL_NATIVE.md** - PWA, native funksjoner
13. **13_YTELSE.md** - Performance, optimalisering
14. **14_AI_FUNKSJONER.md** - AI (deaktivert i MVP)
15. **15_ADMINISTRASJON.md** - Admin-panel

---

## 🎯 Anbefalt Rekkefølge

### Fase 1: Kritisk Vei (1-2 dager)
1. Start med **01_KRITISK_VEI.md**
2. Deretter **02_AUTENTISERING.md**
3. Så **03_BILDEHÅNDTERING.md**

**Mål:** Alle kjernefunksjoner må fungere

### Fase 2: Sikkerhet (2-3 dager)
4. **07_SIKKERHET.md**
5. **08_VAULT.md** (KRITISK!)
6. **10_FIREBASE.md** (sikkerhet)

**Mål:** Verifiser at sensitive data er beskyttet

### Fase 3: Øvrige (1-2 dager)
7. Resten av filene basert på behov

---

## ✅ Slik Bruker Du Testfilene

### 1. Åpne én testfil om gangen
- Start med **01_KRITISK_VEI.md**
- Les gjennom testene i filen

### 2. Utfør testene
- Kjør hver test i appen
- Marker avkrysningsboks: `[x]` = bestått, `[ ]` = ikke testet, `[❌]` = feilet
- Fyll inn kommentarer der det er relevant

### 3. Dokumenter feil
- Bruk feilrapporteringsmalen fra **00_TEST_OVERSIKT.md**
- Ta skjermbilder av feil
- Opprett GitHub issues

### 4. Oppdater oversikten
- Oppdater **00_TEST_OVERSIKT.md** med progresjon
- Merk kategori som fullført når alle tester er utført

### 5. Gå videre til neste fil
- Ikke start på neste fil før forrige er ferdig (unntatt blokkere)

---

## 🚨 Kritiske Blokkere

Disse må fikses før videre testing:

1. **Video-miniatyrbilde** (P0) - `videoTools.js:generateThumbnail`
   - Fil: 01_KRITISK_VEI.md
   - Konsekvens: Videoer vises ikke i galleri

---

## ⚠️ Høyrisiko Områder (0% testet)

1. **Sikkerhet** (07) - PIN, biometri ikke testet
2. **Vault** (08) - Kryptering ikke verifisert
3. **Firebase sikkerhet** (10) - Brukerisolasjon ikke testet

**Anbefaling:** Test disse grundig før offentlig lansering!

---

## 📊 Progresjonsoversikt

Bruk **00_TEST_OVERSIKT.md** for å:
- Se samlet fremdrift
- Sjekke dekningsgrad per kategori
- Identifisere høyrisikoområder
- Planlegge neste steg

---

## 💡 Tips

1. **Fokuser på én fil om gangen** - ikke hopp mellom filer
2. **Dokumenter alt** - skriv kommentarer selv for bestått tester
3. **Ta skjermbilder** - spesielt for feil
4. **Opprett issues** - for alle feil du finner
5. **Oppdater regelmessig** - marker av og oppdater oversikten ofte

---

## 📞 Hvis Du Finner Kritiske Feil

1. **Stopp testing av den kategorien**
2. **Dokumenter feilen grundig**
3. **Opprett GitHub issue med P0/P1 prioritet**
4. **Gå til neste testfil** (unntatt hvis det blokkerer alt)
5. **Kom tilbake når feilen er fikset**

---

## ✅ Når Er Du Ferdig?

Du er ferdig når:
- [ ] Alle 15 testfiler er gjennomgått
- [ ] Alle kritiske blokkere er fikset
- [ ] Alle P0 og P1 issues er løst
- [ ] Alle høyrisikoområder er testet
- [ ] **00_TEST_OVERSIKT.md** viser at du er klar for produksjon

---

**Lykke til med testingen!** 🚀

Ta det én fil om gangen, så blir det mye mer håndterbart.
