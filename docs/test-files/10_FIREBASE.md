# 10 - FIREBASE INTEGRASJON

**Kategori:** Firebase  
**Total tester:** 12  
**Bestått:** 5  
**Ikke testet:** 7  
**Feilet:** 0  
**Dekning:** 42%

---

## 🔥 Firestore

### CRUD Operasjoner
- [x] Opprett dokument → Synlig i Firestore Console
  - **Kommentar:** _________________________
- [x] Les dokument → Data hentet korrekt
  - **Kommentar:** _________________________
- [x] Oppdater dokument → Endringer lagret
  - **Kommentar:** _________________________
- [ ] Slett dokument → Fjernet fra Firestore
  - **Kommentar:** _________________________

### Sikkerhet
- [ ] ⚠️ **KRITISK:** Bruker kan kun se egne bilder
  - **Test:** Logg inn som bruker A, prøv å hente bruker B sin data
  - **Kommentar:** _________________________
- [ ] Bruker kan ikke slette andres bilder
  - **Kommentar:** _________________________
- [ ] Uautentisert tilgang nektet
  - **Kommentar:** _________________________

---

## 📦 Storage

### Opplasting
- [x] Last opp fil → Synlig i Storage Console
  - **Kommentar:** _________________________
- [x] Generer public URL → Tilgjengelig
  - **Kommentar:** _________________________

### Sletting
- [ ] Slett fil → Fjernet fra Storage
  - **Kommentar:** _________________________

### Sikkerhet
- [ ] Bruker kan kun slette egne filer
  - **Kommentar:** _________________________
- [ ] Uautentisert tilgang til filer nektet
  - **Kommentar:** _________________________

---

## 💰 Budsjettkontroll

- [ ] Firebase budsjettvarsler konfigurert (50 NOK/måned)
  - **Sted:** Firebase Console > Billing
  - **Kommentar:** _________________________

---

## 📋 Aksjonspunkter

### ⚠️ KRITISK:
- [ ] Test Firebase sikkerhetsregler (brukerisolasjon)
- [ ] Konfigurer budsjettvarsler

### Estimert arbeid:
- **Totalt:** 7 tester
- **Estimert tid:** 2-3 timer
- **Blokkerer:** Sikkerhetsregler er kritiske

---

## ✅ Ferdigstillelse

**Kategori fullført?** ⬜ NEI (7 tester igjen, inkl. kritisk sikkerhet)

**Testet av:** _________________________

**Dato:** __________
