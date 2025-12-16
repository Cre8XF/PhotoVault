# Pixtr Review & Improvement Workflow

Komplett dokumentasjon for systematisk gjennomgang og forbedring av Pixtr/PhotoVault med fokus på Photo Edit og Collage Builder.

---

## 📁 Filer i dette settet

### **00-QUICK-START-GUIDE.md**
**Hva:** Steg-for-steg guide for hele prosessen  
**Bruk:** Les denne først for å forstå workflow  
**For hvem:** Deg (Roger)  

**Inneholder:**
- Oversikt over hele prosessen
- Detaljerte steg for hver fase
- Tips & best practices
- Troubleshooting

---

### **01-CLAUDE-CODE-PROMPT.md**
**Hva:** Detaljert oppgave til Claude Code  
**Bruk:** Copy/paste til Claude Code for å starte kartlegging  
**For hvem:** Claude Code  

**Inneholder:**
- Komplett instruksjon for systematisk gjennomgang
- Testing-kriterier for hver funksjon
- Rapportformat
- Fokus på Collage Builder & Photo Editor

**Estimert tid:** Claude Code vil bruke 15-30 minutter

---

### **02-STATUSRAPPORT-TEMPLATE.md**
**Hva:** Template for statusrapporten Claude Code skal generere  
**Bruk:** Referanse for hvordan rapporten skal se ut  
**For hvem:** Claude Code (veiledning) + Deg (for å forstå hva som kommer)  

**Inneholder:**
- Struktur for statusrapport
- Alle seksjoner som skal sjekkes
- Format for rapportering av problemer og forbedringsforslag
- Prioriteringsforslag

**Output:** Claude Code genererer `PIXTR-STATUSRAPPORT-[DATO].md`

---

### **03-HANDLINGSPLAN-TEMPLATE.md**
**Hva:** Template for handlingsplanen jeg (Claude.ai) skal generere  
**Bruk:** Referanse for hvordan handlingsplanen vil se ut  
**For hvem:** Deg (for å forstå hva som kommer) + Claude Code (vil motta instrukser herfra)  

**Inneholder:**
- A/B/C prioriterte issues med eksakte instrukser
- Implementeringsplan (rekkefølge)
- Testing-strategi
- Deployment-plan
- Post-launch roadmap

**Output:** Jeg (Claude.ai) genererer `PIXTR-HANDLINGSPLAN-[DATO].md`

---

## 🚀 Hvordan bruke disse filene

### Fase 1: Kartlegging (Claude Code)

```bash
# I Claude Code terminal
cd /path/to/pixtr-project

# Start Claude Code
claude-code
```

**Så copy/paste innholdet fra:**  
→ `01-CLAUDE-CODE-PROMPT.md`

**Claude Code vil generere:**  
→ `PIXTR-STATUSRAPPORT-[DATO].md`

---

### Fase 2: Analyse (Claude.ai)

**I denne chatten med meg, si:**
```
Her er statusrapporten fra Claude Code. Kan du analysere og lage handlingsplan?
```

**Attach filen:**  
→ `PIXTR-STATUSRAPPORT-[DATO].md`

**Jeg genererer:**  
→ `PIXTR-HANDLINGSPLAN-[DATO].md`

---

### Fase 3: Implementering (Claude Code)

**Gå tilbake til Claude Code, copy/paste instrukser fra handlingsplanen:**

**Eksempel:**
```
Fra PIXTR-HANDLINGSPLAN-[DATO].md, Issue #A1:

[Copy/paste hele Issue #A1 instruksjonen]

Implementer dette nå.
```

**Gjenta for alle A-prioritet issues.**

---

## 📂 Mappestruktur (anbefalt)

```
pixtr-project/
├── docs/
│   ├── workflow/                          # ← Disse filene
│   │   ├── 00-QUICK-START-GUIDE.md
│   │   ├── 01-CLAUDE-CODE-PROMPT.md
│   │   ├── 02-STATUSRAPPORT-TEMPLATE.md
│   │   └── 03-HANDLINGSPLAN-TEMPLATE.md
│   │
│   ├── reports/                           # ← Genererte rapporter
│   │   └── PIXTR-STATUSRAPPORT-2025-XX-XX.md
│   │
│   └── plans/                             # ← Genererte planer
│       └── PIXTR-HANDLINGSPLAN-2025-XX-XX.md
│
├── src/                                   # ← Din source code
└── FUNKSJONSOVERSIKT.md                  # ← Din feature overview
```

---

## ⚡ Quick Reference

### Når skal jeg bruke hvilken fil?

| Situasjon | Fil å bruke |
|-----------|-------------|
| Jeg er usikker på prosessen | `00-QUICK-START-GUIDE.md` |
| Skal starte kartlegging med Claude Code | `01-CLAUDE-CODE-PROMPT.md` |
| Vil forstå hva statusrapporten inneholder | `02-STATUSRAPPORT-TEMPLATE.md` |
| Vil forstå hva handlingsplanen inneholder | `03-HANDLINGSPLAN-TEMPLATE.md` |
| Claude Code har generert rapport | Send til Claude.ai for analyse |
| Claude.ai har generert handlingsplan | Bruk med Claude Code for implementering |

---

## 🎯 Fokusområder

Denne prosessen har spesiell fokus på:

1. **Collage Builder V3**
   - Alle 12 layouts
   - Live preview
   - Image repositioning
   - Zoom capabilities
   - State management
   - Navigation & save

2. **Photo Editor**
   - Crop/Rotate
   - Filters
   - Save functionality
   - Undo/redo

3. **Kritiske funksjoner**
   - Album management
   - Photo upload
   - Search & filter
   - Authentication

4. **Teknisk kvalitet**
   - State management
   - Data flow
   - Props validation
   - Performance
   - Code quality

---

## ✅ Forventet Output

Etter å ha gått gjennom hele prosessen, vil du ha:

1. **Komplett oversikt** over Pixtr's tilstand
2. **Prioritert liste** av hva som må fikses
3. **Eksakte instrukser** for hver fix
4. **Testing-strategi** for kvalitetssikring
5. **Deployment-plan** for launch
6. **Post-launch roadmap** for videre utvikling

---

## 💡 Tips

**For best resultat:**

1. ✅ **Start med Quick Start Guide** - les den først
2. ✅ **Ha FUNKSJONSOVERSIKT.md tilgjengelig** - Claude Code trenger den
3. ✅ **Test hver fix individuelt** - ikke implementer alt på en gang
4. ✅ **Kommuniser tilbake** - fortell meg (Claude.ai) hva du opplever
5. ✅ **Juster prioriteringer** - du kjenner produktet best

**Unngå:**

1. ❌ Hoppe over testing mellom fixes
2. ❌ Implementere uten å forstå problemet
3. ❌ Følge planen blindt hvis du ser noe annet
4. ❌ Committe uten å verifisere at det fungerer

---

## 🆘 Trenger hjelp?

**Under prosessen:**

1. **Usikker på noe i statusrapporten?**  
   → Spør meg (Claude.ai) om klarifisering

2. **Fix fungerer ikke som forventet?**  
   → Rapporter tilbake til Claude.ai for alternativ løsning

3. **Claude Code forstår ikke oppgaven?**  
   → Break down til mindre oppgaver eller be om plan først

4. **Ny bug introdusert?**  
   → Rollback med Git, diskuter med Claude.ai for bedre approach

---

## 🎓 Lær mer

**Relaterte dokumenter i prosjektet:**
- `FUNKSJONSOVERSIKT.md` - Komplett feature overview
- `README.md` - Prosjekt README
- `CHANGELOG.md` - Endringslogg (hvis den finnes)

---

## 📝 Versjonering

**Workflow Version:** 1.0  
**Laget for:** Pixtr/PhotoVault MVP  
**Dato:** November 2025  
**Laget av:** Claude.ai

---

## 🚀 Start her

1. Les `00-QUICK-START-GUIDE.md` grundig
2. Åpne Claude Code
3. Copy/paste `01-CLAUDE-CODE-PROMPT.md`
4. La Claude Code generere statusrapport
5. Send statusrapporten til Claude.ai
6. Motta handlingsplan
7. Implementer med Claude Code
8. Test grundig
9. Deploy
10. Launch! 🎉

---

**Lykke til med gjennomgangen! 🚀**

Hvis du har spørsmål underveis, bare spør meg (Claude.ai) i denne chatten.
