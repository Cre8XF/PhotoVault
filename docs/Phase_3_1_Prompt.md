# Phase 3.1 - Secure Vault Implementation Prompt

## Kontekst

Du jobber med PhotoVault, en React-app med følgende eksisterende arkitektur:
- React 18.3.1 med Zustand 5.0.8 for state management
- Firebase 11.0 (Firestore, Storage, Auth)
- Capacitor 6.1.0 for native features (biometric auth tilgjengelig)
- Custom hooks: `useAuth.js`, `usePhotoData.js`, `useAIQueue.js`
- Eksisterende Zustand store: `/src/state/store.js` (190 linjer)

## Mål

Implementer et sikkert vault-system med client-side kryptering for sensitive bilder.

## Oppgave

### 1. Encryption Service

Opprett `/src/services/encryption.js`:

**Krav:**
- AES-256-GCM kryptering via Web Crypto API
- Password-based key derivation (PBKDF2, 100,000 iterations)
- Generer unik salt og IV per fil
- Returner encrypted blob med metadata (salt, iv, algorithm)

**Interface:**
```javascript
export async function encryptFile(file, password)
export async function decryptFile(encryptedBlob, metadata, password)
export async function hashPassword(password)
export async function verifyPassword(password, hash)
```

---

### 2. Vault Zustand Slice

Opprett `/src/state/vaultSlice.js`:

**State:**
```javascript
{
  isVaultUnlocked: false,
  vaultPassword: null,
  vaultPhotos: [],
  vaultSettings: {
    autoLockTimeout: 300000, // 5 min
    requireBiometric: false,
    isVaultSetup: false
  },
  lastActivityTime: null
}
```

**Actions:**
```javascript
- unlockVault(password)
- lockVault()
- setupVault(password, settings)
- addPhotoToVault(photo, encryptedBlob)
- removePhotoFromVault(photoId)
- updateVaultSettings(settings)
- checkAutoLock()
```

Integrer i eksisterende `/src/state/store.js`.

---

### 3. Vault Hook

Opprett `/src/hooks/useVault.js` (følg mønster fra `useAuth.js` og `usePhotoData.js`):

**Funksjonalitet:**
```javascript
export function useVault() {
  return {
    // State
    isVaultUnlocked,
    vaultPhotos,
    vaultSettings,
    
    // Actions
    unlockWithPassword: async (password) => {},
    unlockWithBiometric: async () => {},
    lockVault: () => {},
    uploadToVault: async (files, password) => {},
    deleteFromVault: async (photoId) => {},
    
    // Auto-lock logic
    resetActivityTimer: () => {},
  }
}
```

**Biometric integration:**
```javascript
import { NativeBiometric } from 'capacitor-native-biometric';

async function unlockWithBiometric() {
  const result = await NativeBiometric.verifyIdentity({
    reason: 'Unlock vault',
    title: 'Vault Authentication'
  });
  
  if (result.verified) {
    // Retrieve stored password from secure storage
    const credentials = await NativeBiometric.getCredentials({
      server: 'photovault.vault'
    });
    return unlockWithPassword(credentials.password);
  }
}
```

---

### 4. Firestore Schema

Opprett ny collection: `vault_photos`

**Dokument-struktur:**
```javascript
{
  id: string,
  userId: string,
  encryptedMetadata: {
    originalName: string (encrypted),
    mimeType: string (encrypted),
    size: number,
    uploadedAt: timestamp
  },
  cryptoMetadata: {
    salt: string (base64),
    iv: string (base64),
    algorithm: 'AES-GCM'
  },
  storageRef: string, // Path to encrypted blob in Firebase Storage
  createdAt: timestamp,
  lastAccessedAt: timestamp
}
```

**Security Rules:**
```javascript
match /vault_photos/{photoId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

---

### 5. VaultSetupModal Component

Opprett `/src/components/VaultSetupModal.jsx`:

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onComplete: (password) => void
}
```

**UI Flow:**
1. Velg sikkerhetsnivå (password + biometric)
2. Opprett strong password (min 12 tegn, validering)
3. Bekreft password
4. Aktiver biometric (valgfritt)
5. Generer encryption key
6. Lagre settings til Zustand + Firebase

**Styling:** Følg eksisterende Twilight theme (#1a1a2e background, #6b46c1 accent)

---

### 6. VaultPage Component

Opprett `/src/pages/VaultPage.jsx`:

**Tilstander:**
- **Locked state:** PIN/password input + biometric button
- **Unlocked state:** Photo grid (følg mønster fra HomeDashboard.jsx)
- **Empty state:** "Add first photo" CTA

**Features:**
```javascript
// Header actions
- Lock button (always visible when unlocked)
- Upload button
- Settings gear

// Photo grid
- Lazy loading (bruk eksisterende LazyImage component)
- Select mode for bulk operations
- Delete with confirm dialog

// Auto-lock
- Activity timer (reset on user interaction)
- Visual countdown last 60 seconds
- Lock on page blur/app background
```

**Upload flow:**
```javascript
async function handleVaultUpload(files) {
  for (const file of files) {
    const encryptedBlob = await encryptFile(file, vaultPassword);
    
    // Upload encrypted blob to Firebase Storage
    const storageRef = ref(storage, `vault/${userId}/${uuid()}.enc`);
    await uploadBytes(storageRef, encryptedBlob);
    
    // Save metadata to Firestore
    await addDoc(collection(db, 'vault_photos'), {
      userId,
      encryptedMetadata: { /* ... */ },
      cryptoMetadata: { /* ... */ },
      storageRef: storageRef.fullPath,
      createdAt: serverTimestamp()
    });
  }
}
```

---

### 7. VaultSettingsModal Component

Opprett `/src/components/VaultSettingsModal.jsx`:

**Settings:**
```javascript
- Change vault password
- Auto-lock timeout (dropdown: 1min, 5min, 15min, never)
- Require biometric (toggle)
- Reset vault (danger zone - delete all vault photos)
```

---

### 8. Integration med eksisterende app

**AppRoutes.jsx:**
```javascript
<Route path="/vault" element={<VaultPage />} />
```

**HomeDashboard.jsx navigation:**
```javascript
// Legg til vault tile i navigation grid
<VaultTile 
  icon={<Lock />}
  label="Vault"
  count={vaultPhotos.length}
  onClick={() => navigate('/vault')}
/>
```

---

## Tekniske krav

### Sikkerhet
- Aldri lagre ukryptert password i state eller localStorage
- Bruk `sessionStorage` for midlertidig vault-password (kun under unlocked session)
- Clear sensitive data fra minne ved logout/lock
- Prevent screenshots når vault er åpen (Capacitor plugin)

### Performance
- Lazy-load vault photos (kun metadata ved first load)
- Decrypt on-demand (når bruker åpner fullscreen)
- Cache decrypted thumbnails i memory (max 50 images)
- Auto-clear cache ved lock

### Error handling
```javascript
try {
  await unlockVault(password);
} catch (error) {
  if (error.code === 'INVALID_PASSWORD') {
    // Show error toast
  } else if (error.code === 'BIOMETRIC_FAILED') {
    // Fallback to password
  }
}
```

---

## Testing checklist

- [ ] Encrypt/decrypt round-trip successful
- [ ] Wrong password rejected
- [ ] Auto-lock etter timeout
- [ ] Biometric fallback fungerer
- [ ] Vault tom etter reset
- [ ] Photos hidden i main gallery
- [ ] Firebase rules blokkerer uautorisert tilgang
- [ ] App background trigger lock

---

## Deliverables

```
/src/services/encryption.js
/src/state/vaultSlice.js
/src/hooks/useVault.js
/src/pages/VaultPage.jsx
/src/components/VaultSetupModal.jsx
/src/components/VaultSettingsModal.jsx
firestore.rules (oppdatert)
```

---

## Neste steg

Når Phase 3.1 er ferdig, fortsett til Phase 3.2 (AI-Powered Features).
