// ============================================================================
// useAuth Hook - Phase 2: Authentication Logic Extraction
// ============================================================================
import { useEffect, useCallback } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useStore from '../state/store';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for authentication management
 * Handles login, logout, user state, and role management
 */
export const useAuth = () => {
  const { t } = useTranslation(['common']);
  const auth = getAuth();

  // Zustand store selectors
  const user = useStore((state) => state.user);
  const userProfile = useStore((state) => state.userProfile);
  const loading = useStore((state) => state.loading);
  const setUser = useStore((state) => state.setUser);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const setLoading = useStore((state) => state.setLoading);
  const logout = useStore((state) => state.logout);
  const setNotification = useStore((state) => state.setNotification);
  const setConfirmModal = useStore((state) => state.setConfirmModal);

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = useCallback(async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        // User document doesn't exist yet, create default profile
        setUserProfile({
          uid,
          role: 'user',
          storageLimit: 524288000, // 500 MB
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setNotification({
        message: t('common:notifications.errorLoadingData'),
        type: 'error'
      });
    }
  }, [setUserProfile, setNotification, t]);

  /**
   * Handle user logout with confirmation
   */
  const handleLogout = useCallback(() => {
    setConfirmModal({
      title: t('common:notifications.confirmLogout'),
      message: t('common:notifications.confirmLogoutMessage'),
      onConfirm: async () => {
        try {
          await signOut(auth);
          logout();
          setNotification({
            message: t('common:notifications.loggedOut'),
            type: 'success'
          });
        } catch (err) {
          console.error('Logout error:', err);
          setNotification({
            message: t('common:notifications.logoutError'),
            type: 'error'
          });
        }
      }
    });
  }, [auth, logout, setConfirmModal, setNotification, t]);

  /**
   * Initialize auth listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Fetch user profile when user logs in
        await fetchUserProfile(currentUser.uid);
      } else {
        // Clear user data when logged out
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, [auth, setUser, setLoading, setUserProfile, fetchUserProfile]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return userProfile?.role === 'admin';
  }, [userProfile]);

  /**
   * Check if user is pro
   */
  const isPro = useCallback(() => {
    return userProfile?.role === 'pro' || userProfile?.role === 'admin';
  }, [userProfile]);

  /**
   * Get user's storage quota
   */
  const getStorageQuota = useCallback(() => {
    return {
      limit: userProfile?.storageLimit || 524288000, // 500 MB default
      unlimited: userProfile?.role === 'admin',
    };
  }, [userProfile]);

  return {
    // State
    user,
    userProfile,
    loading,

    // Actions
    handleLogout,
    fetchUserProfile,

    // Utilities
    isAdmin: isAdmin(),
    isPro: isPro(),
    storageQuota: getStorageQuota(),
    isAuthenticated: !!user,
  };
};

export default useAuth;
