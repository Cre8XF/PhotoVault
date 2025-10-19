# 🚀 PhotoVault v4.0 - Installasjonsveiledning

## 📦 Filer som må installeres

### **1. CSS-filer (Light mode-fiks)**
```bash
outputs/index.css      → src/index.css
outputs/home.css       → src/styles/home.css
outputs/album.css      → src/styles/album.css
```

### **2. Komponenter**
```bash
outputs/PhotoModal.jsx → src/components/PhotoModal.jsx
```

### **3. Nye sider (Redesign)**
```bash
outputs/HomeDashboard.jsx → src/pages/HomeDashboard.jsx (NY FIL)
outputs/AlbumsPage.jsx    → src/pages/AlbumsPage.jsx (NY FIL)
outputs/SearchPage.jsx    → src/pages/SearchPage.jsx (NY FIL)
outputs/MorePage.jsx      → src/pages/MorePage.jsx (NY FIL)
```

### **4. Hovedapp**
```bash
outputs/App.js → src/App.js (ERSTATT)
```

### **5. Dokumentasjon**
```bash
outputs/PROJECT.md           → PROJECT.md (root)
outputs/README_LIGHT_MODE.md → README_LIGHT_MODE.md (root)
outputs/INSTALLATION.md      → INSTALLATION.md (root)
```

---

## 🔧 Steg-for-steg installasjon

### **Steg 1: Backup (viktig!)**
```bash
# Lag en backup av nåværende versjon
cp src/App.js src/App.js.backup
cp src/index.css src/index.css.backup
```

### **Steg 2: Kopier CSS-filer**
```bash
# Fra outputs til src
cp outputs/index.css src/
cp outputs/home.css src/styles/
cp outputs/album.css src/styles/
```

### **Steg 3: Kopier komponenter**
```bash
cp outputs/PhotoModal.jsx src/components/
```

### **Steg 4: Kopier nye sider**
```bash
# Opprett nye filer
cp outputs/HomeDashboard.jsx src/pages/
cp outputs/AlbumsPage.jsx src/pages/
cp outputs/SearchPage.jsx src/pages/
cp outputs/MorePage.jsx src/pages/
```

### **Steg 5: Erstatt App.js**
```bash
cp outputs/App.js src/
```

### **Steg 6: Test**
```bash
npm start
```

---

## ✅ Sjekkliste etter installasjon

- [ ] **Navigasjon fungerer** - Kan bytte mellom alle 5 tabs (Hjem, Album, Søk, Mer)
- [ ] **Hjem-siden viser** - Favoritter, siste opplastninger, smarte album
- [ ] **Album-siden viser** - Dropdown fungerer, alle visninger tilgjengelig
- [ ] **Søk fungerer** - Kan søke og filtrere bilder
- [ ] **Mer-siden viser** - Profil, AI-funksjoner, innstillinger
- [ ] **Light mode fungerer** - Lys bakgrunn på bilder, lesbar tekst
- [ ] **PhotoModal fungerer** - Synlige knapper i lysboks
- [ ] **Upload fungerer** - Kan laste opp bilder
- [ ] **Tema-bytte fungerer** - Kan veksle mellom lys/mørk

---

## 🐛 Feilsøking

### **Problem 1: "Module not found: HomeDashboard"**
**Løsning:** Sjekk at filen ligger i `src/pages/HomeDashboard.jsx`

### **Problem 2: Navigasjon vises ikke**
**Løsning:** Hard refresh browser (`Ctrl + Shift + R`)

### **Problem 3: CSS ser feil ut**
**Løsning:** 
```bash
# Clear cache
rm -rf node_modules/.cache
npm start
```

### **Problem 4: Bilder har fortsatt mørk bakgrunn i lyst tema**
**Løsning:** Sjekk at `src/index.css` er oppdatert med light mode styles

### **Problem 5: Knapper usynlige i PhotoModal**
**Løsning:** Sjekk at `src/components/PhotoModal.jsx` er oppdatert

---

## 📊 Hva er nytt i v4.0?

### **Navigasjon:**
- ✅ 5-tab bottom navigation (Hjem, Album, Søk, Mer, +)
- ✅ Floating Action Button for upload
- ✅ Tydelig separasjon av funksjoner

### **Sider:**
- ✅ **Hjem** - Personlig dashboard med quick actions
- ✅ **Album** - Smart organisering med dropdown-filter
- ✅ **Søk** - Dedikert søk med avanserte filtre
- ✅ **Mer** - Komplett innstillinger og AI-funksjoner

### **Design:**
- ✅ Forbedret light mode (lyse bildbakgrunner)
- ✅ Bedre knapp-synlighet i PhotoModal
- ✅ Konsistent glassmorphism
- ✅ Smooth animasjoner

### **UX:**
- ✅ "Bilder uten album" får egen plass
- ✅ Dropdown for ulike album-visninger
- ✅ Quick access til AI-funksjoner
- ✅ Lagringsoversikt med progress bar

---

## 🔄 Tilbake til gammel versjon?

Hvis noe går galt:

```bash
# Gjenopprett backup
cp src/App.js.backup src/App.js
cp src/index.css.backup src/index.css

# Restart
npm start
```

---

## 📝 Neste steg

Etter vellykket installasjon, se **PROJECT.md** for:
- Full prosjektoversikt
- Fremtidig utviklingsplan
- Fase 2-6 implementering

---

## 💡 Tips

1. **Test grundig** før du committer til Git
2. **Ta screenshots** av før/etter for dokumentasjon
3. **Test på mobil** - bruk Chrome DevTools responsive mode
4. **Sjekk console** for eventuelle feil/warnings

---

## 🎉 Ferdig!

Du har nå PhotoVault v4.0 med helt ny navigasjon og design!

**Neste fase:** Performance-optimalisering (thumbnails, lazy loading)

Se **PROJECT.md** for fullstendig roadmap.

---

**Versjon:** 4.0  
**Dato:** 19. oktober 2025  
**Utvikler:** Roger / Cre8Web
