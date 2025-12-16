# PIXTR REVIEW WORKFLOW - QUICK START

**Mål:** Systematisk gjennomgang og forbedring av Pixtr med fokus på Photo Edit og Collage Builder.

---

## PROSESS OVERSIKT

```
1. Claude Code → Kartlegging & Testing → Statusrapport
2. Claude.ai → Analyse → Handlingsplan  
3. Claude Code → Implementering → Ferdig produkt
```

---

## STEG 1: CLAUDE CODE - KARTLEGGING

### 1.1 Forberedelse

**Åpne Claude Code i terminal:**
```bash
cd /path/to/pixtr-project
claude-code
```

**Sørg for at disse filene er tilgjengelige i prosjektet:**
- `FUNKSJONSOVERSIKT.md` (i project root eller docs/)
- Alle source files i `src/`

---

### 1.2 Gi Claude Code oppgaven

**Copy/paste innholdet fra:** `01-CLAUDE-CODE-PROMPT.md`

**Eller gi forenklet versjon:**
```
Les FUNKSJONSOVERSIKT.md og gjennomfør systematisk testing av Pixtr:

1. Start med KRITISKE FUNKSJONER:
   - Collage Builder V3 (alle 12 layouts, live preview, reposition, zoom, state, navigation)
   - Photo Editor (crop, rotate, filters, save, undo/redo)

2. Gå deretter gjennom alle 6 hovedsider systematisk

3. Sjekk teknisk validering:
   - State management (Zustand + useState)
   - Data flow (Firebase → usePhotoData → App → Pages)
   - Integrasjoner (Firebase, i18n, Capacitor)
   - AI-funksjoner (VERIFISER at alt er deaktivert)

4. Identifiser inkonsistenser:
   - Dokumentasjon vs implementasjon
   - Props flow problemer
   - Code quality issues

5. Foreslå forbedringer:
   - Performance
   - UX
   - Manglende features
   - Code quality

Lag detaljert statusrapport basert på template i 02-STATUSRAPPORT-TEMPLATE.md
```

---

### 1.3 La Claude Code jobbe

**Claude Code vil:**
- ✅ Lese alle relevante filer
- ✅ Analysere implementasjonen
- ✅ Sammenligne med dokumentasjonen
- ✅ Teste (statisk analyse) alle funksjoner
- ✅ Identifisere problemer og muligheter
- ✅ Generere komplett statusrapport

**Forventet tid:** 15-30 minutter

---

### 1.4 Motta statusrapporten

**Claude Code vil generere fil:**
```
PIXTR-STATUSRAPPORT-[DATO].md
```

**Lagre denne i:** `docs/reports/`

---

## STEG 2: CLAUDE.AI - ANALYSE

### 2.1 Last opp statusrapporten til meg (Claude.ai)

**I denne chatten, si:**
```
Her er statusrapporten fra Claude Code. Kan du analysere den og lage 
detaljert handlingsplan?
```

**Attach filen:** `PIXTR-STATUSRAPPORT-[DATO].md`

---

### 2.2 Jeg analyserer og prioriterer

**Jeg vil:**
- 📊 Analysere alle funn fra statusrapporten
- 🎯 Prioritere issues (A/B/C)
- 🔧 Lage detaljerte instruksjoner for hver fix
- 💡 Foreslå forbedringer og nye features
- 📋 Lage komplett handlingsplan

**Min output:**
```
PIXTR-HANDLINGSPLAN-[DATO].md
```

**Inneholder:**
- A-prioritet: Kritiske fixes med eksakte instrukser til Claude Code
- B-prioritet: Viktige forbedringer med instrukser
- C-prioritet: Nice-to-have features
- Implementeringsplan (rekkefølge)
- Testing-strategi
- Deployment-plan

---

### 2.3 Du godkjenner plan

**Gjennomgå handlingsplanen og si:**

**Alternativ 1 - Godkjenn alt:**
```
Ser bra ut! Start med A-prioritet fixes.
```

**Alternativ 2 - Juster prioriteringer:**
```
Kan vi flytte Issue #B3 til A-prioritet? Det er viktigere enn jeg trodde.
Og Issue #A5 kan vente til post-launch.
```

**Alternativ 3 - Spør om spesifikke ting:**
```
Kan du utdype Issue #A2 mer? Jeg er usikker på løsningen.
```

---

## STEG 3: CLAUDE CODE - IMPLEMENTERING

### 3.1 Første fix

**Gå tilbake til Claude Code, gi instruksjon:**

**Fra handlingsplanen, copy/paste Issue #A1 instruksjonen:**

```
## Oppgave: [Fra handlingsplan - Issue #A1]

[Hele den detaljerte instruksjonen jeg har laget]

Implementer dette nå, test grundig, og rapporter tilbake.
```

---

### 3.2 Claude Code implementerer

**Claude Code vil:**
- ✅ Lese de spesifiserte filene
- ✅ Gjøre endringene
- ✅ Teste (compile check, basic validation)
- ✅ Rapportere tilbake med hva som ble gjort

---

### 3.3 Du verifiserer

**Test manuelt:**
```bash
npm run dev
```

**Sjekk:**
- [ ] Fungerer som forventet
- [ ] Ingen nye bugs
- [ ] Konsoll er ren

**Hvis OK:**
```bash
git add .
git commit -m "Fix: [Issue #A1 description]"
```

**Hvis ikke OK:**
Gi Claude Code feedback og be om justering.

---

### 3.4 Gjenta for alle A-prioritet issues

**For Issue #A2:**
Copy/paste Issue #A2 instruksjon fra handlingsplan → Claude Code → Test → Commit

**For Issue #A3:**
[Samme prosess]

---

## STEG 4: FULL TESTING FØR LAUNCH

### 4.1 Manual Testing

**Gå gjennom testing checklist fra handlingsplanen:**

**Collage Builder:**
- [ ] Alle 12 layouts
- [ ] Live preview
- [ ] Reposition
- [ ] Zoom
- [ ] Save & navigation

**Photo Editor:**
- [ ] Crop
- [ ] Rotate
- [ ] Filters
- [ ] Save
- [ ] Undo/redo

**Kritiske flows:**
- [ ] Login → Upload → Album
- [ ] Create Collage
- [ ] Edit Photo
- [ ] Search/Filter

**Cross-browser:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari

**i18n:**
- [ ] Norsk
- [ ] Engelsk

---

### 4.2 Performance Check

**Sjekk Chrome DevTools:**
- Lighthouse score
- Network requests
- Console errors

**Firebase:**
- Database reads/writes ser normale ut
- Storage usage ser OK ut

---

## STEG 5: DEPLOYMENT

### 5.1 Pre-deployment

```bash
# Backup current state
git tag v1.0-pre-launch

# Build production
npm run build

# Verify build
# Test the build locally if possible
```

---

### 5.2 Deploy

**Via Netlify:**
```bash
# If using Netlify CLI
netlify deploy --prod

# Or just push to Git (if auto-deploy enabled)
git push origin main
```

---

### 5.3 Post-deployment verification

**Smoke test i production:**
- [ ] Login works
- [ ] Upload works
- [ ] Album creation works
- [ ] Collage builder works
- [ ] Photo editor works

**Monitor:**
- Check browser console for errors
- Watch Firebase usage
- Keep an eye on any error reporting

---

### 5.4 Tag release

```bash
git tag v1.0-launch
git push origin v1.0-launch
```

---

## POST-LAUNCH

### B-Prioritet fixes

**Etter launch stabiliseres:**
1. Implementer B-prioritet issues (samme prosess som A-prioritet)
2. Deploy forbedringer inkrementelt
3. Monitor user feedback

---

### C-Prioritet features

**Når du er klar:**
1. Velg features fra C-prioritet basert på:
   - User feedback
   - Analytics
   - Business priorities
2. Implementer med Claude Code
3. Test og deploy

---

## TIPS & BEST PRACTICES

### Kommunikasjon med Claude Code

**Vær spesifikk:**
✅ "Implement Issue #A1 from the action plan"
❌ "Fix the collage builder"

**Gi kontekst:**
✅ "Before making changes, read HomeDashboard.jsx and show me lines 45-60"
❌ "Change this file"

**Verifiser før neste steg:**
✅ Test hver fix før du går videre
❌ Implementer alt på en gang uten testing

---

### Kommunikasjon med Claude.ai (meg)

**Be om klarifisering:**
✅ "Kan du forklare Issue #A3 mer detaljert?"
❌ [Bare implementer uten å forstå]

**Rapporter tilbake:**
✅ "Issue #A1 og #A2 er ferdig. Her er hva jeg observerte..."
❌ [Stille implementering uten feedback]

**Juster prioriteringer:**
✅ "Etter testing ser jeg at B5 er mer kritisk enn A4. Kan vi bytte?"
❌ [Følg planen blindt selv om du ser noe annet]

---

### Git Hygiene

**Commit messages:**
```bash
# Good
git commit -m "Fix: Collage Builder state management issue (A1)"
git commit -m "Enhancement: Improve photo upload UX (B3)"

# Bad
git commit -m "Fixed stuff"
git commit -m "Changes"
```

**Branch strategi (optional):**
```bash
# For større changes, bruk branches
git checkout -b fix/collage-builder-state
# ... make changes, test ...
git checkout main
git merge fix/collage-builder-state
```

---

## TROUBLESHOOTING

### Issue: Claude Code ikke forstår oppgaven

**Løsning:**
1. Break down til mindre oppgaver
2. Gi mer kontekst (vis relevante filer først)
3. Be om plan før implementering: "Lag en plan for hvordan du vil løse dette først"

---

### Issue: Fix introduserer nye bugs

**Løsning:**
1. Rollback: `git revert [commit-hash]`
2. Analyser hva som gikk galt
3. Diskuter med Claude.ai for bedre approach
4. Prøv igjen med justert instruksjon

---

### Issue: Usikker på om noe er fikset riktig

**Løsning:**
1. Last opp relevant kode til Claude.ai
2. Spør: "Kan du verifisere at denne fix'en løser problemet riktig?"
3. Be om testing-strategi: "Hvordan kan jeg teste at dette fungerer?"

---

## OPPSUMMERING

**Prosessen i korthet:**

1. **Claude Code:** Les, analyser, rapporter → `STATUSRAPPORT.md`
2. **Claude.ai:** Analyser rapport, prioriter, lag instrukser → `HANDLINGSPLAN.md`
3. **Du:** Godkjenn plan, evt juster
4. **Claude Code:** Implementer fixes én om gangen basert på instrukser
5. **Du:** Test hver fix, commit
6. **Repeat** til alle A-prioritet fixes er ferdig
7. **Full testing**
8. **Deploy**
9. **Monitor**
10. **B og C-prioritet** etter launch

---

## NESTE STEG

**Start nå:**

1. Gå til Claude Code
2. Copy/paste `01-CLAUDE-CODE-PROMPT.md`
3. La den generere statusrapport
4. Send statusrapporten til meg (Claude.ai)
5. Jeg lager handlingsplan
6. Implementer med Claude Code

---

**Du har alle verktøy du trenger. Lykke til! 🚀**

---

**Workflow Guide av:** Claude.ai  
**Versjon:** 1.0  
**Dato:** [DATO]
