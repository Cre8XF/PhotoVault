# Pixtr Documentation

**Version:** V3 (Launch-ready)
**Last Updated:** 2026-01-14

---

## 🌟 Master Document

**→ [PIXTR_FEATURE_OVERVIEW.md](./PIXTR_FEATURE_OVERVIEW.md)** - Single source of truth for all features, architecture, and system state.

Start here for comprehensive system documentation.

---

## 📖 What is Pixtr?

Pixtr is a Norwegian alternative to Google Photos with:
- Secure photo storage (Cloudflare R2 + Firebase)
- Advanced editor (Adjust, Crop, Rotate, Filters)
- Encrypted Vault for private photos
- Album organization and QR sharing
- Collage builder with 50+ layouts
- Freemium tiers (GRATIS, LITE, PRO hidden)

---

## 🗂️ Documentation Structure

### 🏗️ Architecture
Understanding how Pixtr is built:
- [Architecture Overview](./architecture/overview.md) - System overview, tech stack, data models
- [World View Architecture](./architecture/worlds-architecture.md) - Mobile navigation pattern
- [R2 Upload Architecture](./architecture/r2-upload.md) - Deep dive on R2 upload system

### 📦 Product
Vision, roadmap, and business logic:
- [Feature Roadmap](./product/roadmap.md) - Post-launch feature planning
- [Launch Plan](./product/launch-plan.md) - Pre-launch checklist and strategy

### 💻 Development
Getting started and contributing:
- [R2 Setup Guide](./development/r2-setup.md) - Cloudflare R2 configuration

### 🧪 QA & Testing
Quality assurance and testing:
- [Testing Guide](./qa/testing-guide.md) - Testing procedures
- [System Analysis](./qa/system-analysis.md) - Comprehensive system analysis

### ⚙️ Operations
Infrastructure and deployment:
- [Cloudflare Workers](./operations/cloudflare-workers.md) - Worker deployment guide
- [Stripe Subscription Sync](./STRIPE_SUBSCRIPTION_SYNC.md) - Manual subscription sync runbook
- [Firestore Indexes](./FIRESTORE_INDEX_SETUP.md) - Database index configuration

### 📦 Archive
Historical documentation and completed work:
- [Archive Index](./archive/README.md) - What's archived and why
- `2025-12/` - December 2025 audit reports
- `diagnostics/` - Resolved troubleshooting docs
- `implementation-guides/` - Completed feature implementations
- `feature-overviews/` - Superseded by PIXTR_FEATURE_OVERVIEW
- `visual-polish-analysis-2025-12/` - Phase 5 visual polish docs
- `bugfixes/`, `patches/`, `migration/`, `qa-workflow/` - Historical work

---

## 🚀 Quick Start

New to Pixtr development? Start here:
1. **Master Doc:** Read [PIXTR_FEATURE_OVERVIEW.md](./PIXTR_FEATURE_OVERVIEW.md) for complete system understanding
2. **Architecture:** Read [Architecture Overview](./architecture/overview.md) for tech stack and data models
3. **Patterns:** Review [World View Architecture](./architecture/worlds-architecture.md) for navigation patterns
4. **Testing:** Follow [Testing Guide](./qa/testing-guide.md) before making changes

---

## 🤖 AI-Assisted Development

This documentation is optimized for AI assistants (Claude Code, etc.):
- Clear structure for semantic search
- Comprehensive context in each doc
- Cross-references between related topics
- Archived material separated from active docs

### For Claude Code
When working with this codebase:
1. Always check current documentation first (not archived)
2. Read the relevant feature documentation before making changes
3. Follow the architecture patterns defined in worlds-architecture.md
4. Test according to the testing guide
5. Refer to archive/ only for historical context

---

## 🎯 Current Focus

### ✅ Launch-Ready (2026-01-14)
- Editor V3 (stable and production-ready)
- Collage Builder V2 (50+ templates)
- World View architecture (PhotoPage, SlideshowPage, EditorPage)
- Cloudflare R2 primary storage with Firebase fallback
- Freemium tiers (GRATIS, LITE) with counter enforcement
- Secure Vault with AES-256-GCM encryption
- Admin dashboard with kill-switches
- Perceived performance optimizations (skeleton loaders, optimistic UI)
- i18n (Norwegian Bokmål + English)
- PWA + Capacitor apps (iOS/Android ready)

### 📋 Post-Launch
- Mobile app store submissions (App Store, Play Store)
- Swedish/Danish translations
- Performance optimization (photo grid virtualization)
- PRO tier launch strategy

---

## 📂 Project Structure

```
docs/
├── README.md                          # 📍 You are here
├── PIXTR_FEATURE_OVERVIEW.md          # ⭐ Master document (single source of truth)
├── FIRESTORE_INDEX_SETUP.md           # Firestore indexes
├── STRIPE_SUBSCRIPTION_SYNC.md        # Stripe manual sync runbook
│
├── architecture/
│   ├── overview.md                    # System overview, tech stack, data models
│   ├── worlds-architecture.md         # Mobile navigation pattern
│   └── r2-upload.md                   # R2 upload deep dive
│
├── product/
│   ├── roadmap.md                     # Post-launch roadmap
│   └── launch-plan.md                 # Pre-launch checklist
│
├── development/
│   └── r2-setup.md                    # R2 configuration
│
├── qa/
│   ├── testing-guide.md               # Testing procedures
│   └── system-analysis.md             # Comprehensive system analysis
│
├── operations/
│   └── cloudflare-workers.md          # Worker deployment
│
└── archive/
    ├── README.md                      # Archive index
    ├── 2025-12/                       # December 2025 audits
    ├── diagnostics/                   # Resolved troubleshooting
    ├── implementation-guides/         # Completed implementations
    ├── feature-overviews/             # Superseded by FEATURE_OVERVIEW
    ├── visual-polish-analysis-2025-12/ # Phase 5 visual polish
    ├── bugfixes/                      # Resolved bugs
    ├── patches/                       # Completed patches
    ├── migration/                     # Migrations
    ├── debug/                         # Debug guides
    ├── features/                      # Historical feature docs
    └── qa-workflow/                   # QA templates
```

---

## 📞 Need Help?

### Common Tasks
- **Understand System:** Read [PIXTR_FEATURE_OVERVIEW.md](./PIXTR_FEATURE_OVERVIEW.md)
- **Understand Architecture:** Read [architecture/overview.md](./architecture/overview.md)
- **Work on Features:** Reference FEATURE_OVERVIEW for all feature details
- **Fix Bugs:** Check [archive/bugfixes/](./archive/bugfixes/) for similar issues
- **Test Features:** Follow [testing-guide.md](./qa/testing-guide.md)

### Troubleshooting
- **Images not loading?** Check [R2 upload architecture](./architecture/r2-upload.md)
- **Worker issues?** See [cloudflare-workers.md](./operations/cloudflare-workers.md)
- **Subscription sync failed?** Use [STRIPE_SUBSCRIPTION_SYNC.md](./STRIPE_SUBSCRIPTION_SYNC.md)
- **Testing problems?** Follow [testing guide](./qa/testing-guide.md)

---

## 🔄 Documentation Updates

This documentation is actively maintained. If you find:
- Broken links
- Outdated information
- Missing documentation
- Errors or unclear sections

Please update the relevant document and commit with a clear message.

---

## 📝 Documentation Standards

When creating or updating documentation:
1. **Use Clear Headings:** Structure with `#`, `##`, `###`
2. **Add Context:** Explain why, not just what
3. **Include Examples:** Show code/commands where relevant
4. **Link Related Docs:** Cross-reference other documentation
5. **Update Dates:** Add "Last Updated" timestamp
6. **Keep It Current:** Move outdated docs to archive/

---

## 🎓 Learning Path

### For New Developers
1. Read this README first
2. Read [PIXTR_FEATURE_OVERVIEW.md](./PIXTR_FEATURE_OVERVIEW.md) for complete system understanding
3. Review [architecture/overview.md](./architecture/overview.md) for technical details
4. Check out [worlds-architecture.md](./architecture/worlds-architecture.md) for UX patterns
5. Follow [testing guide](./qa/testing-guide.md) before making changes

### For AI Assistants
1. Start with [PIXTR_FEATURE_OVERVIEW.md](./PIXTR_FEATURE_OVERVIEW.md) - single source of truth
2. Use this README for navigation structure
3. Read architecture docs before implementing
4. Check archive/ for historical context only
5. Reference FEATURE_OVERVIEW for all feature details

---

**Last Updated:** 2026-01-14
**Maintainer:** Roger Sørensen (Cre8XF)
**Version:** V3 (Launch-ready)
**Status:** ✅ Documentation cleanup complete
