// ============================================================================
// AuthProvider.jsx - SINGLE SOURCE OF TRUTH FOR FIREBASE AUTH
// ============================================================================
// CRITICAL: This is the ONLY file allowed to call onAuthStateChanged
// All other components MUST read auth state from Zustand via useAuth()
// ============================================================================
import { useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useStore from '../state/store'

/**
 * AuthProvider - Initializes and manages Firebase authentication state
 *
 * RESPONSIBILITIES:
 * - Set up single onAuthStateChanged listener
 * - Reload user to get fresh emailVerified status
 * - Sync auth state to Zustand store
 * - Fetch user profile from Firestore
 * - Set loading to false ONLY after all sync is complete
 *
 * IMPORTANT: This is the ONLY component allowed to:
 * - Call onAuthStateChanged
 * - Call user.reload()
 * - Directly update auth state in Zustand
 */
export const AuthProvider = ({ children }) => {
  const setUser = useStore((state) => state.setUser)
  const setUserProfile = useStore((state) => state.setUserProfile)
  const setLoading = useStore((state) => state.setLoading)
  const setEmailVerified = useStore((state) => state.setEmailVerified)

  useEffect(() => {
    const auth = getAuth()

    // ✅ SINGLE AUTH LISTENER - This is the ONLY onAuthStateChanged in the entire app
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // User logged out - clear all auth state
        setUser(null)
        setUserProfile(null)
        setEmailVerified(false)
        setLoading(false)
        console.log('[AUTH PROVIDER] User logged out, state cleared')
        return
      }

      // User is logged in - sync all auth state
      try {
        // 🚀 PERCEIVED PERFORMANCE FIX: Show UI immediately, sync in background
        // Step 1: Set user immediately with current data
        setUser({ ...currentUser })
        setEmailVerified(currentUser.emailVerified)
        setLoading(false) // ✅ Unblock UI immediately
        console.log('[AUTH PROVIDER] Initial user set, UI unblocked')

        // Step 2: Reload user in background to get fresh emailVerified status
        currentUser.reload().then(() => {
          console.log('[AUTH PROVIDER] User reloaded, emailVerified:', currentUser.emailVerified)
          // Update with fresh data
          setUser({ ...currentUser })
          setEmailVerified(currentUser.emailVerified)
        }).catch((error) => {
          console.warn('[AUTH PROVIDER] Background reload failed:', error)
        })

        // Step 3: Get fresh ID token in background
        currentUser.getIdToken(true).catch((error) => {
          console.warn('[AUTH PROVIDER] Background token refresh failed:', error)
        })

        // Step 4: Fetch user profile in background
        fetchUserProfile(currentUser.uid).then(() => {
          console.log('[AUTH PROVIDER] Background profile sync complete')
        }).catch((error) => {
          console.warn('[AUTH PROVIDER] Background profile fetch failed:', error)
        })
      } catch (error) {
        console.error('[AUTH PROVIDER] Error syncing auth state:', error)

        // Even if sync fails, set the user and complete loading
        setUser({ ...currentUser })
        setEmailVerified(currentUser.emailVerified)
        setLoading(false)
      }
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [setUser, setUserProfile, setLoading, setEmailVerified])

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        useStore.getState().setUserProfile(userDoc.data())
        console.log('[AUTH PROVIDER] User profile loaded')
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile = {
          uid,
          userId: uid,
          role: 'user',
          subscriptionTier: 'FREE',
          storageLimit: 1073741824, // 1 GB
          storageUsed: 0,
          currentAlbumCount: 0, // 🆕 Counter for freemium limits
          currentPhotoCount: 0, // 🆕 Optional: total photos
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        try {
          await setDoc(userRef, defaultProfile)
          console.log('[AUTH PROVIDER] Created default user profile')
        } catch (writeErr) {
          console.warn('[AUTH PROVIDER] Could not create user profile:', writeErr.message)
        }

        useStore.getState().setUserProfile(defaultProfile)
      }
    } catch (error) {
      console.error('[AUTH PROVIDER] Error fetching user profile:', error)
    }
  }

  // Render children - this provider doesn't render any UI
  return children
}

export default AuthProvider
