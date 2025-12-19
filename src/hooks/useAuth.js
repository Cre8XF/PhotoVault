// ============================================================================
// useAuth Hook - Phase 2: Authentication Logic Extraction (fixed admin logic)
// ============================================================================
import { useEffect, useCallback } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useStore from '../state/store'
import { useTranslation } from 'react-i18next'

/**
 * Custom hook for authentication management
 * Handles login, logout, user state, and role management
 */
export const useAuth = () => {
  const { t } = useTranslation(['common'])
  const auth = getAuth()

  // Zustand store selectors
  const user = useStore((state) => state.user)
  const userProfile = useStore((state) => state.userProfile)
  const loading = useStore((state) => state.loading)
  const emailVerified = useStore((state) => state.emailVerified)
  const setUser = useStore((state) => state.setUser)
  const setUserProfile = useStore((state) => state.setUserProfile)
  const setLoading = useStore((state) => state.setLoading)
  const setEmailVerified = useStore((state) => state.setEmailVerified)
  const logout = useStore((state) => state.logout)
  const setNotification = useStore((state) => state.setNotification)
  const setConfirmModal = useStore((state) => state.setConfirmModal)

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = useCallback(
    async (uid) => {
      try {
        const userRef = doc(db, 'users', uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          setUserProfile(userDoc.data())
        } else {
          // 🔹 Opprett et nytt bruker-dokument hvis det ikke finnes
          const defaultProfile = {
            uid,
            userId: uid,
            role: 'user',
            subscriptionTier: 'GRATIS', // ✅ Default tier
            storageLimit: 1073741824, // ✅ 1GB for GRATIS
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          // Forsøk å skrive dokumentet (håndter permissions trygt)
          try {
            await setDoc(userRef, defaultProfile)
            console.log('✅ Opprettet nytt brukerprofil-dokument for:', uid)
          } catch (writeErr) {
            console.warn('⚠️ Kunne ikke skrive brukerprofil:', writeErr.message)
          }

          setUserProfile(defaultProfile)
        }
      } catch (error) {
        console.warn(
          '⚠️ Firestore read error i fetchUserProfile:',
          error.message
        )
        setNotification({
          message: t('common:notifications.errorLoadingData'),
          type: 'error',
        })
      }
    },
    [setUserProfile, setNotification, t]
  )

  /**
   * Handle user logout with confirmation
   */
  const handleLogout = useCallback(() => {
    setConfirmModal({
      title: t('common:notifications.confirmLogout'),
      message: t('common:notifications.confirmLogoutMessage'),
      onConfirm: async () => {
        try {
          await signOut(auth)
          logout()
          setNotification({
            message: t('common:notifications.loggedOut'),
            type: 'success',
          })
        } catch (err) {
          console.error('Logout error:', err)
          setNotification({
            message: t('common:notifications.logoutError'),
            type: 'error',
          })
        }
      },
    })
  }, [auth, logout, setConfirmModal, setNotification, t])

  /**
   * Force refresh of Firebase user (emailVerified, claims, etc)
   * Used after email verification
   */
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return false

    try {
      await auth.currentUser.reload()
      const refreshedUser = auth.currentUser

      // Force new reference to ensure Zustand detects the change
      setUser({ ...refreshedUser })
      setEmailVerified(refreshedUser.emailVerified)

      return refreshedUser.emailVerified
    } catch (err) {
      console.error('❌ Failed to refresh user:', err)
      return false
    }
  }, [auth, setUser, setEmailVerified])

  /**
   * Initialize auth listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false)

      if (currentUser) {
        // ✅ P0 FIX: Reload user to sync emailVerified state after verification
        try {
          await currentUser.reload()
          console.log('✅ Auth state reloaded - emailVerified:', currentUser.emailVerified)
        } catch (reloadError) {
          console.warn('⚠️ Failed to reload auth state:', reloadError.message)
          // Continue without crashing - use cached state
        }

        // Force new reference to ensure Zustand detects the change
        setUser({ ...currentUser })
        setEmailVerified(currentUser.emailVerified)
        await fetchUserProfile(currentUser.uid)
      } else {
        setUser(null)
        setUserProfile(null)
        setEmailVerified(false)
      }
    })

    return () => unsubscribe()
  }, [
    auth,
    setUser,
    setLoading,
    setUserProfile,
    setEmailVerified,
    fetchUserProfile,
  ])

  // ==========================================
  // ✅ TIER-BASED HELPERS
  // ==========================================

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return userProfile?.role === 'admin' || user?.email === 'rogsor80@gmail.com'
  }, [userProfile, user])

  /**
   * Check if user is on GRATIS tier
   */
  const isGratis = useCallback(() => {
    if (!userProfile) return true // Default for new users
    if (userProfile.role === 'admin') return false
    return (
      userProfile.subscriptionTier === 'GRATIS' || !userProfile.subscriptionTier
    )
  }, [userProfile])

  /**
   * Check if user is on LITE tier
   */
  const isLite = useCallback(() => {
    if (!userProfile) return false
    if (userProfile.role === 'admin') return false
    return userProfile.subscriptionTier === 'LITE'
  }, [userProfile])

  /**
   * Check if user is on PRO tier
   */
  const isPro = useCallback(() => {
    if (!userProfile) return false
    if (userProfile.role === 'admin') return true // Admins = PRO
    return userProfile.subscriptionTier === 'PRO'
  }, [userProfile])

  /**
   * Get current subscription tier
   */
  const getTier = useCallback(() => {
    if (isAdmin()) return 'ADMIN'
    return userProfile?.subscriptionTier || 'GRATIS'
  }, [userProfile, isAdmin])

  /**
   * Get storage quota based on tier
   */
  const getStorageQuota = useCallback(() => {
    if (isAdmin()) {
      return {
        limit: null,
        unlimited: true,
        tier: 'ADMIN',
      }
    }

    const tier = userProfile?.subscriptionTier || 'GRATIS'
    const limits = {
      GRATIS: 1073741824, // 1GB
      LITE: 5368709120, // 5GB
      PRO: 53687091200, // 50GB
    }

    return {
      limit: userProfile?.storageLimit || limits[tier] || limits.GRATIS,
      unlimited: false,
      tier,
    }
  }, [userProfile, isAdmin])

  /**
   * Check if video upload is allowed
   */
  const canUploadVideo = useCallback(() => {
    if (isAdmin()) return true
    return isPro() // Only PRO tier
  }, [isAdmin, isPro])

  /**
   * ✅ P0: Get storage limit in bytes for a given tier
   */
  const getTierLimit = useCallback((tier) => {
    const limits = {
      GRATIS: 500 * 1024 * 1024, // 500 MB
      LITE: 5 * 1024 * 1024 * 1024, // 5 GB
      PRO: 50 * 1024 * 1024 * 1024, // 50 GB
    }
    return limits[tier] || limits.GRATIS
  }, [])

  /**
   * ✅ P0: Check if email is verified, show toast if not
   * @returns {boolean} - true if verified, false if not
   */
  const ensureEmailVerified = useCallback(() => {
    if (!user) {
      setNotification({
        message: 'Du må være logget inn for å utføre denne handlingen.',
        type: 'error',
      })
      return false
    }

    if (!emailVerified) {
      setNotification({
        message: 'Bekreft e-postadressen din for å utføre denne handlingen.',
        type: 'error',
      })
      return false
    }

    return true
  }, [user, emailVerified, setNotification])

  return {
    user,
    userProfile,
    loading,
    emailVerified,
    refreshUser,

    // Actions
    handleLogout,
    fetchUserProfile,

    // Tier checks
    isGratis,
    isLite,
    isPro,
    isAdmin,
    tier: getTier,

    // Capabilities
    canUploadVideo,
    storageQuota: getStorageQuota,
    getTierLimit,
    ensureEmailVerified,

    // Legacy
    isAuthenticated: !!user,
  }
}

export default useAuth
