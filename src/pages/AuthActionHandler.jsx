// ============================================================================
// AuthActionHandler.jsx - Firebase Auth Action Handler for Netlify SPA
// ============================================================================
// Handles Firebase authentication actions that land on /__/auth/action
// Required because Netlify serves the SPA instead of Firebase's hosted handler
// ============================================================================
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAuth, applyActionCode } from 'firebase/auth'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import useStore from '../state/store'

/**
 * AuthActionHandler Component
 *
 * Handles Firebase auth actions:
 * - verifyEmail: Apply email verification code
 * - resetPassword: Handle password reset (future)
 * - recoverEmail: Handle email recovery (future)
 *
 * Flow:
 * 1. Parse URL params (mode, oobCode, continueUrl)
 * 2. Apply action code via Firebase
 * 3. Force auth state refresh
 * 4. Show success/error notification
 * 5. Navigate to continueUrl or home
 */
const AuthActionHandler = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = getAuth()

  const [status, setStatus] = useState('processing') // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email...')

  const setNotification = useStore((state) => state.setNotification)
  const setUser = useStore((state) => state.setUser)
  const setEmailVerified = useStore((state) => state.setEmailVerified)

  useEffect(() => {
    handleAuthAction()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Main handler for auth actions
   */
  const handleAuthAction = async () => {
    try {
      // Parse query parameters
      const mode = searchParams.get('mode')
      const oobCode = searchParams.get('oobCode')
      const continueUrl = searchParams.get('continueUrl')

      console.log('[AUTH ACTION] Mode:', mode, 'Code present:', !!oobCode)

      // Validate required params
      if (!mode || !oobCode) {
        throw new Error('Invalid verification link. Missing required parameters.')
      }

      // Handle different auth action modes
      switch (mode) {
        case 'verifyEmail':
          await handleVerifyEmail(oobCode, continueUrl)
          break

        case 'resetPassword':
          // Future: handle password reset
          setStatus('error')
          setMessage('Password reset must be handled in the app. Please use the forgot password feature.')
          setTimeout(() => navigate('/'), 3000)
          break

        case 'recoverEmail':
          // Future: handle email recovery
          setStatus('error')
          setMessage('Email recovery not yet supported.')
          setTimeout(() => navigate('/'), 3000)
          break

        default:
          throw new Error(`Unknown auth action mode: ${mode}`)
      }
    } catch (error) {
      console.error('[AUTH ACTION] Error:', error)
      handleError(error)
    }
  }

  /**
   * Handle email verification
   */
  const handleVerifyEmail = async (oobCode, continueUrl) => {
    try {
      // Step 1: Apply the verification code
      console.log('[AUTH ACTION] Applying verification code...')
      await applyActionCode(auth, oobCode)
      console.log('[AUTH ACTION] ✅ Verification code applied successfully')

      // Step 2: If user is logged in, refresh their auth state
      if (auth.currentUser) {
        console.log('[AUTH ACTION] Refreshing user auth state...')
        await auth.currentUser.reload()
        await auth.currentUser.getIdToken(true)

        // Update Zustand store to force re-renders
        setUser({ ...auth.currentUser })
        setEmailVerified(auth.currentUser.emailVerified)
        console.log('[AUTH ACTION] ✅ User state refreshed, emailVerified:', auth.currentUser.emailVerified)
      }

      // Step 3: Show success state
      setStatus('success')
      setMessage('Email verified successfully! Redirecting...')

      // Step 4: Show success notification
      setNotification({
        message: 'Email verified successfully! Welcome to Pixtr.',
        type: 'success',
      })

      // Step 5: Navigate to continue URL or home
      const redirectUrl = getSafeContinueUrl(continueUrl)
      console.log('[AUTH ACTION] Redirecting to:', redirectUrl)

      setTimeout(() => {
        navigate(redirectUrl, { replace: true })
      }, 2000)
    } catch (error) {
      console.error('[AUTH ACTION] Verification failed:', error)

      // Handle specific Firebase errors
      let errorMessage = 'Email verification failed. '

      if (error.code === 'auth/invalid-action-code') {
        errorMessage += 'This verification link is invalid or has already been used.'
      } else if (error.code === 'auth/expired-action-code') {
        errorMessage += 'This verification link has expired. Please request a new one.'
      } else {
        errorMessage += error.message || 'Please try again or request a new verification email.'
      }

      setStatus('error')
      setMessage(errorMessage)

      setNotification({
        message: errorMessage,
        type: 'error',
      })

      // Redirect to home after error
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 5000)
    }
  }

  /**
   * Handle errors
   */
  const handleError = (error) => {
    setStatus('error')
    setMessage(error.message || 'An error occurred. Please try again.')

    setNotification({
      message: error.message || 'An error occurred while processing your request.',
      type: 'error',
    })

    setTimeout(() => {
      navigate('/', { replace: true })
    }, 3000)
  }

  /**
   * Validate and sanitize continue URL
   * Only allow same-origin URLs to prevent open redirect
   */
  const getSafeContinueUrl = (continueUrl) => {
    if (!continueUrl) return '/'

    try {
      const url = new URL(continueUrl)
      const currentOrigin = window.location.origin

      // Only allow same-origin redirects
      if (url.origin === currentOrigin) {
        return url.pathname + url.search + url.hash
      }

      console.warn('[AUTH ACTION] Blocked cross-origin redirect:', continueUrl)
      return '/'
    } catch {
      // Invalid URL - default to home
      return '/'
    }
  }

  /**
   * Render UI based on status
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)] p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-2xl border border-white/10">
        <div className="flex flex-col items-center text-center">
          {/* Status Icon */}
          {status === 'processing' && (
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
          )}

          {/* Status Message */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'processing' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          <p className="text-gray-300 mb-6">{message}</p>

          {/* Action Buttons */}
          {status === 'error' && (
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthActionHandler
