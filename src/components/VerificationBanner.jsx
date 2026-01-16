import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, X, RefreshCw } from 'lucide-react'
import { sendVerificationEmail } from '../utils/emailVerification'
import useStore from '../state/store'

/**
 * Banner shown to unverified users
 * Prompts them to verify email to unlock features
 *
 * UX Logic:
 * - If verification email sent < 60s ago: Show info only (no button)
 * - If ≥ 60s ago: Show "Send again" button
 * - Never show false errors (Firebase auto-sends on signup)
 */
const VerificationBanner = ({ user, onDismiss }) => {
  const { t } = useTranslation('common')
  const setNotification = useStore((state) => state.setNotification)

  const [resending, setResending] = useState(false)
  const [showButton, setShowButton] = useState(true)

  // Check if we're in the 60-second info-only period
  useEffect(() => {
    const checkCooldown = () => {
      const sentAt = localStorage.getItem('verificationEmailSentAt')
      if (sentAt) {
        const timeSinceSent = Date.now() - parseInt(sentAt, 10)
        const COOLDOWN_MS = 60000 // 60 seconds

        if (timeSinceSent < COOLDOWN_MS) {
          setShowButton(false)
          // Set timeout to show button when cooldown expires
          const timeRemaining = COOLDOWN_MS - timeSinceSent
          const timer = setTimeout(() => {
            setShowButton(true)
          }, timeRemaining)
          return () => clearTimeout(timer)
        } else {
          setShowButton(true)
        }
      } else {
        setShowButton(true)
      }
    }

    checkCooldown()
  }, [])

  if (!user || user.emailVerified) {
    return null
  }

  const handleResendVerification = async () => {
    if (resending) return

    setResending(true)
    try {
      await sendVerificationEmail(user)

      // Update timestamp for next cooldown
      localStorage.setItem('verificationEmailSentAt', Date.now().toString())

      // Always show success (never error)
      setNotification({
        message: t('verificationBanner.emailSent'),
        type: 'success',
      })

      // Hide button for 60 seconds
      setShowButton(false)
      setTimeout(() => {
        setShowButton(true)
      }, 60000)
    } catch (error) {
      console.error('Verification email error:', error)

      // Firebase rate limit or already-sent error
      // Show INFO message, not error
      if (error.code === 'auth/too-many-requests') {
        setNotification({
          message: t('verificationBanner.alreadySent'),
          type: 'info',
        })
      } else {
        // Generic success message (don't expose internals)
        setNotification({
          message: t('verificationBanner.emailSent'),
          type: 'success',
        })
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              {t('verificationBanner.title')}
            </p>
            <p className="text-xs opacity-90">
              {showButton
                ? t('verificationBanner.description')
                : t('verificationBanner.infoOnly')
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showButton && (
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t('verificationBanner.sending')}
                </>
              ) : (
                t('verificationBanner.sendAgain')
              )}
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificationBanner
