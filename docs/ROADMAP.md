# PhotoVault - Product Roadmap

**Last Updated:** November 1, 2025  
**Strategy:** Cost-Effective MVP → AI Activation → Advanced Features  
**Timeline:** 12-18 months to full feature set

---

## 🎯 Roadmap Overview

```
NOW          3 months       6 months       12 months      18 months
 │               │              │              │              │
 │   PHASE 1     │   PHASE 2    │   PHASE 3    │   PHASE 4    │   PHASE 5
 │     MVP       │  AI Features │Vault & Share │Collaboration │  Native Apps
 │  (No AI)      │  Activation  │              │              │     & PWA
 │               │              │              │              │
 └───────────────┴──────────────┴──────────────┴──────────────┴──────────────>
```

**Philosophy:** Start small and stable, add complexity when demand justifies cost.

---

## 🚀 Phase 1: MVP Launch (No AI)
**Duration:** 4-6 weeks  
**Status:** 🟡 In Progress  
**Goal:** Launch stable, cost-free product to validate market demand

### Features
✅ **User Authentication**
- Email/password login
- Registration
- Password reset
- Firebase Auth integration

✅ **Photo Management**
- Upload with compression
- Delete photos
- Favorite toggle
- Manual tagging

✅ **Album System**
- Create/edit/delete albums
- Set cover images
- Photo counts
- Album grid view

✅ **Gallery & Viewing**
- Grid view with lazy loading
- Full-screen viewer
- Photo navigation
- Info panel

✅ **Search & Filter**
- Text search (title/tags)
- Filter by favorites
- Filter by date/category
- "No Album" filter

✅ **UI/UX**
- Dark/Light theme
- Norwegian/English i18n
- Responsive design
- Bottom navigation

### Technical Deliverables
- [x] Core features functional
- [x] Firebase integrated
- [x] Netlify deployment
- [ ] AI features disabled with "Coming Soon" modals
- [ ] ComingSoonModal.jsx component
- [ ] i18n translations for deferred features
- [ ] Firebase budget alerts configured

### Success Metrics
- **Users:** 100-500 in first 3 months
- **Uptime:** 99%+ (Firebase reliability)
- **Cost:** 0-100 NOK/month (within free tier)
- **Feedback:** Collect via support email and in-app modal

### Cost Projection
| Item | Cost |
|------|------|
| Firebase (free tier) | 0 NOK |
| Netlify (free tier) | 0 NOK |
| Domain (optional) | 150-200 NOK/year |
| Google Play Store | 270 NOK (one-time) |
| **Total Year 1** | **~400-600 NOK** |

---

## 🤖 Phase 2: AI Features Activation
**Duration:** 6-8 weeks  
**Status:** 📅 Planned (Month 3-5)  
**Goal:** Add AI-powered intelligence when user base justifies cost

### Trigger Conditions
Activate when **any** of these are met:
- 500+ active users
- 50+ requests for AI features via feedback
- Pro subscriptions generating revenue
- 3+ months of stable operation

### Features to Activate
🧠 **Google Vision API**
- Auto-tagging on upload
- Scene and object detection
- Face detection and counting
- Landmark recognition
- Safe search filtering

✨ **Image Enhancement (Picsart API)**
- One-tap photo enhancement
- Background removal
- Image upscaling (2x, 4x)
- Filter application

🔍 **Smart Search (OpenAI GPT-4 Vision)**
- Natural language queries ("beach sunset photos")
- AI-powered album suggestions
- Automatic categorization
- Image description generation

🔄 **Duplicate Detection**
- Perceptual hashing
- Similar image grouping
- Merge/delete suggestions

### Technical Implementation
**1. Re-enable AI Services**
```javascript
// Uncomment API calls in:
- /src/services/googleVision.js
- /src/services/picsart.js
- /src/services/openai.js

// Remove "Coming Soon" modals
- Delete disabled state on AI buttons
- Update i18n to reflect active features
```

**2. Firestore Schema Updates**
```javascript
photos: {
  // Existing fields...
  aiTags: string[],          // ✅ Already exists
  faces: number,             // ✅ Already exists
  faceCoordinates: object[], // NEW
  aiDescription: string,     // NEW
  similarityHash: string,    // NEW (duplicate detection)
  enhanced: boolean,         // ✅ Already exists
  enhancedUrl: string,       // ✅ Already exists
}
```

**3. useAIQueue Hook Activation**
```javascript
// Already built in /src/hooks/useAIQueue.js
// Handles rate limiting and queuing for AI requests
// Just needs to be connected to UI
```

### Cost Management
**Free Tier Limits:**
- Google Vision: 1,000 calls/month (free)
- Picsart: Need paid plan (~$49/month)
- OpenAI: Pay-per-use (~$0.01-0.10 per image)

**Strategy:**
1. Start with Google Vision only (free tier)
2. Monitor usage for 1 month
3. If < 100 NOK/month → full activation
4. If > 100 NOK/month → Pro-only feature

**Estimated Cost:**
- Low usage (< 500 users): 200-500 NOK/month
- Medium usage (500-1,000 users): 500-1,000 NOK/month
- **Target:** Cover costs via Pro subscriptions (99 NOK/month)

### Success Metrics
- Auto-tagging accuracy > 85%
- AI processing time < 10s per photo
- User satisfaction with AI features > 4/5
- Pro conversion rate > 5%

### Rollout Plan
**Week 1-2:** Google Vision only
- Auto-tagging on upload
- Test with 100 users
- Monitor API costs daily

**Week 3-4:** Picsart enhancement
- Enable if costs justified
- Pro-only feature initially

**Week 5-6:** OpenAI smart search
- Beta test with select users
- Monitor OpenAI costs

**Week 7-8:** Full activation
- All AI features live
- Public announcement
- Marketing push

---

## 🔐 Phase 3: Vault & Advanced Security
**Duration:** 6-8 weeks  
**Status:** 📅 Planned (Month 6-8)  
**Goal:** Add encrypted storage and biometric protection

### Features
🔒 **Secure Vault**
- Encrypted photo storage (client-side AES-256)
- Biometric unlock (FaceID/TouchID)
- PIN code fallback
- Auto-lock after inactivity
- Stealth mode (hide from main gallery)
- Separate Firestore collection: `vault_photos`

🔑 **Authentication Enhancements**
- Two-factor authentication (2FA)
- Biometric login for entire app
- Session timeout settings
- Login activity log

### Technical Implementation
**New Components:**
- `VaultPage.jsx` → Encrypted gallery
- `VaultSetupModal.jsx` → Setup wizard
- `EncryptionService.js` → Web Crypto API wrapper
- `VaultContext.jsx` → Vault state management

**Capacitor Integration:**
```javascript
import { NativeBiometric } from 'capacitor-native-biometric';

// Already installed, just needs implementation
await NativeBiometric.isAvailable(); // Check device support
await NativeBiometric.verifyIdentity(); // Unlock vault
```

**Encryption Flow:**
```
User uploads to vault
      ↓
Client-side encryption (AES-256)
      ↓
Upload encrypted file to Firebase Storage
      ↓
Store decryption key in device keychain
      ↓
User must unlock to view
```

### Firestore Schema
```javascript
vault_photos: {
  userId: string,
  encryptedUrl: string,    // Firebase Storage URL (encrypted file)
  iv: string,              // Initialization vector for decryption
  salt: string,            // Salt for key derivation
  createdAt: timestamp,
  thumbnail: string,       // Encrypted thumbnail
  metadata: object         // Encrypted
}

vault_settings: {
  userId: string,
  biometricEnabled: boolean,
  autoLockMinutes: number,
  stealthMode: boolean
}
```

### Success Metrics
- Vault adoption rate > 30% of users
- Zero encryption bugs (critical security requirement)
- Biometric unlock success rate > 95%

---

## 🌐 Phase 4: Sharing & Collaboration
**Duration:** 8-10 weeks  
**Status:** 📅 Planned (Month 9-12)  
**Goal:** Enable multi-user collaboration and album sharing

### Features
🔗 **Album Sharing**
- Generate public links (with expiry)
- Password-protected links
- View-only vs edit permissions
- Download options
- View count tracking

👥 **Collaboration**
- Invite users by email
- Collaborator roles (viewer, editor, admin)
- Real-time sync across devices
- Activity feed (who did what)
- @mentions in comments

💬 **Comments & Reactions**
- Photo comments with threading
- Emoji reactions
- Push notifications
- Reply to comments
- Mention other users

📊 **Activity Tracking**
- Upload history
- Share events
- Comment notifications
- Reaction counts

### Technical Implementation
**Real-Time Sync:**
```javascript
// Firebase Realtime Database for instant updates
import { getDatabase, ref, onValue } from 'firebase/database';

const db = getDatabase();
const albumRef = ref(db, 'albums/' + albumId);
onValue(albumRef, (snapshot) => {
  // Update UI in real-time
});
```

**Offline Queue:**
```javascript
// IndexedDB for offline operations
import { openDB } from 'idb';

const db = await openDB('photovault-offline', 1);
// Queue operations while offline
// Sync when connection restored
```

**New Components:**
- `ShareModal.jsx` → Sharing UI
- `CollaboratorManager.jsx` → Manage permissions
- `CommentThread.jsx` → Comment section
- `ActivityFeed.jsx` → Event log
- `NotificationPanel.jsx` → Notification center

**Firestore Schema:**
```javascript
albums: {
  // Existing fields...
  shared: boolean,
  sharedWith: [
    {
      userId: string,
      email: string,
      permission: 'view' | 'edit' | 'admin',
      addedAt: timestamp
    }
  ],
  publicLink: {
    enabled: boolean,
    token: string,
    expiresAt: timestamp,
    password: string (hashed),
    allowDownload: boolean
  }
}

comments: {
  photoId: string,
  userId: string,
  text: string,
  createdAt: timestamp,
  parentId: string | null,
  mentions: string[]
}

reactions: {
  photoId: string,
  userId: string,
  emoji: string,
  createdAt: timestamp
}

notifications: {
  userId: string,
  type: 'comment' | 'reaction' | 'share' | 'mention',
  photoId: string,
  fromUserId: string,
  read: boolean,
  createdAt: timestamp
}

activity: {
  userId: string,
  albumId: string,
  action: 'upload' | 'comment' | 'like' | 'edit' | 'delete',
  timestamp: timestamp,
  metadata: object
}
```

**Firebase Functions:**
```javascript
// Cloud Functions for server-side operations
exports.sendShareInvite = functions.https.onCall(async (data) => {
  // Send email invitation
  // Create shared album entry
  // Generate notification
});

exports.cleanupExpiredLinks = functions.pubsub.schedule('every 24 hours').onRun(() => {
  // Remove expired public links
});
```

### Success Metrics
- Share link usage > 40% of users
- Collaboration adoption > 20%
- Average collaborators per album: 2-3
- Comments/reactions engagement > 50%

---

## 📱 Phase 5: Native Apps & PWA
**Duration:** 8-10 weeks  
**Status:** 📅 Planned (Month 13-18)  
**Goal:** Launch on iOS/Android app stores and deploy as PWA

### 5.1 Progressive Web App (PWA)
**Duration:** 3 weeks

**Features:**
- Install as standalone app
- Offline-first architecture
- Service worker caching
- Background sync
- Push notifications
- Share target integration

**Technical Implementation:**
```javascript
// manifest.json
{
  "name": "PhotoVault",
  "short_name": "PhotoVault",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#6b46c1",
  "icons": [...],
  "share_target": {
    "action": "/upload",
    "method": "POST",
    "enctype": "multipart/form-data"
  }
}

// service-worker.js (Workbox)
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);
```

**Deliverables:**
- [ ] Service worker with caching strategies
- [ ] Install prompt UI
- [ ] Offline indicator
- [ ] Push notification setup
- [ ] Share target handler

---

### 5.2 iOS App Store
**Duration:** 3-4 weeks

**Prerequisites:**
- Apple Developer Account (999 NOK/year)
- Mac with Xcode 15+

**Build Process:**
```bash
# Sync Capacitor
npx cap sync ios
npx cap open ios

# Configure in Xcode
- Set bundle ID: com.photovault.app
- Configure signing & capabilities
- Add FaceID usage description
- Add Photo Library usage description

# Build for TestFlight
Product → Archive → Distribute App
```

**iOS-Specific Features:**
- FaceID/TouchID integration
- Photo library access (PHPickerViewController)
- Share extension
- Widgets (iOS 14+)
- App Clips for quick access

**App Store Requirements:**
- [ ] Privacy policy URL
- [ ] Terms of service
- [ ] App Store screenshots (6.5", 5.5")
- [ ] App description (EN/NO)
- [ ] Privacy manifest
- [ ] TestFlight beta testing

---

### 5.3 Android Play Store
**Duration:** 3-4 weeks

**Prerequisites:**
- Google Play Console account (270 NOK one-time)
- Android Studio

**Build Process:**
```bash
# Sync Capacitor
npx cap sync android
npx cap open android

# Configure in Android Studio
- Set applicationId: com.photovault.app
- Configure signing config
- Set target SDK 34 (Android 14)

# Build release AAB
Build → Generate Signed Bundle/APK → Android App Bundle
```

**Android-Specific Features:**
- Fingerprint authentication
- Photo picker integration
- Share sheet
- Home screen widgets
- App shortcuts

**Play Store Requirements:**
- [ ] Privacy policy URL
- [ ] Data safety form
- [ ] Play Store screenshots
- [ ] Feature graphic (1024x500)
- [ ] Closed alpha/beta testing
- [ ] Target API Level 34

---

### 5.4 Production Infrastructure
**Duration:** 2 weeks (parallel with app builds)

**Hosting & CDN:**
- Firebase Hosting for PWA
- Cloud Storage with CDN for photos
- Cloud Functions for server-side operations

**Security Hardening:**
```javascript
// Firebase App Check (prevent abuse)
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

**Monitoring & Analytics:**
```javascript
// Firebase Analytics
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'photo_uploaded', {
  ai_enabled: true,
  album_id: albumId,
  file_size: fileSize
});

// Performance Monitoring
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

**CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: FirebaseExtended/action-hosting-deploy@v0
```

**Deliverables:**
- [ ] Production Firebase project
- [ ] GitHub Actions CI/CD
- [ ] Error tracking (Sentry or Firebase Crashlytics)
- [ ] Performance monitoring dashboard
- [ ] Analytics implementation

---

### Success Metrics (Phase 5)
- iOS App Store rating > 4.5/5
- Android Play Store rating > 4.5/5
- PWA install rate > 15%
- Crash-free rate > 99%
- App Store search visibility (top 50 in "photo storage")

---

## 📊 Technology Evolution Summary

| Technology | Phase 1 (MVP) | Phase 2 (AI) | Phase 3 (Vault) | Phase 4 (Share) | Phase 5 (Apps) |
|------------|---------------|--------------|-----------------|-----------------|----------------|
| **React** | 18.3.1 | Same | Same | Same | Same |
| **Zustand** | Basic store | + AI slice | + Vault slice | + Share slice | + Offline slice |
| **Firebase** | Auth + Firestore + Storage | Same | Same | + Realtime DB + Functions | + Hosting + Analytics |
| **AI APIs** | None | Vision + Picsart + OpenAI | Same | Same | Same |
| **Encryption** | None | None | Web Crypto API | Same | Same |
| **Capacitor** | Installed | Same | + Biometric | + Push | Full native |
| **PWA** | None | None | None | None | Service Workers |
| **React Router** | Not used | Same | Same | Activated | + Deep links |

---

## 💰 Cost Projection by Phase

| Phase | Duration | Monthly Cost | One-Time Cost | Total Phase Cost |
|-------|----------|--------------|---------------|------------------|
| **Phase 1 (MVP)** | 2 months | 0-50 NOK | 400 NOK (domain+store) | ~500 NOK |
| **Phase 2 (AI)** | 2 months | 200-500 NOK | 0 NOK | ~800-1,000 NOK |
| **Phase 3 (Vault)** | 2 months | 200-500 NOK | 0 NOK | ~400-1,000 NOK |
| **Phase 4 (Share)** | 3 months | 300-700 NOK | 0 NOK | ~900-2,100 NOK |
| **Phase 5 (Apps)** | 4 months | 300-700 NOK | 1,269 NOK (Apple Dev) | ~2,500-4,000 NOK |

**Total 18-Month Cost:** ~5,000-8,500 NOK ($500-850 USD)

**Revenue Target:**
- Free users: No cost
- Pro users: 99 NOK/month
- **Break-even:** 10 Pro users = 990 NOK/month = covers all costs

---

## 🎯 Milestones & Decision Points

### Milestone 1: MVP Launch (Week 6)
**Decision Point:** Launch or delay?
- ✅ If core features work → LAUNCH
- ❌ If critical bugs → delay 1 week

### Milestone 2: First 100 Users (Month 3)
**Decision Point:** Activate AI features?
- ✅ If positive feedback + low churn → activate Phase 2
- ⏸️ If high churn → focus on UX improvements

### Milestone 3: First Pro Subscriber (Month 4-5)
**Decision Point:** Continue investment?
- ✅ If conversion rate > 3% → continue to Phase 3
- ⏸️ If < 1% → reassess pricing/features

### Milestone 4: 500 Active Users (Month 6-8)
**Decision Point:** Native app investment?
- ✅ If retention > 40% → start Phase 5 (apps)
- ⏸️ If < 30% → focus on web experience

---

## 🚦 Risk Management

### Phase 1 Risks
| Risk | Mitigation |
|------|------------|
| Low user acquisition | Beta testing with friends/family first |
| Technical issues | Comprehensive testing checklist |
| Firebase costs | Budget alerts at 50 NOK/month |

### Phase 2 Risks
| Risk | Mitigation |
|------|------------|
| AI costs exceed projections | Start with free tier (Vision API) only |
| Low AI feature usage | User education + onboarding |
| API rate limits | useAIQueue hook with throttling |

### Phase 3-5 Risks
| Risk | Mitigation |
|------|------------|
| Development delays | Phased rollout, MVP per phase |
| App Store rejection | Thorough guideline review |
| Security vulnerabilities | Regular audits, penetration testing |

---

## 📈 Success Criteria

### Phase 1 (MVP)
- ✅ 100+ users in 3 months
- ✅ < 5% churn rate
- ✅ Zero critical bugs
- ✅ 99%+ uptime

### Phase 2 (AI)
- ✅ Auto-tagging accuracy > 85%
- ✅ 5+ Pro subscribers
- ✅ AI costs covered by revenue

### Phase 3 (Vault)
- ✅ 30%+ users adopt vault
- ✅ Zero encryption bugs
- ✅ Biometric auth success rate > 95%

### Phase 4 (Share)
- ✅ 40%+ users share albums
- ✅ Average 2-3 collaborators per shared album
- ✅ Real-time sync latency < 3s

### Phase 5 (Apps)
- ✅ App Store approval (both iOS/Android)
- ✅ 4.5+ star rating
- ✅ 1,000+ downloads in first month

---

## 🔄 Roadmap Review Schedule

- **Monthly:** Review progress, adjust timeline
- **Quarterly:** Re-evaluate priorities based on user feedback
- **Annually:** Major strategic review

**Next Review:** After Phase 1 MVP launch

---

## 📞 Stakeholder Communication

### Weekly Updates
- Development progress
- User metrics
- Cost tracking
- Blocker identification

### Monthly Reports
- Phase completion status
- User growth
- Revenue (if applicable)
- Next month's plan

---

**Roadmap Version:** 2.0 (MVP-First Strategy)  
**Last Updated:** November 1, 2025  
**Next Update:** After Phase 1 launch
