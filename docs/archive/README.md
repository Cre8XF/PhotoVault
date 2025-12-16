# Documentation Archive

This folder contains historical documentation that is no longer actively used but preserved for reference.

**Last Updated:** 2025-12-16

---

## 📦 What's Archived and Why

### Patches (`/patches`)
Completed code patches and fixes that have been successfully applied to the codebase.

- **r2-migration-patches.md** - Cloudflare R2 migration patches (completed 2024-12)
- **firebase-cors-fix.md** - Firebase CORS configuration fix
- **general-bugfixes.md** - General bugfix documentation
- **cors-deploy.md** - CORS deployment guide

**Why archived:** These patches have been applied and are now part of the codebase.

---

### Bugfixes (`/bugfixes`)
Documentation for specific bugs that have been fixed.

- **delete-confirmation.md** - Delete confirmation modal implementation
- **delete-navigation.md** - Delete navigation timing fix
- **photopage-buttons.md** - PhotoPage button fixes
- **favorite-toggle.md** - Favorite toggle persistence fix
- **mobile-album-input.md** - Mobile album input fixes

**Why archived:** These bugs have been resolved and the fixes are in production.

---

### Migration (`/migration`)
Documentation for completed migration work.

- **r2-metadata-phase1.md** - Phase 1 of R2 metadata migration

**Why archived:** Migration completed successfully.

---

### Features (`/features`)
Status reports and implementation documentation for completed features.

- **i18n-implementation.md** - Internationalization implementation status
- **i18n-audit.md** - i18n audit report

**Why archived:** Features are now fully implemented and in production.

---

### Debug (`/debug`)
Debug guides for issues that have been resolved.

- **public-album-debug.md** - Public album debugging guide

**Why archived:** Issues resolved, kept for reference if similar problems occur.

---

### QA Workflow (`/qa-workflow`)
Templates and guides for the QA workflow that was used during initial development.

- **README.md** - QA workflow overview
- **quick-start.md** - Quick start guide
- **claude-prompt.md** - Claude Code prompt template
- **status-template.md** - Status report template
- **action-template.md** - Action plan template
- **feature-overview.md** - Feature overview document

**Why archived:** These were used for initial QA passes. Current QA documentation is in `/docs/qa/`.

---

## 🔍 When to Use Archived Docs

**Use archived documentation when:**
1. Investigating similar bugs or issues
2. Understanding why certain architectural decisions were made
3. Learning from past migration strategies
4. Reference for QA workflows and templates
5. Historical context for code reviews

**Don't use archived docs for:**
1. Current feature implementation
2. Active development guidelines
3. Production troubleshooting (use active docs instead)

---

## 📋 Archive Organization

```
archive/
├── README.md                  # This file
├── patches/                   # Applied code patches
├── bugfixes/                  # Resolved bug documentation
├── migration/                 # Completed migrations
├── features/                  # Completed feature status
├── debug/                     # Resolved debug guides
└── qa-workflow/               # Historical QA templates
```

---

## 🗑️ Archival Policy

Documents are moved to the archive when:
- ✅ Patches have been successfully applied
- ✅ Bugs have been fixed and verified in production
- ✅ Migrations have been completed
- ✅ Features are fully implemented and stable
- ✅ Documentation is no longer actively referenced

Documents are **never deleted** - they are preserved here for historical reference.

---

## 📞 Questions?

If you need clarification about any archived document or want to understand why something was archived, check:
1. The document itself (it should have a "Status" or "Completed" marker)
2. Git history for the original file
3. The `/docs/README.md` for current active documentation

---

**Archive Created:** 2025-12-16
**Maintained by:** Pixtr Documentation Team
