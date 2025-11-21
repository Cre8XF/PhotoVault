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
  const setUser = useStore((state) => state.setUser)
  const setUserProfile = useStore((state) => state.setUserProfile)
  const setLoading = useStore((state) => state.setLoading)
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
   * Initialize auth listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      if (currentUser) {
        await fetchUserProfile(currentUser.uid)
      } else {
        setUserProfile(null)
      }
    })

    return () => unsubscribe()
  }, [auth, setUser, setLoading, setUserProfile, fetchUserProfile])

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
    return userProfile.subscriptionTier === 'GRATIS' || !userProfile.subscriptionTier
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
        tier: 'ADMIN'
      }
    }

    const tier = userProfile?.subscriptionTier || 'GRATIS'
    const limits = {
      'GRATIS': 1073741824,     // 1GB
      'LITE': 5368709120,        // 5GB
      'PRO': 53687091200         // 50GB
    }

    return {
      limit: userProfile?.storageLimit || limits[tier] || limits.GRATIS,
      unlimited: false,
      tier
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
   * Check if compression should be applied
   */
  const shouldCompress = useCallback(() => {
    if (isAdmin()) return true // Admin can choose
    if (isGratis()) return false // GRATIS: Original quality
    return true // LITE and PRO: Compress
  }, [isAdmin, isGratis])

  return {
    user,
    userProfile,
    loading,
    handleLogout,
    fetchUserProfile,

    // Tier checks
    isGratis: isGratis(),
    isLite: isLite(),
    isPro: isPro(),
    isAdmin: isAdmin(),
    tier: getTier(),

    // Capabilities
    canUploadVideo: canUploadVideo(),
    shouldCompress: shouldCompress(),
    storageQuota: getStorageQuota(),

    // Legacy
    isAuthenticated: !!user,
  }
}

export default useAuth
