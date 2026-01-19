/**
 * Vault Slice for Zustand Store
 * Manages vault state including lock status, photos, and settings
 */

export const createVaultSlice = (set, get) => ({
  // =====================================================================
  // VAULT STATE
  // =====================================================================
  isVaultUnlocked: false,
  vaultPasswordHash: null, // Stored hash for verification
  vaultPassword: null, // SECURITY: In-memory only, never persisted to storage
  vaultPhotos: [],
  vaultSettings: {
    autoLockTimeout: 300000, // 5 minutes
    requireBiometric: false,
    isVaultSetup: false,
    biometricEnabled: false,
  },
  lastActivityTime: null,
  vaultLoading: false,
  decryptedThumbnailsCache: new Map(), // In-memory cache for decrypted thumbnails

  // =====================================================================
  // VAULT ACTIONS
  // =====================================================================

  /**
   * Set up vault for the first time
   */
  setupVault: (passwordHash, settings = {}) => {
    set({
      vaultPasswordHash: passwordHash,
      vaultSettings: {
        ...get().vaultSettings,
        isVaultSetup: true,
        ...settings,
      },
      isVaultUnlocked: false,
    });
  },

  /**
   * Unlock vault with password
   * SECURITY: Password stored in memory only, never persisted
   */
  unlockVault: (passwordHash, password) => {
    const storedHash = get().vaultPasswordHash;
    if (storedHash === passwordHash) {
      set({
        isVaultUnlocked: true,
        vaultPassword: password, // Store in memory only
        lastActivityTime: Date.now(),
      });

      return true;
    }
    return false;
  },

  /**
   * Lock vault
   * SECURITY: Clears password from memory
   */
  lockVault: () => {
    set({
      isVaultUnlocked: false,
      vaultPassword: null, // Clear password from memory
      lastActivityTime: null,
      decryptedThumbnailsCache: new Map(), // Clear cache
    });
  },

  /**
   * Add photo to vault
   */
  addPhotoToVault: (photo) => {
    set((state) => ({
      vaultPhotos: [...state.vaultPhotos, photo],
    }));
  },

  /**
   * Remove photo from vault
   */
  removePhotoFromVault: (photoId) => {
    set((state) => ({
      vaultPhotos: state.vaultPhotos.filter((photo) => photo.id !== photoId),
    }));
  },

  /**
   * Update vault photo
   */
  updateVaultPhoto: (photoId, updates) => {
    set((state) => ({
      vaultPhotos: state.vaultPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, ...updates } : photo
      ),
    }));
  },

  /**
   * Set vault photos (bulk)
   */
  setVaultPhotos: (photos) => {
    set({ vaultPhotos: photos });
  },

  /**
   * Update vault settings
   */
  updateVaultSettings: (settings) => {
    set((state) => ({
      vaultSettings: {
        ...state.vaultSettings,
        ...settings,
      },
    }));
  },

  /**
   * Update activity time (for auto-lock)
   */
  updateActivityTime: () => {
    if (get().isVaultUnlocked) {
      set({ lastActivityTime: Date.now() });
    }
  },

  /**
   * Check if vault should auto-lock
   */
  checkAutoLock: () => {
    const { isVaultUnlocked, lastActivityTime, vaultSettings } = get();

    if (!isVaultUnlocked || !lastActivityTime) {
      return false;
    }

    const { autoLockTimeout } = vaultSettings;
    if (autoLockTimeout === 0) {
      return false; // Auto-lock disabled
    }

    const timeSinceActivity = Date.now() - lastActivityTime;
    if (timeSinceActivity >= autoLockTimeout) {
      get().lockVault();
      return true;
    }

    return false;
  },

  /**
   * Reset vault (delete all vault data)
   * SECURITY: Clears password from memory
   */
  resetVault: () => {
    set({
      isVaultUnlocked: false,
      vaultPasswordHash: null,
      vaultPassword: null, // Clear password from memory
      vaultPhotos: [],
      vaultSettings: {
        autoLockTimeout: 300000,
        requireBiometric: false,
        isVaultSetup: false,
        biometricEnabled: false,
      },
      lastActivityTime: null,
      decryptedThumbnailsCache: new Map(),
    });
  },

  /**
   * Set vault loading state
   */
  setVaultLoading: (loading) => {
    set({ vaultLoading: loading });
  },

  /**
   * Cache decrypted thumbnail
   */
  cacheDecryptedThumbnail: (photoId, blobUrl) => {
    const cache = get().decryptedThumbnailsCache;

    // Limit cache size to 50 images
    if (cache.size >= 50) {
      const firstKey = cache.keys().next().value;
      const firstValue = cache.get(firstKey);
      // Revoke old blob URL to free memory
      if (firstValue) {
        URL.revokeObjectURL(firstValue);
      }
      cache.delete(firstKey);
    }

    cache.set(photoId, blobUrl);
    set({ decryptedThumbnailsCache: new Map(cache) });
  },

  /**
   * Get cached decrypted thumbnail
   */
  getCachedThumbnail: (photoId) => {
    return get().decryptedThumbnailsCache.get(photoId);
  },

  /**
   * Clear thumbnail cache
   */
  clearThumbnailCache: () => {
    const cache = get().decryptedThumbnailsCache;
    // Revoke all blob URLs
    cache.forEach((blobUrl) => {
      URL.revokeObjectURL(blobUrl);
    });
    set({ decryptedThumbnailsCache: new Map() });
  },

  // =====================================================================
  // VAULT GETTERS
  // =====================================================================

  /**
   * Get vault photo by ID
   */
  getVaultPhotoById: (photoId) => {
    return get().vaultPhotos.find((photo) => photo.id === photoId);
  },

  /**
   * Get time until auto-lock (in milliseconds)
   */
  getTimeUntilAutoLock: () => {
    const { isVaultUnlocked, lastActivityTime, vaultSettings } = get();

    if (!isVaultUnlocked || !lastActivityTime) {
      return 0;
    }

    const { autoLockTimeout } = vaultSettings;
    if (autoLockTimeout === 0) {
      return Infinity;
    }

    const timeSinceActivity = Date.now() - lastActivityTime;
    const timeRemaining = autoLockTimeout - timeSinceActivity;

    return Math.max(0, timeRemaining);
  },

  /**
   * FIX 2: Ensure vault unlock state consistency
   * Single source of truth: Vault is only unlocked if BOTH conditions are true:
   * 1. isVaultUnlocked === true
   * 2. vaultPassword !== null
   *
   * If password is lost but isVaultUnlocked is true, force lock to prevent desync.
   * Returns true if vault is properly unlocked, false otherwise.
   */
  ensureVaultUnlocked: () => {
    const { isVaultUnlocked, vaultPassword } = get();

    // If vault appears unlocked but password is missing, force lock to prevent desync
    if (isVaultUnlocked && !vaultPassword) {
      console.warn('🔒 [VAULT] State desync detected: isVaultUnlocked=true but vaultPassword=null. Forcing lock.');
      get().lockVault();
      return false;
    }

    // Both conditions met - vault is properly unlocked
    return isVaultUnlocked && vaultPassword !== null;
  },
});
