# 🚀 QUICK START: MASTER REFACTOR

## TL;DR

Dette er en stor refactor (8 timer) som gir deg Google Photos-kvalitet.

**Hva den fikser:**
- ✅ Image alltid fullt synlig (ikke bak panel)
- ✅ Real-time crop preview (ser resultat mens du drar)
- ✅ Smooth panel transitions
- ✅ Mobile-optimized performance

---

## 📝 HVORDAN BRUKE DENNE REFACTOREN

### Steg 1: Backup først
```bash
git branch backup-before-refactor
git commit -am "Backup before master refactor"
```

### Steg 2: Start Claude Code
```bash
cd /path/to/pixtr
claude-code
```

### Steg 3: Gi denne prompten til Claude Code

**VIKTIG:** Kopier og lim inn **hele** MASTER_REFACTOR_PATCH.md

**ELLER** bruk denne korte versjonen:

```
Read the complete file: MASTER_REFACTOR_PATCH.md

Then implement in this order:
1. FASE 1: Viewport Dynamic Sizing System
2. Test thoroughly - commit when stable
3. FASE 2: Real-Time Crop Canvas Rendering
4. Test thoroughly - commit when stable
5. FASE 3: Panel/Viewport Integration
6. Test thoroughly - commit when stable
7. FASE 4: Mobile Touch Optimization
8. Final testing - commit when complete

CRITICAL:
- Commit after EACH fase
- Test BEFORE moving to next fase
- If bugs appear, stop and fix before continuing
- Use the exact commit messages provided in the patch

Start with FASE 1 now.
```

---

## ⚠️ VIKTIGE REGLER

### ✅ Gjør dette:
1. **Commit etter hver fase** - Ikke gjør alt på en gang
2. **Test mellom hver fase** - Åpne editor og test på mobil
3. **Les error messages** - Hvis Claude Code feiler, les nøye
4. **Ta screenshots** - Dokumenter før/etter
5. **USB debugging** - Test på faktisk mobil, ikke bare emulator

### ❌ Ikke gjør dette:
1. **Ikke skip testing** - Dette er komplekst, bugs kan snike seg inn
2. **Ikke aksepter "nesten fungerer"** - Enten fungerer det eller så må det fikses
3. **Ikke gå videre hvis fase 1 feiler** - Fix først, fortsett senere
4. **Ikke test kun på desktop** - Mobile er kritisk her

---

## 🧪 TESTING ETTER HVER FASE

### Fase 1 Testing (Viewport Sizing)
```
1. Åpne editor
2. Trykk Crop tool
3. CHECK: Er HELE bildet synlig? (ikke halvparten bak panel)
4. Lukk Crop tool
5. CHECK: Scaler bildet opp smooth?
```

### Fase 2 Testing (Crop Preview)
```
1. Åpne Crop tool
2. Dra en handle
3. CHECK: Ser du BARE cropped area? (ikke full image + overlay)
4. Endre aspect ratio (1:1)
5. CHECK: Oppdaterer preview UMIDDELBART?
```

### Fase 3 Testing (Integration)
```
1. Åpne/lukk Crop tool flere ganger
2. CHECK: Smooth transitions hver gang?
3. CHECK: Ingen layout jumps?
4. CHECK: Console errors?
```

### Fase 4 Testing (Mobile Performance)
```
1. Test på mobil via USB
2. Dra crop handles raskt
3. CHECK: Smooth? (ikke laggy)
4. CHECK: Touch targets fungerer?
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot read property 'current' of undefined"
**Løsning:** 
- Check at alle refs er initialisert
- Verifiser at useRef er korrekt importert

### Problem: Image forsvinner helt
**Løsning:**
- Check availableHeight beregning
- Verifiser at hasActivePanel prop passes korrekt
- Console.log availableHeight verdien

### Problem: Laggy crop handle dragging
**Løsning:**
- Verifiser at throttling er implementert (16ms)
- Check at lastUpdateRef eksisterer
- Test på faktisk device (ikke emulator)

### Problem: Panel åpner men image scaler ikke
**Løsning:**
- Check at useEffect i EditorPage.jsx triggers
- Verifiser at window resize event dispatches
- Check at EditorViewport lytter til hasActivePanel

---

## 📊 FORVENTET RESULTAT

### Før refactor:
- ❌ Halvparten av bilde bak panel
- ❌ Må trykke Apply for å se crop
- ❌ Image scaler ikke
- ❌ Laggy på mobil

### Etter refactor:
- ✅ Hele bilde alltid synlig
- ✅ Real-time crop preview
- ✅ Image auto-scales smooth
- ✅ 60fps på mobil
- ✅ 95% Google Photos-kvalitet

---

## ⏱️ TIDSESTIMAT

| Fase | Tid | Beskrivelse |
|------|-----|-------------|
| Fase 1 | 2t | Viewport sizing system |
| Fase 2 | 2.5t | Crop preview rendering |
| Fase 3 | 1.5t | Panel integration |
| Fase 4 | 1t | Mobile optimization |
| Testing | 1t | Grundig testing |
| **Total** | **8t** | Komplett refactor |

**Realistisk:** Ta 2 dager hvis du jobber 4-5 timer per dag.

---

## 🎯 SUCCESS CHECKLIST

Når alt er ferdig, sjekk at:

- [ ] Hele bildet er synlig når crop panel er åpen
- [ ] Crop preview oppdaterer i real-time mens du drar
- [ ] Aspect ratio endring gir instant feedback
- [ ] Panel åpner/lukker smooth (0.25s transition)
- [ ] Touch targets er 44px+ på mobil
- [ ] Ingen lag når du drar crop handles
- [ ] Apply Crop → Clear Crop workflow fungerer
- [ ] Tested på faktisk mobil device (ikke bare emulator)
- [ ] Ingen console errors eller warnings
- [ ] Side-by-side sammenligning med Google Photos ser bra ut

---

## 🚨 HVIS DU STÅR FAST

### Scenario 1: Fase 1 feiler
```bash
# Rollback
git reset --hard HEAD~1

# Prøv igjen, men be Claude Code om:
"Read EditorViewport.jsx carefully first, then show me 
the exact diff you'll apply before making changes"
```

### Scenario 2: Testing avdekker bugs
```bash
# Ikke gå videre!
# Fix bug først
# Be Claude Code:
"There's a bug where [beskrivelse]. 
Read the relevant files and fix this specific issue."
```

### Scenario 3: Alt braker sammen
```bash
# Full rollback
git reset --hard backup-before-refactor

# Start fresh Claude Code session
# Prøv en fase om gangen med mer testing
```

---

## 💬 KOMMUNIKASJON MED CLAUDE CODE

### ✅ Gode prompts:
```
"Implement FASE 1 from MASTER_REFACTOR_PATCH.md"
"Show me the diff before applying changes"
"Test reveals X doesn't work - fix it"
```

### ❌ Dårlige prompts:
```
"Fix editor" (for vagt)
"Make it work like Google Photos" (ingen spesifikk guidance)
"Just do everything at once" (for risikabelt)
```

---

## 📸 DOKUMENTASJON

Ta screenshots underveis:
1. **Før refactor** - Nåværende state
2. **Etter Fase 1** - Image sizing
3. **Etter Fase 2** - Crop preview
4. **Etter Fase 4** - Final result
5. **Google Photos comparison** - Side-by-side

---

## 🎉 LAUNCH READY?

Når alle faser er ferdig og testet:

- [ ] Full testing checklist completed
- [ ] Mobile testing done via USB
- [ ] No console errors
- [ ] Performance is smooth (60fps)
- [ ] UI matches Google Photos 95%

**👉 Da er du klar til å lansere!**

---

**Lykke til med refactoren! 🚀**

Ta deg tid, test grundig, og du får en editor du kan være stolt av.
