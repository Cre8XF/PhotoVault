# 📷 Pixtr

**A Norwegian alternative to Google Photos**

Pixtr (formerly PhotoVault) is a modern, React-based photo management application with secure cloud storage, advanced editing, and intelligent organization.

**Version:** V3 (Editor stable)
**Status:** Pre-launch (Launch preparation)

---

## ✨ Features

### Core Features
- ✅ **Cloudflare R2 Storage** - Production-ready cloud storage with Firebase fallback
- ✅ **Advanced Editor** - Adjust, Crop, Rotate, Filters (Editor V3 - Stable)
- ✅ **Album Management** - Create, organize, and share albums
- ✅ **Smart Date Grouping** - Photos organized by EXIF date (Google Photos style)
- ✅ **World View Navigation** - Immersive photo viewing experience
- ✅ **Multi-language** - Norwegian and English (i18next)
- ✅ **Dark/Light Themes** - Modern, accessible interface (WCAG AA compliant)
- ✅ **Encrypted Vault** - Secure storage for private photos
- ✅ **Collage Builder** - Create photo collages with custom layouts
- ✅ **QR Sharing** - Easy album sharing with QR codes
- ✅ **Video Support** - Upload and play videos with thumbnails
- ✅ **EXIF Preservation** - Automatic metadata extraction and preservation

### Upcoming Features (PRO Tier)
- 🔜 AI Auto-tagging (Google Vision API)
- 🔜 Face Recognition
- 🔜 Smart Search (GPT-4 Vision)
- 🔜 Background Removal (Picsart API)
- 🔜 AI-powered enhancements

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase account (for Auth & Firestore)
- Cloudflare account (for R2 storage)

### Installation
```bash
git clone https://github.com/Cre8XF/PhotoVault.git
cd PhotoVault
npm install
cp .env.example .env
# Configure .env with your Firebase and Cloudflare credentials
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧩 Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | React 18 + Vite | Fast refresh, ESM |
| Storage | Cloudflare R2 | S3-compatible, with Firebase Storage fallback |
| Database | Firebase Firestore | Real-time sync, offline support |
| Authentication | Firebase Auth | Email/Password + Google OAuth |
| State Management | Zustand | Lightweight, hooks-based |
| Styling | Tailwind CSS | Utility-first, theme tokens |
| i18n | i18next | Norwegian/English (NO/EN) |
| Image Processing | browser-image-compression | Client-side compression |
| EXIF Extraction | exifr | Comprehensive metadata support |
| Date Handling | date-fns | Lightweight, functional |
| Deployment | Netlify | Edge CDN, automatic deploys |
| Worker | Cloudflare Workers | Presigned URLs, metadata sync |
| Mobile (Ready) | Capacitor | iOS/Android builds ready |

**See [Architecture Overview](./docs/architecture/overview.md) for full details**

---

## 📚 Documentation

Complete documentation is available in the `/docs` directory:

- **[Getting Started](./docs/README.md)** - Documentation index
- **[Architecture](./docs/architecture/)** - System design and tech stack
- **[Features](./docs/features/)** - Feature documentation
- **[Product](./docs/product/)** - Roadmap and pricing
- **[Development](./docs/development/)** - Setup guides
- **[QA & Testing](./docs/qa/)** - Testing procedures
- **[Operations](./docs/operations/)** - Deployment and infrastructure

---

## 🎯 Project Structure

```
PhotoVault/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── features/       # Feature-specific code (Editor, Vault)
│   ├── contexts/       # React contexts
│   ├── utils/          # Utilities and helpers
│   ├── locales/        # i18n translations
│   └── styles/         # CSS files
├── docs/               # Documentation
├── cloudflare/         # Cloudflare Workers
└── public/             # Static assets
```

---

## 🔐 Security

- Authentication via Firebase Auth (Email/Password, Google OAuth)
- Firestore Security Rules for data access control
- Encrypted Vault feature for sensitive photos
- HTTPS everywhere via Cloudflare

**See [SECURITY.md](./SECURITY.md) for security policies**

---

## 🤝 Contributing

This is currently a private project. For questions or collaboration:
- **Developer:** Roger Sørensen (Cre8XF)
- **Location:** Fredrikstad, Norway
- **Website:** [cre8xf.dev](https://cre8xf.dev)

---

## 📋 Project Status

### ✅ Completed
- Editor V3 (stable)
- World View architecture
- Cloudflare R2 migration
- Free tier features
- Documentation consolidation

### 🔄 In Progress
- Launch preparation
- Testing and QA

### 📋 Roadmap
- LITE tier (5GB storage, compression)
- PRO tier (AI features, video support)
- Mobile apps (iOS/Android via Capacitor)

**See [Product Roadmap](./docs/product/roadmap.md) for details**

---

## 📄 License

**Proprietary** - All rights reserved

This project is not open source. Contact the developer for licensing inquiries.

---

**Last Updated:** 2025-12-16
**Version:** V3
**Project:** Pixtr (formerly PhotoVault)
