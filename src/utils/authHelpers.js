// ============================================================================
// Auth Helpers - Re-authentication and Account Management
// ============================================================================

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as firebaseDeleteUser,
} from 'firebase/auth'
import { auth } from '../firebase'

/**
 * Re-authenticate user with email and password
 * Required before sensitive operations like account deletion
 *
 * @param {string} password - User's password
 * @returns {Promise<void>}
 * @throws {Error} - If re-authentication fails
 */
export async function reauthenticateUser(password) {
  const user = auth.currentUser

  if (!user || !user.email) {
    throw new Error('No user is currently signed in')
  }

  if (!password) {
    throw new Error('Password is required for re-authentication')
  }

  try {
    // Create credential with email and password
    const credential = EmailAuthProvider.credential(user.email, password)

    // Re-authenticate
    await reauthenticateWithCredential(user, credential)

    console.log('✅ User re-authenticated successfully')
  } catch (error) {
    console.error('❌ Re-authentication failed:', error)

    // Provide user-friendly error messages
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.')
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error(
        'Too many failed attempts. Please wait a few minutes and try again.'
      )
    } else if (error.code === 'auth/user-mismatch') {
      throw new Error('User mismatch. Please sign in again.')
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please sign in again.')
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid credentials. Please check your password.')
    } else {
      throw new Error(`Re-authentication failed: ${error.message}`)
    }
  }
}

/**
 * Delete Firebase Auth user
 * MUST be called AFTER re-authentication
 *
 * @returns {Promise<void>}
 * @throws {Error} - If deletion fails
 */
export async function deleteAuthUser() {
  const user = auth.currentUser

  if (!user) {
    throw new Error('No user is currently signed in')
  }

  try {
    await firebaseDeleteUser(user)
    console.log('✅ Firebase Auth user deleted successfully')
  } catch (error) {
    console.error('❌ Firebase Auth user deletion failed:', error)

    // Handle common errors
    if (error.code === 'auth/requires-recent-login') {
      throw new Error(
        'Session expired. Please re-authenticate and try again.'
      )
    } else {
      throw new Error(`Failed to delete user account: ${error.message}`)
    }
  }
}
