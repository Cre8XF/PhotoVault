# 💡 AI Prompt Template for Code Updates

## 🧱 1. Oppgavetype

Velg én:

- [ ] Kombinere to filer
- [ ] Oppdatere eksisterende fil
- [ ] Legge til ny funksjon
- [ ] Fjerne eller rydde kode
- [ ] Forklare logikk / sammenligne filer

---

## 🎯 2. Mål

Forklar kort **hva** du ønsker å oppnå og **hvorfor**:

> Eks: “Jeg vil slå sammen `UploadModal.jsx` (aktiv fil) med `UploadModalOptimized.jsx` (ny logikk for bildekomprimering) slik at jeg får én komplett versjon som kan lukkes riktig og støtter auto-komprimering.”

---

## 📂 3. Filer

Oppgi hvilke filer du legger ved og hvordan de brukes:

| Fil         | Rolle                       | Skal beholdes | Kommentar                     |
| ----------- | --------------------------- | ------------- | ----------------------------- |
| FileA.jsx   | Hovedfil som brukes i appen | ✅            | Behold props, import, eksport |
| FileB.jsx   | Kilde for nye funksjoner    | ⬇️            | Legg til logikk herfra        |
| (ev. andre) |                             |               |                               |

---

## 🧩 4. Endringskrav

Beskriv punktvis **nøyaktig hva** som skal beholdes og legges til:

- Behold alle props og eksportnavn fra `FileA`.
- Flytt over `compressImage()`, `autoCompress`-state og `progressBar`-logikk fra `FileB`.
- Ikke endre foreldrefilene (f.eks. `AlbumPage.jsx`).
- Skal kunne lukkes via `onClose` og overlay.
- Ingen nye imports med mindre nødvendig.
- Ingen ESLint-feil.
- Returner hele oppdaterte filen – klar til liming inn.

---

## ⚙️ 5. Rammer

- Rammeverk: React (CRA)
- Språk: JavaScript
- Stil: Tailwind + Lucide Icons
- App-nivå: PhotoVault
- Eksterne avhengigheter: firebase, browser-image-compression
- Eksport: `export default ComponentName;`

---

## 🧠 6. Resultatformat

> Returner:
>
> 1. Hele oppdaterte filen klar til bruk.
> 2. Ingen forklaringer, bare kode.
> 3. Ingen ESLint- eller build-feil.

---

## 🧾 7. Eksempel

> **Oppgave:** Kombiner `UploadModal.jsx` og `UploadModalOptimized.jsx`.  
> Behold alle props fra `UploadModal.jsx`.  
> Legg til komprimeringslogikk og AI-toggles fra `Optimized`.  
> Returner én fil: `UploadModal.jsx` – komplett, klar til bruk, uten forklaring.

---

✅ **Tips for bruk:**

- Legg inn filene rett etter malen (kopiert kode eller lastet opp).
- AI får da komplett kontekst og kan levere riktig fil i ett forsøk.
- For små endringer kan du fjerne seksjonene du ikke trenger.
