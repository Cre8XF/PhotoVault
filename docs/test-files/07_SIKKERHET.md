# 07 - SIKKERHET

**Kategori:** Sikkerhetsfunksjoner  
**Total tester:** 10  
**Bestått:** 0  
**Ikke testet:** 10  
**Feilet:** 0  
**Dekning:** 0% ⚠️ KRITISK

---

## 🔐 PIN-lås

### Oppsett
- [ ] Sett opp PIN (6 siffer) → Lagret
  - **Kommentar:** _________________________
- [ ] Sett opp PIN (4 siffer) → Lagret
  - **Kommentar:** _________________________
- [ ] Bytt PIN → Oppdatert
  - **Kommentar:** _________________________
- [ ] Slå av PIN → Deaktivert
  - **Kommentar:** _________________________

### Opplåsing
- [ ] Korrekt PIN → App låses opp
  - **Kommentar:** _________________________
- [ ] Feil PIN (3 ganger) → Utlogget
  - **Kommentar:** _________________________

---

## 🔓 Biometrisk Autentisering

### iOS
- [ ] FaceID aktivert → Fungerer
  - **Enhet:** __________
  - **Kommentar:** _________________________
- [ ] TouchID aktivert → Fungerer
  - **Enhet:** __________
  - **Kommentar:** _________________________

### Android
- [ ] Fingeravtrykk aktivert → Fungerer
  - **Enhet:** __________
  - **Kommentar:** _________________________

---

## ⏱️ Auto-lås

- [ ] Auto-lås etter 1 min inaktivitet → Fungerer
  - **Kommentar:** _________________________
- [ ] Auto-lås etter 5 min → Fungerer
  - **Kommentar:** _________________________
- [ ] Auto-lås umiddelbart ved app-bytte → Fungerer
  - **Kommentar:** _________________________

---

## 🛡️ Sikkerhetsinnstillinger

- [ ] Sikkerhetsside tilgjengelig
  - **Sted:** SecurityPage.jsx eller SettingsPage
  - **Kommentar:** _________________________
- [ ] Alle sikkerhetsfunksjoner listede
  - **Kommentar:** _________________________

---

## 📋 Aksjonspunkter

### ⚠️ KRITISK - Må testes før offentlig lansering:
- [ ] PIN-oppsett og opplåsing
- [ ] Biometrisk autentisering på ekte enheter
- [ ] Auto-lås timere

### Estimert arbeid:
- **Totalt:** 10 tester (ALLE ikke testet)
- **Estimert tid:** 3-4 timer
- **Blokkerer:** Ingen (men kritisk for sikkerhet)

---

## ✅ Ferdigstillelse

**Kategori fullført?** ⬜ NEI (0% testet - KRITISK)

**Testet av:** _________________________

**Dato:** __________

**Neste steg:** Test PIN-lås først, deretter biometrisk på ekte enhet
