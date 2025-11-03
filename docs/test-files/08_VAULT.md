# 08 - VAULT & KRYPTERING

**Kategori:** Vault  
**Total tester:** 16  
**Bestått:** 0  
**Ikke testet:** 16  
**Feilet:** 0  
**Dekning:** 0% ⚠️ KRITISK

---

## 🔐 Kryptering

### Opplasting til Vault
- [ ] Last opp bilde til vault → Kryptert i Firebase Storage
  - **Forventet:** Fil uleselig uten dekryptering
  - **Kommentar:** _________________________
- [ ] Last opp video til vault → Kryptert
  - **Kommentar:** _________________________
- [ ] ⚠️ **KRITISK:** Åpne kryptert fil direkte i Firebase Storage → Uleselig
  - **Test:** Last ned fil fra Storage, prøv å åpne
  - **Kommentar:** _________________________

### Dekryptering
- [ ] Vis vault-bilde → Dekrypteres og vises
  - **Kommentar:** _________________________
- [ ] Last ned vault-bilde → Dekryptert versjon
  - **Kommentar:** _________________________

---

## 🔓 Vault-tilgang

### Opplåsing
- [ ] Åpne vault med PIN → Tilgang gitt
  - **Kommentar:** _________________________
- [ ] Åpne vault med biometri → Tilgang gitt
  - **Kommentar:** _________________________
- [ ] Feil PIN → Tilgang nektet
  - **Kommentar:** _________________________

### Auto-lås
- [ ] Vault låses automatisk etter timeout
  - **Kommentar:** _________________________
- [ ] Vault låses ved app-bytte
  - **Kommentar:** _________________________

---

## 📁 Vault-operasjoner

### Flytte til/fra Vault
- [ ] Flytt bilde til vault → Krypteres
  - **Kommentar:** _________________________
- [ ] Flytt bilde ut av vault → Dekrypteres
  - **Kommentar:** _________________________
- [ ] Vault-bilder ikke synlige i hovedgalleri
  - **Kommentar:** _________________________

### Sletting
- [ ] Slett vault-bilde → Kryptert fil fjernet
  - **Kommentar:** _________________________

---

## 🔒 Sikkerhet

### Krypteringsnøkkel
- [ ] Krypteringsnøkkel lagret sikkert (AsyncStorage eller Keychain)
  - **Kommentar:** _________________________
- [ ] Ingen nøkkel i Firestore eller Storage
  - **Kommentar:** _________________________

### Isolasjon
- [ ] Vault-innhold ikke søkbart fra hovedgalleri
  - **Kommentar:** _________________________
- [ ] Vault-metadata ikke lekket
  - **Kommentar:** _________________________

---

## 📋 Aksjonspunkter

### ⚠️ KRITISK - Må testes før offentlig lansering:
- [ ] **P0:** Verifiser krypterte filer er uleselige i Firebase Storage
- [ ] **P0:** Test kryptering/dekryptering pipeline
- [ ] Vault-opplåsing med PIN/biometri
- [ ] Sikker lagring av krypteringsnøkkel

### Estimert arbeid:
- **Totalt:** 16 tester (ALLE ikke testet)
- **Estimert tid:** 4-6 timer
- **Blokkerer:** Ingen (men KRITISK for sikkerhet)

---

## ⚠️ SIKKERHETSRISIKO

Vault-funksjoner er **0% testet**. Dette er en **kritisk sikkerhetsrisiko** hvis brukere stoler på kryptering som ikke er verifisert.

**Anbefaling:** Deaktiver vault-funksjoner i produksjon til full testing er gjennomført.

---

## ✅ Ferdigstillelse

**Kategori fullført?** ⬜ NEI (0% testet - KRITISK SIKKERHETSRISIKO)

**Testet av:** _________________________

**Dato:** __________

**Neste steg:** Test kryptering i Firebase Storage FØRST
