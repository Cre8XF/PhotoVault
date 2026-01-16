/**
 * Vault Session Management Store
 * Handles vault unlock state with memory-only password storage
 * SECURITY: Password NEVER stored in browser storage (zero-knowledge architecture)
 * Separate from main vault state to prevent unnecessary re-renders
 */
import { create } from 'zustand';

const useVaultSession = create((set, get) => ({
  // Session state
  isUnlocked: false,
  unlockedAt: null,
  sessionPassword: null, // In-memory ONLY, never persisted to browser storage
  pendingAction: null, // Action to resume after unlock
  lastError: null,

  /**
   * Unlock vault session with password
   * @param {string} password - Vault password (kept in memory only)
   */
  unlock: (password) => {
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
    set({
      isUnlocked: false,
      unlockedAt: null,
      sessionPassword: null,
      pendingAction: null,
      lastError: null,
    });
  },

  /**
   * Get current session password from memory only
   * @returns {string|null} Password if available in memory
   */
  getPassword: () => {
    return get().sessionPassword;
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
   * Restore session (placeholder for future implementation)
   * SECURITY: Does NOT restore password - vault locks on page refresh by design
   * @returns {boolean} Always false (no session restoration)
   */
  restoreSession: () => {
    return false;
  },
}));

export default useVaultSession;
