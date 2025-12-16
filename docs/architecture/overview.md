# Pixtr Architecture Overview

**Last Updated:** 2025-12-16
**Version:** V3

---

## 🎯 System Overview

Pixtr is a modern, React-based photo management application designed as a Norwegian alternative to Google Photos. It combines secure cloud storage, advanced editing capabilities, and intelligent organization features.

### Key Characteristics
- **Modern Frontend:** React with Vite for fast development
- **Cloud-Native:** Cloudflare R2 for storage, Firebase for real-time data
- **Mobile-First:** Responsive design with planned native apps
- **Secure:** User authentication and encrypted vault features
- **Multi-Tier:** GRATIS, LITE, and PRO subscription levels

---

## 🧩 Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18+ | UI rendering and component architecture |
| **Build Tool** | Vite | Fast development and optimized builds |
| **State Management** | Zustand | Global state management (Editor V3) |
| **Routing** | React Router | Client-side routing and navigation |
| **UI/CSS** | Tailwind CSS + Custom CSS | Styling and responsive design |
| **Internationalization** | i18next | Multi-language support (NO/EN) |

### Backend & Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Authentication** | Firebase Auth | User authentication (email, Google) |
| **Database** | Firebase Firestore | Real-time NoSQL database |
| **Storage** | Cloudflare R2 | Object storage for photos/videos |
| **CDN** | Cloudflare | DNS, caching, and content delivery |
| **Offline Storage** | IndexedDB | Client-side data persistence |

### Deployment
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Web Hosting** | Netlify / Firebase Hosting | Static site deployment |
| **Mobile Apps** | Capacitor (planned) | iOS and Android native apps |
| **CI/CD** | Git + Netlify | Automated deployment pipeline |

---

## 📂 Project Structure

```
PhotoVault/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── PhotoGrid.jsx
│   │   ├── PhotoModal.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── ...
│   │
│   ├── pages/               # Page-level components
│   │   ├── Home.jsx
│   │   ├── AlbumPage.jsx
│   │   ├── PhotoPage.jsx    # World View
│   │   ├── EditorPage.jsx   # World View
│   │   └── ...
│   │
│   ├── features/            # Feature-specific code
│   │   ├── editor/
│   │   │   ├── EditorPage.jsx
│   │   │   ├── components/
│   │   │   └── store/
│   │   │       └── editorStore.js  # Zustand store
│   │   │
│   │   └── pro_features/
│   │       └── vault/
│   │
│   ├── contexts/            # React contexts
│   │   ├── SecurityContext.jsx
│   │   └── ToastContext.jsx
│   │
│   ├── utils/               # Utility functions
│   │   ├── firebase.js      # Firebase configuration
│   │   ├── imageProcessing.js
│   │   └── ...
│   │
│   ├── locales/             # i18n translations
│   │   ├── en/
│   │   └── no/
│   │
│   ├── styles/              # CSS files
│   │   ├── index.css
│   │   └── EditorPage.css
│   │
│   └── db.js                # IndexedDB handler
│
├── cloudflare/              # Cloudflare Workers
│   └── metadata-worker/
│
├── docs/                    # Documentation
│   ├── README.md
│   ├── architecture/
│   ├── product/
│   └── ...
│
├── public/                  # Static assets
├── .env                     # Environment variables
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

---

## 🏗️ Architectural Patterns

### World View Architecture
Pixtr uses a "World View" pattern for immersive features:
- **PhotoPage:** Full-screen photo viewing with swipe navigation
- **SlideshowPage:** Auto-playing photo slideshow
- **EditorPage:** Image editing interface
- **CollageBuilder:** Collage creation

**Key Characteristics:**
- Each "world" is a full-page route (not a modal)
- Sets `isWorldView = true` on mount
- Hides bottom navigation while active
- Has its own distinct UI/UX "atmosphere"

**See:** [worlds-architecture.md](./worlds-architecture.md) for full details

### State Management
Pixtr uses multiple state management approaches:

1. **Global State (Zustand):**
   - Used in Editor V3 for canvas state
   - Isolated, predictable state updates
   - Located in `src/features/editor/store/editorStore.js`

2. **React Context:**
   - Security context for authentication
   - Toast notifications
   - Theme management (dark/light mode)

3. **Firebase Realtime Listeners:**
   - Photos, albums, and user data sync
   - Real-time updates across devices

### Data Flow

```
User Action
    ↓
React Component
    ↓
Firebase Function (firebase.js)
    ↓
Firestore (metadata) + R2 (files)
    ↓
Real-time Listener
    ↓
Component Re-render
```

---

## 🔐 Authentication & Authorization

### User Roles
1. **User:** Standard access (upload, albums, basic features)
2. **Pro User:** Premium features (AI, extra storage)
3. **Admin:** Full access (dashboard, user management)

### Firebase Auth Integration
- Email/password authentication
- Google OAuth integration
- Session management via Firebase Auth tokens
- Security rules enforced at Firestore and Storage levels

---

## 💾 Data Models

### Photo Document (Firestore)
```javascript
{
  id: "photo_abc123",
  userId: "user_xyz",
  albumId: "album_def456",
  name: "IMG_1234.jpg",
  url: "https://r2.pixtr.cloud/...",          // R2 URL
  thumbnailUrl: "https://r2.pixtr.cloud/...", // Thumbnail
  storagePath: "users/xyz/album/...",
  type: "image" | "video",
  uploadedAt: Timestamp,
  favorite: boolean,
  metadata: {
    dateTaken: Timestamp,     // EXIF data
    location: { lat, lng },   // GPS coordinates
    camera: { make, model }   // Camera info
  }
}
```

### Album Document (Firestore)
```javascript
{
  id: "album_abc123",
  userId: "user_xyz",
  name: "Summer 2024",
  description: "Vacation photos",
  coverPhotoId: "photo_def456",
  photoCount: 42,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isPublic: boolean,
  qrCode: "https://..."  // For sharing
}
```

---

## 🚀 Performance Optimizations

### Image Loading
- **Lazy loading:** Images load as they enter viewport
- **Progressive loading:** Thumbnail → full resolution
- **WebP format:** Modern image format for smaller file sizes
- **Cloudflare CDN:** Global content delivery

### Code Splitting
- Route-based code splitting with React.lazy()
- Feature-based chunks (Editor, Collage, etc.)
- Reduced initial bundle size

### Firestore Optimization
- Indexed queries for fast search
- Query limits to prevent over-fetching
- Real-time listeners with proper cleanup
- Batched writes where possible

---

## 🔄 Deployment Pipeline

### Development Flow
```
Local Development
    ↓ (git push)
GitHub Repository
    ↓ (webhook)
Netlify Build
    ↓ (deploy)
Production (pixtr.cloud)
```

### Environment Variables
Required `.env` configuration:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_CLOUDFLARE_R2_ENDPOINT=...
VITE_CLOUDFLARE_ACCOUNT_ID=...
```

---

## 🎨 UI/UX Principles

### Design Philosophy
- **Mobile-First:** Optimized for touch interfaces
- **Glass Morphism:** Modern, semi-transparent UI elements
- **Dark Theme Default:** Reduces eye strain for photo viewing
- **Minimal Animations:** Smooth but not distracting
- **Accessibility:** WCAG 2.1 Level AA compliance (goal)

### Responsive Breakpoints
```css
/* Mobile: Default */
/* Tablet: 768px+ */
/* Desktop: 1024px+ */
/* Large Desktop: 1440px+ */
```

---

## 🔮 Future Architecture

### Planned Improvements
1. **PWA Enhancement:** Better offline support with Service Workers
2. **Native Apps:** iOS and Android via Capacitor
3. **Microservices:** Separate API layer for advanced features
4. **AI Integration:** Cloud-based image processing
5. **Real-time Collaboration:** Multi-user album editing

### Scalability Considerations
- **Database:** Firestore scales automatically
- **Storage:** Cloudflare R2 unlimited capacity
- **CDN:** Global distribution via Cloudflare
- **Authentication:** Firebase Auth handles millions of users

---

## 📚 Related Documentation

- [World View Architecture](./worlds-architecture.md) - Detailed navigation system
- [Editor V3 Overview](../features/editor/overview.md) - Editor implementation
- [R2 Setup Guide](../development/r2-setup.md) - Storage configuration
- [Testing Guide](../qa/testing-guide.md) - Testing procedures

---

## 🤝 Contributing

When modifying the architecture:
1. **Maintain Separation of Concerns:** Keep feature code isolated
2. **Follow World View Pattern:** For immersive features
3. **Document Major Changes:** Update this file
4. **Test Thoroughly:** Especially state management changes
5. **Consider Performance:** Always think about mobile users

---

**Last Updated:** 2025-12-16
**Architecture Version:** V3 (Post Editor V3 stabilization)
**Maintainer:** Pixtr Development Team
