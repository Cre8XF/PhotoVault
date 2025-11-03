# 14 - AI-FUNKSJONER (Deaktivert i MVP)

**Kategori:** AI-Funksjoner  
**Total tester:** 6  
**Bestått:** 0  
**Ikke testet:** 6  
**Feilet:** 0  
**Dekning:** 0%

---

## ⚠️ STATUS: DEAKTIVERT I MVP

AI-funksjoner (Google Vision, Gemini) er **deaktivert** for å holde kostnader nede i MVP-fasen.

---

## 🤖 Google Vision API

### Automatisk Tagging
- [ ] Last opp bilde → AI-tagger generert
  - **Status:** Deaktivert
  - **Kommentar:** _________________________
- [ ] Verifiser null API-kall til Google Vision
  - **Kommentar:** _________________________

---

## 🧠 Gemini API

### Bildeanalyse
- [ ] Analyser bilde → Beskrivelse generert
  - **Status:** Deaktivert
  - **Kommentar:** _________________________
- [ ] Verifiser null API-kall til Gemini
  - **Kommentar:** _________________________

---

## 💰 Kostnadskontroll

### Kritisk Verifisering
- [ ] ⚠️ **KRITISK:** Verifiser null AI API-kall i produksjon
  - **Sjekk:** Google Cloud Console > API Usage
  - **Forventet:** 0 requests
  - **Kommentar:** _________________________
- [ ] Verifiser AI-funksjoner ikke tilgjengelige i UI
  - **Kommentar:** _________________________

---

## 📋 Aksjonspunkter

### ⚠️ KRITISK før MVP:
- [ ] Verifiser null Google Vision API-kall
- [ ] Verifiser null Gemini API-kall
- [ ] Sjekk at AI-knapper/funksjoner er skjult i UI

### Fremtidig aktivering:
- Når budsjettet tillater det, aktiver AI-funksjoner
- Test da alle 6 tester i denne kategorien

### Estimert arbeid:
- **Totalt:** 2 kritiske verifikasjoner (null API-kall)
- **Estimert tid:** 30 min
- **Blokkerer:** Kritisk å verifisere null kall

---

## ✅ Ferdigstillelse

**Kategori fullført?** ⬜ NEI (må verifisere null API-kall)

**Testet av:** _________________________

**Dato:** __________

**Neste steg:** Verifiser null AI API-kall i Google Cloud Console
