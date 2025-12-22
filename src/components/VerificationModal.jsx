// ============================================================================
// COMPONENT: VerificationModal.jsx – Email verification required gate
// ============================================================================
import React, { useState } from 'react'
import { Mail, ShieldAlert, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sendEmailVerification } from 'firebase/auth'
import useStore from '../state/store'

const VerificationModal = ({ isOpen, onClose, feature }) => {
  const { t } = useTranslation(['auth', 'common'])
  const [resending, setResending] = useState(false)
  const user = useStore((state) => state.user)
  const setNotification = useStore((state) => state.setNotification)

  if (!isOpen) return null

  const handleResendVerification = async () => {
    if (!user) return

    setResending(true)
    try {
      await sendEmailVerification(user)
      setNotification({
        message: t('auth:verificationEmailSent') || 'Verification email sent! Check your inbox.',
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to resend verification:', error)
      // Silent failure - only show info in dev mode, not blocking error
      if (import.meta.env.DEV) {
        setNotification({
          message: t('auth:verificationEmailFailed') || 'Failed to send verification email',
          type: 'info',
        })
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass card-premium relative w-full max-w-md p-6 rounded-2xl shadow-2xl text-gray-100 animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20">
            <ShieldAlert className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold">
            {t('auth:verificationRequired') || 'Email Verification Required'}
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-4 mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            {t('auth:verificationRequiredMessage', { feature }) ||
              `To use ${feature || 'this feature'}, you need to verify your email address first.`}
          </p>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-300 mb-1">
                  {t('auth:verificationEmailSentTo') || 'Verification email sent to:'}
                </p>
                <p className="text-sm font-medium text-white">{user?.email}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed">
            {t('auth:checkSpamFolder') ||
              "Can't find the email? Check your spam folder or request a new verification email."}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="ripple-effect w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600
                       text-white text-sm font-semibold shadow-sm transition-all duration-150
                       flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t('auth:sendingVerification') || 'Sending...'}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {t('auth:resendVerification') || 'Resend Verification Email'}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="ripple-effect w-full py-3 rounded-xl bg-gray-700/70 hover:bg-gray-600/80
                       text-gray-200 text-sm font-semibold transition-all duration-150"
          >
            {t('common:close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerificationModal
