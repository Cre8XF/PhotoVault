# PIXTR - Complete Tier Roadmap

## 🎯 Strategic Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIXTR TIER STRATEGY                          │
│                                                                 │
│  GRATIS → Complete & Polish → Launch                          │
│     ↓                                                           │
│  LITE   → Add compression + 5GB                                │
│     ↓                                                           │
│  PRO    → Add video + AI features                             │
│     ↓                                                           │
│  ADMIN  → Analytics & user management                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Tier Comparison Table

| Feature | GRATIS | LITE | PRO | ADMIN |
|---------|--------|------|-----|-------|
| **Storage** | 1 GB | 5 GB | 50 GB | Unlimited |
| **Image Quality** | Original | Compressed | Compressed | Original |
| **Video Upload** | ❌ | ❌ | ✅ | ✅ |
| **Compression** | ❌ | ✅ | ✅ | ✅ (optional) |
| **Albums** | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited | ✅ All users |
| **Batch Ops** | ✅ | ✅ | ✅ | ✅ |
| **QR Sharing** | ✅ | ✅ | ✅ | ✅ |
| **Collage Builder** | ✅ Basic | ✅ Full | ✅ Premium | ✅ All modes |
| **Search** | ✅ | ✅ | ✅ | ✅ Global |
| **Captions** | ✅ | ✅ | ✅ | ✅ |
| **Slideshow** | ✅ | ✅ | ✅ Advanced | ✅ |
| **AI Auto-tag** | ❌ | ❌ | ✅ | ✅ |
| **AI Enhance** | ❌ | ❌ | ✅ | ✅ |
| **Background Removal** | ❌ | ❌ | ✅ | ✅ |
| **Duplicate Detection** | ❌ | ❌ | ✅ | ✅ |
| **Face Recognition** | ❌ | ❌ | 🔜 Future | ✅ |
| **Analytics** | ❌ | ❌ | ❌ | ✅ |
| **User Management** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 PHASE 1: GRATIS (Current Focus)

### Status: 85% Complete

#### ✅ Already Implemented
```
✅ User authentication (Firebase Auth)
✅ Photo upload (original quality)
✅ Album management (CRUD)
✅ Batch operations (select, move, delete)
✅ QR-code sharing with expiry
✅ Collage Builder (9 layouts)
✅ Search with filters
✅ Timeline view
✅ Favorites system
✅ Storage quota (1 GB)
✅ Video upload blocking
✅ Mobile-first responsive design
✅ Dark theme
✅ Norwegian/English i18n
```

#### 🔧 In Progress (This Sprint)
```
🔧 Captions/Notes per photo
🔧 Slideshow mode with controls
```

#### 📋 Testing Required
```
📋 Mobile device testing (iOS/Android)
📋 Performance benchmarks
📋 Cross-browser compatibility
📋 Norwegian translation review
📋 Edge case testing
```

#### 🎯 Launch Criteria
```
1. All features tested on mobile
2. No P0 bugs
3. 10+ beta users tested
4. Norwegian translations verified
5. Performance targets met:
   - Page load < 2s
   - Photo modal < 500ms
   - Search results < 1s
```

---

## 🔵 PHASE 2: LITE (After GRATIS Launch)

### Goal: Simple upgrade path for more storage

#### New Features
```
🆕 5 GB storage quota
🆕 Image compression toggle
🆕 Compression quality selector (Low/Medium/High)
🆕 Auto-compress on upload (default ON)
🆕 Batch compress existing photos
🆕 Storage savings indicator
```

#### Implementation Steps
1. Update `useAuth.js` - Add compression logic
2. Update `useUpload.js` - Add compression step
3. Update `UploadModal.jsx` - Add compression toggle
4. Update `SubscriptionPage.jsx` - Show savings
5. Add compression utilities in `utils/imageCompression.js`

#### Estimated Effort
- Development: 1-2 days
- Testing: 1 day
- Total: 2-3 days

---

## 🟣 PHASE 3: PRO (After LITE Stable)

### Goal: Premium features for power users

#### New Features
```
🆕 Video upload & playback
🆕 Video thumbnail generation
🆕 50 GB storage quota
🆕 AI Auto-tagging (Google Vision)
🆕 AI Image enhancement (Picsart)
🆕 Background removal tool
🆕 Duplicate photo detection
🆕 Advanced collage templates
🆕 ZIP export with metadata
🆕 Priority support
```

#### Implementation Steps
1. **Video Support** (Already 90% done)
   - Enable video upload for PRO
   - Test iOS/Android playback
   - Optimize thumbnail generation

2. **AI Integration**
   - Google Vision API setup
   - Auto-tagging on upload
   - Batch tag existing photos
   - AI categories

3. **Advanced Tools**
   - Picsart API for enhancement
   - Background removal API
   - Duplicate detection algorithm

4. **Premium UX**
   - Advanced collage layouts
   - Custom templates
   - Export options

#### Estimated Effort
- Development: 2-3 weeks
- API integration: 1 week
- Testing: 1 week
- Total: 4-5 weeks

---

## 🔴 PHASE 4: ADMIN (After PRO Launch)

### Goal: Platform management & analytics

#### New Features
```
🆕 User management dashboard
🆕 Analytics & insights
🆕 System health monitoring
🆕 Content moderation tools
🆕 Subscription management
🆕 Revenue tracking
🆕 Global search across all users
🆕 Backup & restore tools
🆕 Feature flag management
```

#### Implementation Steps
1. Admin authentication & roles
2. Analytics dashboard (Chart.js)
3. User management UI
4. System monitoring
5. Moderation queue
6. Subscription analytics

#### Estimated Effort
- Development: 2-3 weeks
- Dashboard design: 1 week
- Testing: 1 week
- Total: 4-5 weeks

---

## 📅 Timeline Estimate

```
GRATIS  → 1 week   (captions + slideshow + testing)
Launch  → 2 weeks  (beta testing + fixes)
LITE    → 3 days   (compression implementation)
PRO     → 5 weeks  (video + AI features)
ADMIN   → 5 weeks  (dashboard + analytics)

Total: ~13 weeks from now to full platform
```

---

## 💰 Cost Optimization Strategy

### Current Costs (POST-LAUNCH - R2 MIGRATED)
```
Cloudflare R2 (Primary Storage):
- 10 GB storage: FREE
- Egress: FREE (unlimited)
- Operations: ~50 NOK/month

Firebase (Blaze):
- Firestore: ~50-100 NOK/month
- Auth: Free (up to 10K users)
- Storage: Minimal (fallback only, ~20 NOK/month)

Total without AI: ~200-300 NOK/month (50% reduction!)
```

### With AI Features (PRO Tier)
```
Google Vision API:
- Auto-tagging: ~0.01 NOK per image
- 1000 images/month = ~100 NOK

Picsart API:
- Enhancement: ~0.50 NOK per image
- 100 enhancements/month = ~500 NOK

Background Removal:
- Remove.bg API: ~1.00 NOK per image
- 50 removals/month = ~500 NOK

AI Total: ~1100 NOK/month (if heavily used)
```

### Launch Strategy
```
Phase 1: Launch GRATIS without AI ✅ R2 MIGRATED
         → Build user base
         → Keep costs minimal (200-300 NOK/month)
         → 50% cost reduction vs Firebase Storage

Phase 2: Add LITE (compression)
         → Generate revenue (29 NOK × N users)
         → Cover baseline costs

Phase 3: Add PRO when revenue > 3000 NOK/month
         → Enable AI features
         → Margin: 79 NOK - AI costs ≈ 40-60 NOK profit/user

Goal: 100 PRO users = 7900 NOK/month revenue
                      - 1500 NOK costs (R2 savings!)
                      = 6400 NOK profit/month
```

---

## 🎯 Success Metrics

### GRATIS Launch
```
Week 1:  50 users
Week 4:  200 users
Week 12: 500 users
```

### LITE Conversion
```
Target: 10% of GRATIS users
Week 1:  5 LITE users
Week 4:  20 LITE users
Week 12: 50 LITE users
Revenue: 50 × 29 NOK = 1,450 NOK/month
```

### PRO Conversion
```
Target: 5% of LITE users, 1% of GRATIS
Week 1:  2 PRO users
Week 4:  10 PRO users
Week 12: 25 PRO users
Revenue: 25 × 79 NOK = 1,975 NOK/month
```

### 6-Month Goal (WITH R2 MIGRATION)
```
500 GRATIS (free)
50 LITE (1,450 NOK)
25 PRO (1,975 NOK)
Total Revenue: 3,425 NOK/month
Total Costs: 300 NOK/month (R2 savings!)
Net Profit: 3,125 NOK/month (+10% vs Firebase)
```

---

## 🔐 Security & Privacy

### Implemented
```
✅ Firebase Authentication
✅ Firestore Security Rules
✅ User-specific data isolation
✅ Secure file uploads
✅ HTTPS everywhere
```

### To Implement (PRO)
```
🔜 End-to-end encryption (vault)
🔜 2FA authentication
🔜 Biometric unlock (mobile)
🔜 Password-protected shares
🔜 Watermarking
```

---

## 📱 Platform Support

### Current (GRATIS)
```
✅ Web (Desktop Chrome/Firefox/Safari)
✅ Web (Mobile Chrome/Safari)
✅ PWA (installable)
✅ Responsive design
```

### Future (PRO)
```
🔜 Native iOS app (Capacitor)
🔜 Native Android app (Capacitor)
🔜 Desktop app (Electron)
🔜 Browser extensions
```

---

## 🌍 Internationalization

### Current
```
✅ Norwegian (Bokmål)
✅ English
```

### Future
```
🔜 Swedish
🔜 Danish
🔜 German
🔜 Spanish
```

---

## 🎨 Design System

### Current Theme
```
✅ Dark mode (default)
✅ Glass morphism
✅ Purple/pink gradients
✅ Smooth animations
✅ Tailwind CSS
```

### Future
```
🔜 Light mode
🔜 Custom themes
🔜 Accent color picker
🔜 Font size options
🔜 Accessibility improvements
```

---

## 🏁 Ready to Start?

### Next Steps:
1. ✅ Read `PIXTR_FREE_TIER_IMPLEMENTATION.md`
2. ✅ Use Claude Code to implement captions
3. ✅ Use Claude Code to implement slideshow
4. ✅ Follow `PIXTR_TESTING_GUIDE.md`
5. ✅ Deploy to staging
6. ✅ Beta test with 10 users
7. ✅ Fix critical bugs
8. ✅ Launch GRATIS tier
9. 🔜 Plan LITE tier

---

**Lykke til med implementeringen! 🚀**

---

**Last Updated**: 2025-12-21
**Version**: 1.1
**Status**: GRATIS complete, R2 migrated, ready for launch
