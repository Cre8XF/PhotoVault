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
