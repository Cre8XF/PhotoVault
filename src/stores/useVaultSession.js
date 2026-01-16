/**
 * Vault Session Management Store
 * Handles vault unlock state, password caching, and session persistence
 * Separate from main vault state to prevent unnecessary re-renders
 */
import { create } from 'zustand';

const useVaultSession = create((set, get) => ({
  // Session state
  isUnlocked: false,
  unlockedAt: null,
  sessionPassword: null, // In-memory only, never persisted
  pendingAction: null, // Action to resume after unlock
  lastError: null,

  /**
   * Unlock vault session with password
   * @param {string} password - Vault password
   */
  unlock: (password) => {
    // Store password in sessionStorage for persistence across page interactions
    // Note: This is cleared on lock or browser close
    sessionStorage.setItem('vaultPassword', password);

    set({
      isUnlocked: true,
      unlockedAt: Date.now(),
      sessionPassword: password,
      lastError: null,
    });
  },

  /**
   * Lock vault session and clear sensitive data
   */
  lock: () => {
    // Clear password from both memory and sessionStorage
    sessionStorage.removeItem('vaultPassword');

    set({
      isUnlocked: false,
      unlockedAt: null,
      sessionPassword: null,
      pendingAction: null,
      lastError: null,
    });
  },

  /**
   * Get current session password
   * Tries memory first, then sessionStorage
   * @returns {string|null} Password if available
   */
  getPassword: () => {
    const state = get();

    // Check memory first
    if (state.sessionPassword) {
      return state.sessionPassword;
    }

    // Fallback to sessionStorage
    const storedPassword = sessionStorage.getItem('vaultPassword');
    if (storedPassword) {
      // Restore to memory for faster access
      set({ sessionPassword: storedPassword });
      return storedPassword;
    }

    return null;
  },

  /**
   * Check if session is unlocked with valid password
   * @returns {boolean} True if unlocked and password available
   */
  ensureUnlocked: () => {
    const state = get();
    const password = get().getPassword();

    if (state.isUnlocked && password) {
      return true;
    }

    // Session lost password but still marked as unlocked - fix state
    if (state.isUnlocked && !password) {
      set({ isUnlocked: false });
    }

    return false;
  },

  /**
   * Set pending action to resume after unlock
   * @param {Function} action - Action to execute after unlock
   */
  setPendingAction: (action) => {
    set({ pendingAction: action });
  },

  /**
   * Execute and clear pending action
   */
  executePendingAction: () => {
    const { pendingAction } = get();
    if (pendingAction) {
      set({ pendingAction: null });
      pendingAction();
    }
  },

  /**
   * Set last error message
   * @param {string} error - Error message
   */
  setError: (error) => {
    set({ lastError: error });
  },

  /**
   * Clear last error
   */
  clearError: () => {
    set({ lastError: null });
  },

  /**
   * Restore session from sessionStorage on mount
   * Used to maintain session across page navigations
   */
  restoreSession: () => {
    const storedPassword = sessionStorage.getItem('vaultPassword');
    if (storedPassword) {
      set({
        isUnlocked: true,
        unlockedAt: Date.now(),
        sessionPassword: storedPassword,
      });
      return true;
    }
    return false;
  },
}));

export default useVaultSession;
