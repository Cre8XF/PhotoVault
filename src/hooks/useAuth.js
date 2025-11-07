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
            storageLimit: 524288000, // 500 MB
            createdAt: new Date().toISOString(),
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

  /**
   * Determine admin and pro status
   */
  const isAdmin = useCallback(() => {
    // Accept both Firestore role and specific email
    return userProfile?.role === 'admin' || user?.email === 'rogsor80@gmail.com'
  }, [userProfile, user])

  const isPro = useCallback(() => {
    return (
      userProfile?.isPro === true ||
      userProfile?.role === 'pro' ||
      userProfile?.role === 'admin'
    )
  }, [userProfile])

  /**
   * Get user's storage quota
   */
  const getStorageQuota = useCallback(() => {
    return {
      limit: userProfile?.storageLimit || 524288000, // 500 MB default
      unlimited: isAdmin(),
    }
  }, [userProfile, isAdmin])

  return {
    user,
    userProfile,
    loading,
    handleLogout,
    fetchUserProfile,
    isAdmin: isAdmin(),
    isPro: isPro(),
    storageQuota: getStorageQuota(),
    isAuthenticated: !!user,
  }
}

export default useAuth
