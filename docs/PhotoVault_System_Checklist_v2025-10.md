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
| Auto-tagging ved opplasting                        | Felt `aiTags` fylles         | ☐      |
| Bakgrunnsfjerning (PicsArt)                        | Ny fil uten bakgrunn         | ☐      |
| Enhance-funksjon                                   | Ny `enhancedUrl` i Firestore | ☐      |

---

## 🖼️ Album / UI

| Testpunkt                               | Forventet resultat             | Status |
| --------------------------------------- | ------------------------------ | ------ |
| Opprett nytt album i UploadModal        | Opprettes og vises umiddelbart | ☐      |
| Sett album-forside                      | Cover oppdateres               | ☐      |
| Redigeringsmodus (slett / sett forside) | Knappene vises kun i edit-mode | ☐      |
| Dark / Light-toggle                     | Endrer tema umiddelbart        | ☐      |

---

## 🔎 Søk og filtrering

| Testpunkt                            | Forventet resultat       | Status |
| ------------------------------------ | ------------------------ | ------ |
| Tekstsøk (tittel / tag)              | Treffer riktig           | ☐      |
| Filter Favoritt / AI / Ansikt / Dato | Filtrerer korrekt        | ☐      |
| Nullstill filter                     | Gjenoppretter full liste | ☐      |

---

## 🌐 Deploy / integrasjon

| Testpunkt             | Forventet resultat                            | Status |
| --------------------- | --------------------------------------------- | ------ |
| Netlify build         | Fullført uten feil                            | ✅     |
| Environment-variabler | Viser riktige verdier (`firebasestorage.app`) | ✅     |
| Cloud Vision API      | Aktivert i riktig prosjekt                    | ✅     |
| Cloud Logging         | Viser data etter trafikk                      | ☐      |

---

## 📱 Generell stabilitet

| Testpunkt                                      | Forventet resultat             | Status |
| ---------------------------------------------- | ------------------------------ | ------ |
| Ingen røde feil i DevTools                     | Konsollen ren                  | ☐      |
| Alle sider (Home, Albums, Search, More) laster | Ingen tom visning              | ☐      |
| Responsiv visning (desktop / mobil)            | Elementer justerer seg korrekt | ☐      |

---

### 🧾 Bruk

- Kryss av ✅ etter hvert testet punkt.
- Når alle punkter er OK → klar for **Phase 4 / 5** (PWA, deling, sanntidssync osv.).
