# 02 - AUTENTISERING & BRUKERADMINISTRASJON

**Kategori:** Autentisering  
**Total tester:** 14  
**Bestått:** 2  
**Ikke testet:** 12  
**Feilet:** 0  
**Dekning:** 14% ⚠️

---

## 🔐 Innlogging & Utlogging

### Gyldig Innlogging
- [x] Gyldig e-post/passord → Suksess
  - **Kommentar:** _________________________
- [x] Logg ut via "Mer"-meny → Returnerer til innloggingsside
  - **Kommentar:** _________________________

### Feilhåndtering
- [ ] Ugyldig innloggingsinformasjon → Feilmelding vises
  - **Forventet:** "Ugyldig e-post eller passord"
  - **Kommentar:** _________________________
- [ ] Tomt e-postfelt → Valideringsfeil
  - **Kommentar:** _________________________
- [ ] Tomt passord-felt → Valideringsfeil
  - **Kommentar:** _________________________

---

## 🔑 Tilbakestilling av Passord

### Flyt
- [ ] Be om passord-tilbakestilling → E-post sendt
  - **Sted:** LoginPage.jsx
  - **Kommentar:** _________________________
- [ ] Klikk på lenke i e-post → Passord-tilbakestillingsside
  - **Kommentar:** _________________________
- [ ] Sett nytt passord → Passord oppdatert
  - **Kommentar:** _________________________

### Feilhåndtering
- [ ] Ugyldig/utløpt lenke → Feilmelding
  - **Kommentar:** _________________________

---

## 📝 Registrering

### Gyldig Registrering
- [ ] Gyldig registrering → Konto opprettet
  - **Sted:** LoginPage.jsx
  - **Kommentar:** _________________________
- [ ] Bekreftelsese-post sendt → Kan verifisere konto
  - **Kommentar:** _________________________

### Validering
- [ ] E-post eksisterer allerede → Feilmelding vist
  - **Kommentar:** _________________________
- [ ] Svakt passord → Valideringsfeil
  - **Forventet:** Minimum 6 tegn
  - **Kommentar:** _________________________
- [ ] Ugyldig e-postformat → Valideringsfeil
  - **Kommentar:** _________________________

---

## 👥 Rollebasert Tilgang

### Admin-rolle
- [ ] Admin-rolle → AdminDashboard tilgjengelig
  - **Forventet:** Synlig kun for isAdmin=true eller role='admin'
  - **Kommentar:** _________________________
- [ ] Admin kan se brukerstatistikk
  - **Kommentar:** _________________________

### Vanlig Bruker
- [ ] Vanlig bruker → AdminDashboard skjult
  - **Kommentar:** _________________________
- [ ] Vanlig bruker kan ikke aksessere admin-ruter
  - **Kommentar:** _________________________

---

## 🔒 Øktkontroll

### Vedvaring
- [ ] Logg inn → Økt vedvarer etter refresh
  - **Kommentar:** _________________________
- [ ] Logg inn → Vedvarer på tvers av faner
  - **Kommentar:** _________________________

### Utløp
- [ ] Inaktiv i 24t → Automatisk utlogget (hvis implementert)
  - **Kommentar:** _________________________

---

## 📋 Aksjonspunkter

### Må testes:
- [ ] Alle innloggingsscenarier (gyldig, ugyldig, tom)
- [ ] Komplett passord-tilbakestillingsflyt
- [ ] Registreringsflyt med validering
- [ ] Rollebasert tilgang for admin/vanlig bruker

### Estimert arbeid:
- **Totalt:** 12 tester
- **Estimert tid:** 2-3 timer
- **Blokkerer:** Ingen

---

## ✅ Ferdigstillelse

**Kategori fullført?** ⬜ NEI (12 tester igjen)

**Testet av:** _________________________

**Dato:** __________

**Neste steg:** Test innloggingsfeilhåndtering først
