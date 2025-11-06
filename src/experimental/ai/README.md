# Experimental AI Features

**Status:** Disabled for MVP

This directory contains AI-powered features that are temporarily disabled for the PhotoVault Lite MVP. These features will be re-enabled in Phase 2 when:

- User base reaches 500+ users, OR
- Pro subscriptions cover AI API costs, OR
- After 3+ months of stable operation

## Features Included

### Services (`services/`)
- Google Vision API integration (image analysis, label detection, face detection)
- OpenAI/Gemini integration (smart album suggestions)
- Picsart API (image enhancement, upscaling)

### Components (`components/`)
- AILogPanel - Shows AI processing logs
- AIToolsPanel - AI tools interface
- SmartAlbumsView - AI-suggested albums
- EnhancedComponents - AI-enhanced UI elements

### Pages (`pages/`)
- AISettingsPage - Configure AI features

### Utilities (`utils/`)
- AI authentication and API key management
- Image enhancement utilities
- Auto-categorization logic
- Duplicate detection algorithms
- Smart album generation

### Hooks (`hooks/`)
- useAIQueue - AI processing queue management

## Current Status

All AI services currently return placeholder/stub data. No active API calls are made.

## Migration Notes

Files in this directory were moved from:
- `src/services/` → `src/experimental/ai/services/`
- `src/components/` → `src/experimental/ai/components/`
- `src/pages/` → `src/experimental/ai/pages/`
- `src/utils/` → `src/experimental/ai/utils/`
- `src/hooks/` → `src/experimental/ai/hooks/`

## Re-enabling AI Features

To re-enable AI features:
1. Move files back to their original locations
2. Update imports in components
3. Set up API keys in `.env`
4. Test thoroughly before production deployment
5. Update UI to show AI options in MorePage

**Last Updated:** 2025-11-05
**Phase:** 1a (Cleanup)
