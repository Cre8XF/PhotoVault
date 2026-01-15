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
        console.log('[AUTH PROVIDER] Auth state changed:', { uid: currentUser.uid, emailVerified: currentUser.emailVerified })
        setUser({ ...currentUser })
        setEmailVerified(currentUser.emailVerified)
        setLoading(false)
        console.log('[AUTH PROVIDER] User state set, loading=false, UI unblocked')

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

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        setUserProfile(userDoc.data())
        console.log('[AUTH PROVIDER] Firestore profile loaded:', { uid, role: userDoc.data().role })
        return
      }

      // 🆕 Create default profile
      console.log('[AUTH PROVIDER] No Firestore profile found, creating default profile...')
      const defaultProfile = {
        uid,
        userId: uid,
        role: 'user',
        subscriptionTier: 'FREE',
        storageLimit: 1073741824, // 1 GB
        storageUsed: 0,
        currentAlbumCount: 0,
        currentPhotoCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      try {
        await setDoc(userRef, defaultProfile)
        console.log('[AUTH PROVIDER] Default Firestore profile created successfully')
      } catch (writeErr) {
        console.warn(
          '[AUTH PROVIDER] Failed to create Firestore profile:',
          writeErr.message
        )
      }

      setUserProfile(defaultProfile)
      console.log('[AUTH PROVIDER] Profile state updated with default values')
    } catch (error) {
      console.error('[AUTH PROVIDER] Error fetching user profile:', error)
    }
  }

  return children
}

export default AuthProvider
