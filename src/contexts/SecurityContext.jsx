// ============================================================================
// SecurityContext.jsx - Global sikkerhetshåndtering for PhotoVault
// FASE 3 - Sikkerhet & Privacy
// ============================================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hashPIN, verifyPIN, encryptData, decryptData } from '../utils/security';
import { checkBiometricSupport, authenticateWithBiometric } from '../utils/biometric';

const SecurityContext = createContext();

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  // Security state
  const [isLocked, setIsLocked] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(5); // minutes
  const [lockOnBackground, setLockOnBackground] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  
  // Private albums
  const [privateAlbumIds, setPrivateAlbumIds] = useState(new Set());
  
  // Auto-lock timer
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [autoLockTimer, setAutoLockTimer] = useState(null);

  // Load security settings from localStorage on mount
  useEffect(() => {
    loadSecuritySettings();
    checkBiometrics();
    setupActivityTracking();
    setupVisibilityListener();
    
    return () => {
      if (autoLockTimer) clearTimeout(autoLockTimer);
    };
  }, []);

  // Check biometric support
  const checkBiometrics = async () => {
    const available = await checkBiometricSupport();
    setBiometricAvailable(available);
  };

  // Load security settings
  const loadSecuritySettings = () => {
    try {
      const settings = localStorage.getItem('photoVaultSecurity');
      if (settings) {
        const parsed = JSON.parse(settings);
        setPinEnabled(parsed.pinEnabled || false);
        setBiometricEnabled(parsed.biometricEnabled || false);
        setAutoLockEnabled(parsed.autoLockEnabled || false);
        setAutoLockTimeout(parsed.autoLockTimeout || 5);
        setLockOnBackground(parsed.lockOnBackground !== false);
        
        // Load private albums
        if (parsed.privateAlbumIds) {
          setPrivateAlbumIds(new Set(parsed.privateAlbumIds));
        }
        
        // If PIN is enabled, app should be locked by default
        if (parsed.pinEnabled) {
          setIsLocked(true);
        }
      }
    } catch (err) {
      console.error('Error loading security settings:', err);
    }
  };

  // Save security settings
  const saveSecuritySettings = useCallback((updates) => {
    try {
      const current = JSON.parse(localStorage.getItem('photoVaultSecurity') || '{}');
      const updated = { ...current, ...updates };
      localStorage.setItem('photoVaultSecurity', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving security settings:', err);
    }
  }, []);

  // Setup activity tracking
  const setupActivityTracking = () => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  };

  // Setup visibility listener (lock on background)
  const setupVisibilityListener = () => {
    const handleVisibilityChange = () => {
      if (document.hidden && lockOnBackground && pinEnabled) {
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  // Auto-lock timer effect
  useEffect(() => {
    if (!autoLockEnabled || !pinEnabled || isLocked) return;

    if (autoLockTimer) clearTimeout(autoLockTimer);

    const timer = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      const timeoutMs = autoLockTimeout * 60 * 1000;

      if (timeSinceActivity >= timeoutMs) {
        setIsLocked(true);
      }
    }, autoLockTimeout * 60 * 1000);

    setAutoLockTimer(timer);

    return () => clearTimeout(timer);
  }, [lastActivity, autoLockEnabled, autoLockTimeout, pinEnabled, isLocked]);

  // Enable PIN
  const enablePIN = async (pin) => {
    try {
      const hashedPIN = await hashPIN(pin);
      localStorage.setItem('photoVaultPIN', hashedPIN);
      
      setPinEnabled(true);
      saveSecuritySettings({ pinEnabled: true });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Disable PIN
  const disablePIN = async () => {
    try {
      localStorage.removeItem('photoVaultPIN');
      setPinEnabled(false);
      setBiometricEnabled(false);
      saveSecuritySettings({ pinEnabled: false, biometricEnabled: false });
      setIsLocked(false);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Change PIN
  const changePIN = async (currentPin, newPin) => {
    try {
      // Verify current PIN
      const storedHash = localStorage.getItem('photoVaultPIN');
      if (!storedHash) {
        return { success: false, error: 'No PIN set' };
      }

      const isValid = await verifyPIN(currentPin, storedHash);
      if (!isValid) {
        return { success: false, error: 'Ugyldig nåværende PIN' };
      }

      // Set new PIN
      const newHash = await hashPIN(newPin);
      localStorage.setItem('photoVaultPIN', newHash);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Verify PIN and unlock
  const unlockWithPIN = async (pin) => {
    try {
      // Check if locked due to failed attempts
      if (lockUntil && Date.now() < lockUntil) {
        const remainingTime = Math.ceil((lockUntil - Date.now()) / 60000);
        return { 
          success: false, 
          error: `For mange forsøk. Prøv igjen om ${remainingTime} min.` 
        };
      }

      const storedHash = localStorage.getItem('photoVaultPIN');
      if (!storedHash) {
        return { success: false, error: 'No PIN set' };
      }

      const isValid = await verifyPIN(pin, storedHash);
      
      if (isValid) {
        setIsLocked(false);
        setFailedAttempts(0);
        setLockUntil(null);
        return { success: true };
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        // Lock for 5 minutes after 5 failed attempts
        if (newFailedAttempts >= 5) {
          const lockTime = Date.now() + (5 * 60 * 1000);
          setLockUntil(lockTime);
          return { 
            success: false, 
            error: 'For mange feil forsøk. Appen er låst i 5 minutter.' 
          };
        }

        return { 
          success: false, 
          error: `Feil PIN. ${5 - newFailedAttempts} forsøk igjen.` 
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Enable biometric
  const enableBiometric = async () => {
    if (!biometricAvailable) {
      return { success: false, error: 'Biometrisk autentisering ikke tilgjengelig' };
    }

    if (!pinEnabled) {
      return { success: false, error: 'PIN må aktiveres først' };
    }

    try {
      // Test biometric authentication
      const result = await authenticateWithBiometric('Aktiver biometrisk autentisering');
      
      if (result.success) {
        setBiometricEnabled(true);
        saveSecuritySettings({ biometricEnabled: true });
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Disable biometric
  const disableBiometric = () => {
    setBiometricEnabled(false);
    saveSecuritySettings({ biometricEnabled: false });
  };

  // Unlock with biometric
  const unlockWithBiometric = async () => {
    if (!biometricEnabled) {
      return { success: false, error: 'Biometrisk autentisering ikke aktivert' };
    }

    try {
      const result = await authenticateWithBiometric('Lås opp PhotoVault');
      
      if (result.success) {
        setIsLocked(false);
        setFailedAttempts(0);
        setLockUntil(null);
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Toggle auto-lock
  const toggleAutoLock = (enabled, timeout = 5) => {
    setAutoLockEnabled(enabled);
    setAutoLockTimeout(timeout);
    saveSecuritySettings({ autoLockEnabled: enabled, autoLockTimeout: timeout });
  };

  // Toggle lock on background
  const toggleLockOnBackground = (enabled) => {
    setLockOnBackground(enabled);
    saveSecuritySettings({ lockOnBackground: enabled });
  };

  // Private album management
  const makeAlbumPrivate = (albumId) => {
    const updated = new Set(privateAlbumIds);
    updated.add(albumId);
    setPrivateAlbumIds(updated);
    saveSecuritySettings({ privateAlbumIds: Array.from(updated) });
  };

  const makeAlbumPublic = (albumId) => {
    const updated = new Set(privateAlbumIds);
    updated.delete(albumId);
    setPrivateAlbumIds(updated);
    saveSecuritySettings({ privateAlbumIds: Array.from(updated) });
  };

  const isAlbumPrivate = (albumId) => {
    return privateAlbumIds.has(albumId);
  };

  // Manual lock
  const lock = () => {
    setIsLocked(true);
  };

  const value = {
    // State
    isLocked,
    pinEnabled,
    biometricEnabled,
    biometricAvailable,
    autoLockEnabled,
    autoLockTimeout,
    lockOnBackground,
    failedAttempts,
    
    // PIN methods
    enablePIN,
    disablePIN,
    changePIN,
    unlockWithPIN,
    
    // Biometric methods
    enableBiometric,
    disableBiometric,
    unlockWithBiometric,
    
    // Auto-lock methods
    toggleAutoLock,
    toggleLockOnBackground,
    
    // Private albums
    makeAlbumPrivate,
    makeAlbumPublic,
    isAlbumPrivate,
    privateAlbumIds,
    
    // Manual lock
    lock,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityContext;
