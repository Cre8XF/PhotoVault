# Pixtr Documentation

**Version:** V3
**Last Updated:** 2025-12-16

---

## 📖 What is Pixtr?

Pixtr (formerly PhotoVault) is a modern photo management application with:
- Secure photo storage (Cloudflare R2)
- Advanced editor (Adjust, Crop, Rotate, Filters)
- Encrypted Vault for private photos
- Album organization and sharing
- Collage builder with multiple layouts
- Multi-tier system (GRATIS, LITE, PRO)

---

## 🗂️ Documentation Structure

### 🏗️ Architecture
Understanding how Pixtr is built:
- [World View Architecture](./architecture/worlds-architecture.md) - Mobile navigation system
- Architecture Overview - *Coming soon: System overview and tech stack*

### 📦 Product
Vision, roadmap, and business logic:
- [Feature Roadmap](./product/roadmap.md) - Tier-based feature roadmap
- [Launch Plan](./product/launch-plan.md) - Detailed implementation plan
- [Launch Strategy](./product/launch-strategy.md) - Strategic launch planning
- [Pricing Tiers](./product/tiers-and-pricing.md) - GRATIS, LITE, PRO tiers

### 💻 Development
Getting started and contributing:
- [R2 Setup Guide](./development/r2-setup.md) - Cloudflare R2 metadata setup
- Setup Guide - *Coming soon: Full setup instructions*
- Environment Configuration - *Coming soon: .env setup*
- Code Conventions - *Coming soon: Coding standards*

### 🎨 Features
Deep dives into major features:
- **Editor:** [Overview](./features/editor/overview.md) - Editor V3 complete documentation
- **Vault:** [Overview](./features/vault/overview.md) - Encrypted vault documentation
- **Video:** [Status](./features/video-status.md) - Video feature status report
- Sharing - *Coming soon*
- Collage - *Coming soon*

### 🧪 QA & Testing
Quality assurance and testing:
- [Testing Guide](./qa/testing-guide.md) - Free tier testing guide
- [System Analysis](./qa/system-analysis.md) - Full system analysis
- [Technical Analysis](./qa/technical-analysis.md) - A-priority technical analysis

### ⚙️ Operations
Infrastructure and deployment:
- [Cloudflare R2 Diagnostic](./operations/r2-diagnostic-plan.md) - R2 troubleshooting
- [Cloudflare R2 Executive Summary](./operations/r2-executive-summary.md) - Quick R2 overview
- [Cloudflare Workers](./operations/cloudflare-workers.md) - Metadata worker setup
- Firebase Setup - *Coming soon*
- Monitoring - *Coming soon*

### 📦 Archive
Historical documentation and completed work:
- [Archive Index](./archive/README.md) - What's archived and why
- Completed patches and bugfixes
- Migration documentation
- QA workflow templates

---

## 🚀 Quick Start

New to Pixtr development? Start here:
1. **Setup:** Clone the repository and install dependencies
2. **Architecture:** Read [World View Architecture](./architecture/worlds-architecture.md) to understand the navigation system
3. **Editor:** Read [Editor Overview](./features/editor/overview.md) to understand Editor V3
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

### ✅ Completed
- Editor V3 (stable and production-ready)
- World View architecture (PhotoPage, SlideshowPage)
- Cloudflare R2 migration
- Free tier implementation
- QA system and workflow

### 🔄 In Progress
- Documentation consolidation
- Launch preparation

### 📋 Next Up
- Complete LITE tier features
- PRO tier planning
- Mobile app development

---

## 📂 Project Structure

```
docs/
├── README.md                      # 📍 You are here
│
├── architecture/
│   └── worlds-architecture.md     # Mobile nav system
│
├── product/
│   ├── roadmap.md                 # Feature roadmap
│   ├── launch-plan.md             # Implementation plan
│   ├── launch-strategy.md         # Strategic planning
│   └── tiers-and-pricing.md       # GRATIS, LITE, PRO
│
├── development/
│   └── r2-setup.md                # R2 metadata setup
│
├── features/
│   ├── editor/
│   │   └── overview.md            # Editor V3 complete
│   ├── vault/
│   │   └── overview.md            # Vault documentation
│   └── video-status.md            # Video feature status
│
├── qa/
│   ├── testing-guide.md           # Testing procedures
│   ├── system-analysis.md         # System analysis
│   └── technical-analysis.md      # Technical analysis
│
├── operations/
│   ├── r2-diagnostic-plan.md      # R2 troubleshooting
│   ├── r2-executive-summary.md    # R2 quick overview
│   └── cloudflare-workers.md      # Worker setup
│
└── archive/
    ├── README.md                  # Archive index
    ├── patches/                   # Completed patches
    ├── bugfixes/                  # Resolved bugs
    ├── migration/                 # Completed migrations
    ├── features/                  # Feature status docs
    ├── debug/                     # Debug guides
    └── qa-workflow/               # QA templates
```

---

## 📞 Need Help?

### Common Tasks
- **Setup Local Environment:** See development/ section (coming soon)
- **Understand Architecture:** Read [worlds-architecture.md](./architecture/worlds-architecture.md)
- **Work on Editor:** Read [editor overview](./features/editor/overview.md)
- **Fix Bugs:** Check [archive/bugfixes/](./archive/bugfixes/) for similar issues
- **Test Features:** Follow [testing-guide.md](./qa/testing-guide.md)

### Troubleshooting
- **Images not loading?** Check [R2 diagnostic plan](./operations/r2-diagnostic-plan.md)
- **CORS errors?** See [R2 executive summary](./operations/r2-executive-summary.md)
- **Editor issues?** Refer to [editor overview](./features/editor/overview.md)
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
2. Check out [worlds-architecture.md](./architecture/worlds-architecture.md)
3. Read [editor overview](./features/editor/overview.md)
4. Review [testing guide](./qa/testing-guide.md)
5. Look at [system analysis](./qa/system-analysis.md)

### For AI Assistants
1. Scan this README for structure
2. Use search to find relevant docs
3. Read feature-specific docs before implementing
4. Check archive/ for historical context only
5. Follow patterns in architecture docs

---

**Last Updated:** 2025-12-16
**Maintainer:** Pixtr Development Team
**Version:** 1.0 (Post-consolidation)
