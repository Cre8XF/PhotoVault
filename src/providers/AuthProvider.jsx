// ============================================================================
// AuthProvider.jsx - SINGLE SOURCE OF TRUTH FOR FIREBASE AUTH
// ============================================================================
// CRITICAL: This is the ONLY file allowed to call onAuthStateChanged
// All other components MUST read auth state from Zustand via useAuth()
// ============================================================================

import { useEffect } from 'react'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useStore from '../state/store'

const AUTH_TIMEOUT_MS = 2500

export const AuthProvider = ({ children }) => {
  const setUser = useStore((state) => state.setUser)
  const setUserProfile = useStore((state) => state.setUserProfile)
  const setLoading = useStore((state) => state.setLoading)
  const setEmailVerified = useStore((state) => state.setEmailVerified)
  const setStorageLimit = useStore((state) => state.setStorageLimit)

  useEffect(() => {
    const auth = getAuth()
    let resolved = false

    // 🔐 HARD FAIL-SAFE: Never block UI forever
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('[AUTH PROVIDER] Auth timeout – continuing without auth')
        setLoading(false)
      }
    }, AUTH_TIMEOUT_MS)

    // ✅ SINGLE AUTH LISTENER
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      resolved = true
      clearTimeout(timeout)

      if (!currentUser) {
        // Logged out
        setUser(null)
        setUserProfile(null)
        setEmailVerified(false)
        setLoading(false)
        console.log('[AUTH PROVIDER] User logged out, state cleared')
        return
      }

      try {
        // 🚀 PERCEIVED PERFORMANCE: unblock UI immediately
        setUser({ ...currentUser })
        setEmailVerified(currentUser.emailVerified)
        setLoading(false)
        console.log('[AUTH PROVIDER] Initial user set, UI unblocked')

        // 🔄 Background: reload user for fresh emailVerified
        currentUser
          .reload()
          .then(() => {
            setUser({ ...currentUser })
            setEmailVerified(currentUser.emailVerified)
            console.log('[AUTH PROVIDER] User reloaded')
          })
          .catch((err) => {
            console.warn('[AUTH PROVIDER] Background reload failed', err)
          })

        // 🔄 Background: refresh token (fail-safe)
        currentUser.getIdToken(true).catch((err) => {
          console.warn(
            '[AUTH PROVIDER] Token refresh failed – signing out',
            err
          )
          signOut(auth)
        })

        // 🔄 Background: profile sync
        fetchUserProfile(currentUser.uid).catch((err) => {
          console.warn('[AUTH PROVIDER] Background profile fetch failed', err)
        })
      } catch (error) {
        console.error('[AUTH PROVIDER] Fatal auth sync error', error)
        await signOut(auth)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [setUser, setUserProfile, setLoading, setEmailVerified])

  // 🔄 Refresh emailVerified when user returns to tab (e.g., after Gmail verification)
  useEffect(() => {
    const auth = getAuth()

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const currentUser = auth.currentUser

        // Only reload if user exists and email is not yet verified
        if (currentUser && !currentUser.emailVerified) {
          try {
            await currentUser.reload()
            setUser({ ...currentUser })
            setEmailVerified(currentUser.emailVerified)
            console.log('[AUTH PROVIDER] Visibility refresh: emailVerified synced')
          } catch (error) {
            console.warn('[AUTH PROVIDER] Visibility refresh failed:', error)
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [setUser, setEmailVerified])

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const profileData = userDoc.data()
        setUserProfile(profileData)
        // Sync storageLimit from Firestore to Zustand store
        if (profileData.storageLimit) {
          setStorageLimit(profileData.storageLimit)
          console.log('[AUTH PROVIDER] Storage limit synced:', profileData.storageLimit)
        }
        console.log('[AUTH PROVIDER] User profile loaded')
        return
      }

      // 🆕 Create default profile
      const defaultProfile = {
        uid,
        userId: uid,
        role: 'user',
        subscriptionTier: 'FREE',
        storageLimit: 524288000, // 500 MB (FREE tier)
        storageUsed: 0,
        currentAlbumCount: 0,
        currentPhotoCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      try {
        await setDoc(userRef, defaultProfile)
        console.log('[AUTH PROVIDER] Created default user profile')
      } catch (writeErr) {
        console.warn(
          '[AUTH PROVIDER] Could not create user profile:',
          writeErr.message
        )
      }

      setUserProfile(defaultProfile)
      setStorageLimit(defaultProfile.storageLimit)
    } catch (error) {
      console.error('[AUTH PROVIDER] Error fetching user profile:', error)
    }
  }

  return children
}

export default AuthProvider
