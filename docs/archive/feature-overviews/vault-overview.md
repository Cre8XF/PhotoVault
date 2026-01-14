# Pro Feature: Secure Vault

**Status:** Disabled for MVP (will be Pro-only feature)

This directory contains the Secure Vault feature - encrypted photo storage with AES-256-GCM encryption. This feature will be available only to Pro subscribers in future releases.

## Features Included

### Services (`services/`)
- encryption.js - AES-256-GCM encryption/decryption with PBKDF2 key derivation

### Components (`components/`)
- VaultSetupModal - Initial vault password setup
- VaultSettingsModal - Vault configuration settings
- PINLockScreen - PIN entry interface

### Pages (`pages/`)
- VaultPage - Main vault interface with encrypted photo gallery

### Utilities (`utils/`)
- security.js - PIN/password management and validation
- biometric.js - Biometric authentication (Face ID, Touch ID)
- nativeBiometric.js - Native biometric API wrapper

### Hooks (`hooks/`)
- useVault - Vault state management and operations

### State (`state/`)
- vaultSlice.js - Zustand vault state slice

### Contexts (`contexts/`)
- SecurityContext - Security settings provider

## Technical Details

### Encryption
- Algorithm: AES-256-GCM
- Key Derivation: PBKDF2 (100,000 iterations, SHA-256)
- Random salt and IV per file
- Client-side encryption only

### Security Features
- Biometric unlock support
- PIN code protection
- Auto-lock timeout (configurable)
- Secure password hashing

## Current Status

Vault functionality is fully implemented but disabled for MVP. Existing vault users will see a "Coming Soon" modal.

## Migration Notes

Files in this directory were moved from:
- `src/services/` → `src/pro_features/vault/services/`
- `src/components/` → `src/pro_features/vault/components/`
- `src/pages/` → `src/pro_features/vault/pages/`
- `src/utils/` → `src/pro_features/vault/utils/`
- `src/hooks/` → `src/pro_features/vault/hooks/`
- `src/state/` → `src/pro_features/vault/state/`
- `src/contexts/` → `src/pro_features/vault/contexts/`

## Re-enabling Vault

To re-enable vault as a Pro feature:
1. Set up feature flag system (e.g., `FEATURES.VAULT_ENABLED = true`)
2. Move files back to original locations OR update imports with feature guards
3. Update routing to include `/vault` route
4. Add vault link back to MorePage settings
5. Implement Pro subscription check before vault access
6. Test with existing vault data

## Database Schema

Vault photos are stored in Firestore at:
```
/users/{userId}/vaultPhotos/{photoId}
```

Encrypted files are stored in Firebase Storage at:
```
/users/{userId}/vault/{photoId}
```

**Last Updated:** 2025-11-05
**Phase:** 1a (Cleanup - directories created, files not yet moved)
