import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, X, RefreshCw } from 'lucide-react'
import { sendVerificationEmail } from '../utils/emailVerification'
import useStore from '../state/store'

/**
 * Banner shown to unverified users
 * Prompts them to verify email to unlock features
 */
const VerificationBanner = ({ user, onDismiss }) => {
  const { t } = useTranslation('common')
  const setNotification = useStore((state) => state.setNotification)

  const [resending, setResending] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  if (!user || user.emailVerified) {
    return null
  }

  const handleResendVerification = async () => {
    if (resending || cooldownSeconds > 0) return

    setResending(true)
    try {
      await sendVerificationEmail(user)
      setNotification({
        message: 'Verification email sent! Check your inbox.',
        type: 'success',
      })
      // Start 30-second cooldown
      setCooldownSeconds(30)
    } catch (error) {
      console.error('Failed to resend verification:', error)
      setNotification({
        message: 'Failed to send verification email. Please try again.',
        type: 'error',
      })
    } finally {
      setResending(false)
    }
  }

  const isButtonDisabled = resending || cooldownSeconds > 0

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
              {t('verificationBanner.description')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResendVerification}
            disabled={isButtonDisabled}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : cooldownSeconds > 0 ? (
              `Wait ${cooldownSeconds}s`
            ) : (
              t('verificationBanner.verifyButton')
            )}
          </button>

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
