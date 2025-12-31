// ============================================================================
// useAuth Hook - PURE STATE ACCESS (NO AUTH LISTENER)
// ============================================================================
// CRITICAL: This hook does NOT set up auth listeners
// Auth state is managed by AuthProvider (src/providers/AuthProvider.jsx)
// This hook ONLY reads from Zustand and provides helper functions
// ============================================================================
import { useCallback } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import useStore from '../state/store'
import { useTranslation } from 'react-i18next'
import { devLog } from '../utils/log'

/**
 * Custom hook for authentication management
 * Handles auth state access, logout, and role management
 *
 * ✅ This hook does NOT set up onAuthStateChanged
 * ✅ Auth state is managed by AuthProvider
 * ✅ This hook ONLY reads from Zustand store
 */
export const useAuth = () => {
  const { t } = useTranslation(['common'])
  const auth = getAuth()

  // Zustand store selectors - READ ONLY
  const user = useStore((state) => state.user)
  const userProfile = useStore((state) => state.userProfile)
  const loading = useStore((state) => state.loading)
  const emailVerified = useStore((state) => state.emailVerified)
  const setUser = useStore((state) => state.setUser)
  const setEmailVerified = useStore((state) => state.setEmailVerified)
  const logout = useStore((state) => state.logout)
  const setNotification = useStore((state) => state.setNotification)
  const setConfirmModal = useStore((state) => state.setConfirmModal)

  /**
   * Fetch user profile from Firestore
   * Used when profile needs to be refreshed (e.g., after profile update)
   */
  const fetchUserProfile = useCallback(
    async (uid) => {
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('../firebase')

        const userRef = doc(db, 'users', uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          useStore.getState().setUserProfile(userDoc.data())
        }
      } catch (error) {
        console.error('[useAuth] Error fetching user profile:', error)
        setNotification({
          message: t('common:notifications.errorLoadingData'),
          type: 'error',
        })
      }
    },
    [setNotification, t]
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
   *
   * ✅ Email verification state is single-source-of-truth via useAuth.refreshUser()
   * ⚠️  Do not assume Firebase emailVerified is immediately consistent after verifyEmail redirect – handle propagation delay.
   */
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return false

    try {
      // Reload user from Firebase to get fresh emailVerified status
      await auth.currentUser.reload()
      const refreshedUser = auth.currentUser

      devLog('[AUTH] Manual refresh via refreshUser(), emailVerified:', refreshedUser.emailVerified)

      // Update Zustand with new reference to force re-renders
      setUser({ ...refreshedUser })
      setEmailVerified(refreshedUser.emailVerified)

      return refreshedUser.emailVerified
    } catch (err) {
      console.error('[AUTH] Failed to refresh user:', err)
      return false
    }
  }, [auth, setUser, setEmailVerified])

  /**
   * Refresh both Firebase user and Firestore profile
   * Used after subscription changes via Stripe webhook
   */
  const refreshUserProfile = useCallback(async () => {
    if (!auth.currentUser) return false

    try {
      // Refresh Firebase user
      await refreshUser()

      // Fetch updated profile from Firestore
      await fetchUserProfile(auth.currentUser.uid)

      devLog('[AUTH] User profile refreshed successfully')
      return true
    } catch (err) {
      console.error('[AUTH] Failed to refresh user profile:', err)
      return false
    }
  }, [auth, refreshUser, fetchUserProfile])

  // ✅ CRITICAL: onAuthStateChanged removed from useAuth
  // Auth listener is now ONLY in AuthProvider (src/providers/AuthProvider.jsx)
  // This prevents multiple concurrent listeners that race and thrash state

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
   * Check if document upload is allowed
   */
  const canUploadDocument = useCallback(() => {
    if (isAdmin()) return true
    return isLite() || isPro() // LITE and PRO tiers
  }, [isAdmin, isLite, isPro])

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

  // ==========================================
  // 🆕 FREEMIUM LIMIT CHECK HOOKS
  // ==========================================

  /**
   * Check if user can create album (no query needed!)
   */
  const canCreateAlbum = useCallback(() => {
    if (!userProfile) return { allowed: false }

    const tier = userProfile.subscriptionTier || 'GRATIS'

    // LITE/PRO/ADMIN always allowed
    if (tier !== 'GRATIS') {
      return { allowed: true }
    }

    // GRATIS: Check counter
    const current = userProfile.currentAlbumCount || 0
    const max = 5

    return {
      allowed: current < max,
      current,
      max,
      remaining: max - current,
    }
  }, [userProfile])

  /**
   * Check if user can add photo to album
   */
  const canAddPhotoToAlbum = useCallback(
    (album) => {
      if (!userProfile || !album) return { allowed: false }

      const tier = userProfile.subscriptionTier || 'GRATIS'

      // LITE/PRO/ADMIN always allowed
      if (tier !== 'GRATIS') {
        return { allowed: true }
      }

      // GRATIS: Check counter
      const current = album.photoCount || 0
      const max = 20

      return {
        allowed: current < max,
        current,
        max,
        remaining: max - current,
      }
    },
    [userProfile]
  )

  /**
   * Check storage limit
   */
  const checkStorage = useCallback(
    (newFileSize) => {
      if (!userProfile) return { allowed: false }

      const tier = userProfile.subscriptionTier || 'GRATIS'
      const storageUsed = userProfile.storageUsed || 0
      const storageLimit = userProfile.storageLimit || 786432000 // 750 MB

      const wouldExceed = storageUsed + newFileSize > storageLimit

      return {
        allowed: !wouldExceed,
        current: storageUsed,
        max: storageLimit,
        needed: newFileSize,
        available: storageLimit - storageUsed,
        percentUsed: Math.round((storageUsed / storageLimit) * 100),
      }
    },
    [userProfile]
  )

  return {
    user,
    userProfile,
    loading,
    emailVerified,
    refreshUser,
    refreshUserProfile,

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
    canUploadDocument,
    storageQuota: getStorageQuota,
    getTierLimit,
    ensureEmailVerified,

    // 🆕 Freemium limit checks
    canCreateAlbum,
    canAddPhotoToAlbum,
    checkStorage,

    // Legacy
    isAuthenticated: !!user,
  }
}

export default useAuth
