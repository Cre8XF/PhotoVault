# 📷 Pixtr

**A Norwegian alternative to Google Photos**

Pixtr (formerly PhotoVault) is a modern, React-based photo management application with secure cloud storage, advanced editing, and intelligent organization.

**Version:** V3 (Editor stable)
**Status:** Pre-launch (Launch preparation)

---

## ✨ Features

### Core Features
- ✅ **Secure Storage** - Cloudflare R2 cloud storage
- ✅ **Advanced Editor** - Adjust, Crop, Rotate, Filters (Editor V3)
- ✅ **Album Management** - Create, organize, and share albums
- ✅ **World View Navigation** - Immersive photo viewing experience
- ✅ **Multi-language** - Norwegian and English (i18next)
- ✅ **Dark/Light Themes** - Modern, customizable interface
- ✅ **Encrypted Vault** - Secure storage for private photos
- ✅ **Collage Builder** - Create photo collages
- ✅ **QR Sharing** - Easy album sharing

### Upcoming Features (PRO Tier)
- 🔜 AI Auto-tagging (Google Vision API)
- 🔜 Face Recognition
- 🔜 Smart Search (GPT-4 Vision)
- 🔜 Background Removal
- 🔜 Video Support

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

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite |
| Storage | Cloudflare R2 |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| State Management | Zustand (Editor) |
| Styling | Tailwind CSS |
| i18n | i18next (NO/EN) |
| Deployment | Netlify |
| Mobile (Planned) | Capacitor |

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
