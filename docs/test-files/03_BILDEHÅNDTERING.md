# 03 - BILDEHÅNDTERING

**Kategori:** Bildehåndtering  
**Total tester:** 22  
**Bestått:** 8  
**Ikke testet:** 14  
**Feilet:** 0  
**Dekning:** 36%

---

## 📤 Opplasting

### Bilde-opplasting
- [x] Last opp bilde < 10MB → Suksess
  - **Kommentar:** _________________________
- [ ] Last opp bilde > 10MB → Komprimering aktiveres
  - **Forventet:** browser-image-compression reduserer størrelse
  - **Kommentar:** _________________________
- [x] Last opp til spesifikt album → Bilde vises i album
  - **Kommentar:** _________________________
- [ ] Last opp flere bilder (5+) → Alle lykkes
  - **Kommentar:** _________________________
- [ ] Dra og slipp bilde → UploadModal åpnes
  - **Kommentar:** _________________________

### Støttede Formater
- [ ] Last opp .jpg → Suksess
  - **Kommentar:** _________________________
- [ ] Last opp .png → Suksess
  - **Kommentar:** _________________________
- [ ] Last opp .gif → Suksess
  - **Kommentar:** _________________________
- [ ] Last opp .webp → Suksess
  - **Kommentar:** _________________________
- [ ] Last opp .heic → Konvertering eller feil
  - **Kommentar:** _________________________

---

## 🎥 Video-opplasting

### Video
- [x] Last opp .mp4 < 100MB → Suksess
  - **Status:** ⚠️ DELVIS (video lastes opp men ingen miniatyrbilde)
  - **Kommentar:** _________________________
- [❌] Video-miniatyrbilde vises i galleri
  - **Status:** ❌ FEIL
  - **Kjent problem:** videoTools.js:generateThumbnail fungerer ikke
  - **Prioritet:** P0 (BLOKKERER)
  - **Kommentar:** _________________________
- [ ] Video spilles av i PhotoModal
  - **Kommentar:** _________________________

### Video-formater
- [ ] Last opp .mov → Suksess eller feil
  - **Kommentar:** _________________________
- [ ] Last opp .avi → Suksess eller feil
  - **Kommentar:** _________________________
- [ ] Last opp .webm → Suksess eller feil
  - **Kommentar:** _________________________

---

## 📝 Metadata & Redigering

### Legg til Metadata
- [x] Legg til tittel på bilde → Lagret i Firestore
  - **Kommentar:** _________________________
- [x] Legg til kategori → Lagret og søkbar
  - **Kommentar:** _________________________
- [x] Legg til manuelle tagger → Lagret og søkbare
  - **Kommentar:** _________________________
- [ ] Legg til beskrivelse → Lagret
  - **Kommentar:** _________________________

### Redigering
- [ ] Rediger bildetittel → Oppdateres umiddelbart
  - **Kommentar:** _________________________
- [ ] Rediger kategori → Oppdateres
  - **Kommentar:** _________________________
- [ ] Fjern tagg → Oppdaterer søkeresultater
  - **Kommentar:** _________________________

---

## 🗑️ Sletting

### Slette Bilde
- [x] Slett bilde → Fjernet fra galleri
  - **Kommentar:** _________________________
- [x] Slett bilde → Fil fjernet fra Firebase Storage
  - **Kommentar:** _________________________
- [ ] Slett bilde → Dokument fjernet fra Firestore
  - **Kommentar:** _________________________
- [ ] Slett siste bilde i album → Album eksisterer fortsatt
  - **Kommentar:** _________________________

### Sikkerhet
- [ ] Slett andres bilde → Feil (ingen tilgang)
  - **Kommentar:** _________________________

---

## ⭐ Favoritter

### Favoritt-funksjoner
- [x] Marker som favoritt → Ikon endres
  - **Kommentar:** _________________________
- [ ] Fjern favoritt → Ikon går tilbake
  - **Kommentar:** _________________________
- [ ] Favoritt vedvarer etter refresh
  - **Kommentar:** _________________________
- [ ] Favoritter synkroniserer på tvers av enheter
  - **Kommentar:** _________________________

---

## 📋 Aksjonspunkter

### Kritisk:
- [ ] ❌ Fiks video-miniatyrbilde generering (P0)

### Høy prioritet:
- [ ] Test komprimering av store bilder (> 10MB)
- [ ] Test opplasting av flere bilder samtidig
- [ ] Test dra-og-slipp funksjonalitet

### Medium prioritet:
- [ ] Test alle støttede bildeformater
- [ ] Test alle video-formater
- [ ] Test redigering av metadata

### Estimert arbeid:
- **Totalt:** 14 tester + 1 kritisk fiks
- **Estimert tid:** 3-4 timer
- **Blokkerer:** 1 (video-miniatyrbilde)

---

## ✅ Ferdigstillelse

**Kategori fullført?** ⬜ NEI (14 tester igjen, 1 blokkerer)

**Testet av:** _________________________

**Dato:** __________

**Neste steg:** Fiks video-miniatyrbilde før videre testing
