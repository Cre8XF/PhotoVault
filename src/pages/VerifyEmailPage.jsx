// ============================================================================
// VerifyEmailPage.jsx - Email Verification Landing Page
// ============================================================================
// Handles email verification using handleCodeInApp: true
// Processes verification codes directly in the app
// ============================================================================
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAuth, applyActionCode } from 'firebase/auth'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

/**
 * VerifyEmailPage Component
 *
 * Dedicated landing page for email verification links
 * Provides clear confirmation and next steps after verification
 *
 * Flow:
 * 1. Parse URL params (mode, oobCode)
 * 2. Apply verification code via Firebase
 * 3. Show success confirmation with clear instructions
 * 4. User can return to Pixtr or close tab if app is already open
 * 5. App state automatically refreshes on navigation/refresh
 *
 * Mobile-friendly with clear CTAs to eliminate tab confusion
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = getAuth()
  const hasAttemptedVerification = useRef(false)

  const [status, setStatus] = useState('idle') // 'idle' | 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Hard guard: only verify if we have valid params and haven't already attempted
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    // Missing params is NOT an error - redirect silently
    if (!oobCode || mode !== 'verifyEmail') {
      console.log('[VERIFY EMAIL] Missing params, redirecting to home')
      navigate('/', { replace: true })
      return
    }

    // Prevent double execution
    if (hasAttemptedVerification.current) {
      console.log('[VERIFY EMAIL] Already attempted verification, skipping')
      return
    }

    hasAttemptedVerification.current = true
    handleEmailVerification()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Main handler for email verification
   */
  const handleEmailVerification = async () => {
    const oobCode = searchParams.get('oobCode')

    setStatus('processing')
    setMessage('Verifying your email...')
    console.log('[VERIFY EMAIL] Starting verification...')

    try {
      // Apply the verification code
      console.log('[VERIFY EMAIL] Applying verification code...')
      await applyActionCode(auth, oobCode)
      console.log('[VERIFY EMAIL] ✅ Verification code applied successfully')

      // Show success state - message now handled in JSX for better UX
      setStatus('success')
    } catch (error) {
      console.error('[VERIFY EMAIL] Verification failed:', error)

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
    }
  }

  /**
   * Render UI based on status
   */
  // Don't render anything if idle (redirecting)
  if (status === 'idle') {
    return null
  }

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
            {status === 'processing' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified! 🎉'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Success State */}
          {status === 'success' && (
            <>
              <p className="text-gray-300 mb-3">
                Your email has been successfully verified. You can now access all Pixtr features!
              </p>
              <p className="text-gray-400 text-sm mb-6">
                If Pixtr is already open in another tab, you can close this one or refresh the app to see your verified status.
              </p>
              <button
                onClick={() => {
                  // Navigate to home - user state will be automatically refreshed
                  window.location.href = '/'
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Open Pixtr
              </button>
            </>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <p className="text-gray-300">{message}</p>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <p className="text-gray-300 mb-6">{message}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Return to Pixtr
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
