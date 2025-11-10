# Phase 6 - MVP+ Feature Roadmap

**Mål:** Forbedre retention og viral growth uten AI-kostnader  
**Tidsramme:** 4-6 uker (parallell med testing av eksisterende features)  
**Budget:** 0 NOK ekstra (kun Firebase gratis tier)

---

## 📋 Feature Overview

| Feature | Verdi | Kompleksitet | Prioritet | Tidsestimat |
|---------|-------|--------------|-----------|-------------|
| 1. QR-kode album-deling | ⭐⭐⭐⭐⭐ | ⭐⭐ | P0 | 3-5 dager |
| 2. Kollasj-maker | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | P0 | 7-10 dager |
| 3. Tidslinje-visning | ⭐⭐⭐⭐ | ⭐⭐⭐ | P1 | 5-7 dager |
| 4. Grunnleggende redigering | ⭐⭐⭐⭐ | ⭐⭐⭐ | P1 | 5-7 dager |
| 5. Samarbeids-album | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | P2 | 10-14 dager |

**Total estimat:** 30-43 dager arbeid

---

## 🎯 Implementasjonsrekkefølge

### Sprint 1 (Uke 1-2): Foundation & Quick Wins
**Focus:** QR-kode deling + Tidslinje-visning
- Begge er relativt enkle
- Gir umiddelbar verdi
- Ingen komplekse dependencies

### Sprint 2 (Uke 3-4): Content Creation
**Focus:** Kollasj-maker + Grunnleggende redigering
- Mer komplekse, men standalone
- Canvas API learning curve
- Krever omfattende testing

### Sprint 3 (Uke 5-6): Collaboration
**Focus:** Samarbeids-album
- Mest kompleks feature
- Real-time sync challenges
- Krever security rules oppdatering
- Bygger på stabilt fundament

---

## 📁 Detaljerte implementasjonsplaner

Hver funksjon har sin egen detaljplan:

1. **[FEATURE_1_QR_SHARING.md](./FEATURE_1_QR_SHARING.md)**
   - QR-kode generering
   - Public album links
   - Share modal
   - Analytics tracking

2. **[FEATURE_2_COLLAGE_MAKER.md](./FEATURE_2_COLLAGE_MAKER.md)**
   - Layout engine
   - Canvas manipulation
   - Text/sticker overlay
   - Export & share

3. **[FEATURE_3_TIMELINE_VIEW.md](./FEATURE_3_TIMELINE_VIEW.md)**
   - Date grouping
   - Scroll navigation
   - "On this day" widget
   - Year overview

4. **[FEATURE_4_BASIC_EDITING.md](./FEATURE_4_BASIC_EDITING.md)**
   - Crop & rotate
   - Filters & adjustments
   - Text overlay
   - Save/revert

5. **[FEATURE_5_COLLABORATIVE_ALBUMS.md](./FEATURE_5_COLLABORATIVE_ALBUMS.md)**
   - Invite system
   - Real-time sync
   - Permissions model
   - Notification system

---

## 🏗️ Overordnet arkitektur

### Nye komponenter
```
src/
├── features/               # NEW - Feature modules
│   ├── qr-sharing/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── collage/
│   ├── timeline/
│   ├── editor/
│   └── collaboration/
│
├── components/            # Delte komponenter
│   ├── QRShareModal.jsx  # NEW
│   ├── CollageBuilder.jsx # NEW
│   ├── TimelineView.jsx  # NEW
│   ├── PhotoEditor.jsx   # NEW
│   └── InviteModal.jsx   # NEW
│
└── pages/
    ├── TimelinePage.jsx  # NEW
    └── CollagePage.jsx   # NEW
```

### Firebase-struktur endringer
```
/albums/{albumId}
  - isPublic: Boolean       # NEW - for QR-deling
  - publicSlug: String      # NEW - kortlenke
  - collaborators: Array    # NEW - for samarbeids-album
  - createdBy: String       # NEW - original creator

/collages/{collageId}      # NEW collection
  - userId: String
  - photos: Array
  - layout: String
  - createdAt: Timestamp

/invitations/{inviteId}    # NEW collection
  - albumId: String
  - email: String
  - status: String
  - expiresAt: Timestamp
```

---

## ✅ Testing-strategi

### Per fase testing
Hver feature implementeres i 3-4 testbare faser:

**Fase 1: Core functionality** (Unit tests)
- Isolert funksjonalitet
- Mock data
- Edge cases

**Fase 2: UI Integration** (Integration tests)
- Komponenter fungerer sammen
- User flows
- Responsive design

**Fase 3: Firebase Integration** (E2E tests)
- Data persistence
- Real-time updates
- Security rules

**Fase 4: Polish** (User acceptance)
- Performance optimization
- Animations
- Error handling

### Testing checklist (per feature)
```
□ Desktop Chrome
□ Desktop Firefox
□ Desktop Safari
□ iOS Safari (iPhone)
□ iOS Safari (iPad)
□ Chrome Android
□ Dark mode
□ Light mode
□ Slow connection (3G)
□ Offline behavior
□ Large dataset (100+ items)
□ Empty state
□ Error states
```

---

## 🚀 Deployment-strategi

### Feature flags
```javascript
// src/config/features.js
export const FEATURES = {
  QR_SHARING: true,           // Toggle per feature
  COLLAGE_MAKER: true,
  TIMELINE_VIEW: true,
  PHOTO_EDITOR: true,
  COLLABORATIVE_ALBUMS: false, // Initially disabled
}
```

### Gradual rollout
1. Dev environment testing (1 bruker)
2. Beta testing (5-10 brukere)
3. Staged rollout (25% → 50% → 100%)
4. Monitor analytics & errors
5. Full release

---

## 📊 Success Metrics

### Per feature KPIs

**QR-kode deling:**
- Antall QR-koder generert
- Antall eksterne visninger
- Conversion rate (viewer → user)

**Kollasj-maker:**
- Antall collages laget
- Deling via sosiale medier
- Tid brukt i collage-editor

**Tidslinje-visning:**
- Engagement rate vs. grid view
- Time spent in timeline
- Scroll depth

**Grunnleggende redigering:**
- Antall bilder redigert
- Mest brukte funksjoner
- Save/cancel ratio

**Samarbeids-album:**
- Antall invitasjoner sendt
- Acceptance rate
- Bilder lastet opp av andre

### Overall metrics
- DAU (Daily Active Users) økning
- Retention rate (D1, D7, D30)
- Session length
- Storage upsell conversion

---

## ⚠️ Risk Management

### Potensielle issues

**Performance:**
- Canvas operations kan være trege på svake enheter
- *Mitigation:* Progressive enhancement, Web Workers

**Storage:**
- Collages øker storage-bruk
- *Mitigation:* Komprimering, Pro-upsell

**Real-time sync:**
- Konflikt-håndtering i samarbeids-album
- *Mitigation:* Optimistic updates, conflict resolution strategy

**Security:**
- Public album links kan misbrukes
- *Mitigation:* Rate limiting, expiry dates, report-funksjon

---

## 🔄 Dependencies & Prerequisites

### Før du starter
```bash
# Installer dependencies
npm install qrcode.react
npm install html2canvas
npm install date-fns
npm install fabric    # Canvas manipulation
```

### Firebase setup
```javascript
// Oppdater Security Rules
// Oppdater Firestore indexes
// Oppdater Storage rules for public access
```

### Environment variables
```
REACT_APP_PUBLIC_URL=https://yourapp.com
REACT_APP_SHARE_URL=https://share.yourapp.com
```

---

## 📝 Hvordan bruke disse planene

### For Claude Code

1. **Velg feature** du vil implementere
2. **Åpne relevant MD-fil** (FEATURE_X_...)
3. **Les gjennom hele planen** først
4. **Start med Fase 1** - kopier hele fase-seksjonen til Claude Code
5. **Test grundig** før du går til neste fase
6. **Rapporter issues** - oppdater MD-filen med learnings

### Eksempel-prompt til Claude Code
```
Jeg vil implementere QR-kode album-deling i PhotoVault.

Her er den komplette planen:
[Lim inn FEATURE_1_QR_SHARING.md]

Vi starter med Fase 1: Core QR Generation.
Implementer alt i Fase 1-seksjonen, følg filstrukturen nøye.
Test med de angitte test cases før du bekrefter ferdig.

Spør hvis noe er uklart.
```

---

## 🎨 Design Guidelines

### Konsistent med eksisterende design
- Twilight theme colors
- Glassmorphism effects
- Ripple interactions
- Premium bottom navigation style

### Nye UI-patterns
- **Modal størrelse:** Max 600px bredde, responsive
- **Button hierarchy:** Primary (gradient), Secondary (glass), Tertiary (ghost)
- **Spacing:** 4px grid system (0.5rem steps)
- **Animations:** 200-300ms, ease-out

---

## 💡 Tips for implementering

### Best Practices
1. **Feature folder structure** - Hold alt relatert sammen
2. **Custom hooks** - Genbrukbar logikk
3. **Error boundaries** - Per feature
4. **Loading states** - Aldri blank screens
5. **Optimistic updates** - Rask UI, sync i bakgrunnen

### Common pitfalls
- ❌ Ikke mix feature-kode i eksisterende filer
- ❌ Ikke skip testing mellom faser
- ❌ Ikke hardkode verdier - bruk config
- ❌ Ikke glem mobile testing
- ✅ Bruk feature flags
- ✅ Skriv console.logs for debugging
- ✅ Test med ekte data

---

## 📅 Recommended Schedule

### Optimal utviklingsflyt

**Uke 1:**
- Mandag-Tirsdag: QR-deling (Fase 1-3)
- Onsdag: Testing & fixes
- Torsdag-Fredag: Tidslinje-visning (Fase 1-2)

**Uke 2:**
- Mandag: Tidslinje-visning (Fase 3-4)
- Tirsdag: Testing & fixes
- Onsdag-Fredag: Kollasj-maker (Fase 1-2)

**Uke 3:**
- Mandag-Onsdag: Kollasj-maker (Fase 3-4)
- Torsdag-Fredag: Grunnleggende redigering (Fase 1-2)

**Uke 4:**
- Mandag-Tirsdag: Grunnleggende redigering (Fase 3-4)
- Onsdag-Fredag: Buffer for fixes & polish

**Uke 5-6:**
- Samarbeids-album (full fokus)
- Omfattende testing av alle features sammen
- Performance optimization

---

## 🎯 Phase 6 Success Criteria

Before considering Phase 6 complete:

- [ ] All 5 features implemented and tested
- [ ] Feature flags system working
- [ ] Analytics tracking setup
- [ ] Documentation updated
- [ ] Security rules audited
- [ ] Performance benchmarks met:
  - [ ] Page load < 2s
  - [ ] Canvas operations < 500ms
  - [ ] QR generation < 100ms
- [ ] Mobile testing complete (iOS + Android)
- [ ] Accessibility audit passed
- [ ] Beta testing with 10+ users
- [ ] Error rate < 1%
- [ ] No P0 bugs in backlog

---

**Opprettet:** 10. november 2025  
**Eier:** Roger  
**Status:** 🟡 Planning  
**Neste steg:** Review plan → Start Feature 1 implementation
