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
   */
  unlockVault: (passwordHash) => {
    const storedHash = get().vaultPasswordHash;
    if (storedHash === passwordHash) {
      set({
        isVaultUnlocked: true,
        lastActivityTime: Date.now(),
      });

      // Store password in sessionStorage for decryption during session
      // Note: This is cleared on lock/logout
      sessionStorage.setItem('vaultSession', 'active');

      return true;
    }
    return false;
  },

  /**
   * Lock vault
   */
  lockVault: () => {
    set({
      isVaultUnlocked: false,
      lastActivityTime: null,
      decryptedThumbnailsCache: new Map(), // Clear cache
    });

    // Clear session data
    sessionStorage.removeItem('vaultSession');
    sessionStorage.removeItem('vaultPassword');
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
   */
  resetVault: () => {
    set({
      isVaultUnlocked: false,
      vaultPasswordHash: null,
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

    sessionStorage.removeItem('vaultSession');
    sessionStorage.removeItem('vaultPassword');
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
});
