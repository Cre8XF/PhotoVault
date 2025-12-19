// ============================================================================
// COMPONENT: VerificationBanner.jsx – Email verification reminder banner
// ============================================================================
import React, { useState } from 'react'
import { Mail, X, RefreshCw, Edit } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sendEmailVerification, updateEmail } from 'firebase/auth'
import useStore from '../state/store'
import { useAuth } from '../hooks/useAuth'

const VerificationBanner = ({ user }) => {
  const { t } = useTranslation(['auth', 'common'])
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const setNotification = useStore((state) => state.setNotification)
  const { refreshUser } = useAuth()

  // Don't show if verified or dismissed
  if (!user || user.emailVerified || dismissed) return null

  // --------------------------------------------------
  // Resend verification email
  // --------------------------------------------------
  const handleResendVerification = async () => {
    setResending(true)
    try {
      await sendEmailVerification(user)
      setNotification({
        message:
          t('auth:verificationEmailSent') ||
          'Verification email sent! Check your inbox.',
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to resend verification:', error)
      setNotification({
        message:
          t('auth:verificationEmailFailed') ||
          'Failed to send verification email',
        type: 'error',
      })
    } finally {
      setResending(false)
    }
  }

  // --------------------------------------------------
  // Change email address
  // --------------------------------------------------
  const handleChangeEmail = async (e) => {
    e.preventDefault()
    if (!newEmail || newEmail === user.email) return

    try {
      await updateEmail(user, newEmail)
      await sendEmailVerification(user)
      setNotification({
        message:
          t('auth:emailUpdated') ||
          'Email updated! Verification sent to new address.',
        type: 'success',
      })
      setShowEmailChange(false)
      setNewEmail('')
    } catch (error) {
      console.error('Failed to update email:', error)

      let errorMessage = t('auth:emailUpdateFailed') || 'Failed to update email'

      if (error.code === 'auth/requires-recent-login') {
        errorMessage =
          t('auth:recentLoginRequired') ||
          'Please log out and log in again to change your email'
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('auth:errors.emailInUse') || 'Email already in use'
      }

      setNotification({
        message: errorMessage,
        type: 'error',
      })
    }
  }

  // --------------------------------------------------
  // Manual verification check
  // --------------------------------------------------
  const handleCheckVerification = async () => {
    const verified = await refreshUser()

    if (verified) {
      setNotification({
        message: t('auth:emailVerified') || 'Email verified successfully!',
        type: 'success',
      })
    } else {
      setNotification({
        message:
          t('auth:emailNotVerifiedYet') ||
          'Email not verified yet. Please click the link in your email and try again.',
        type: 'info',
      })
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              {showEmailChange ? (
                <form
                  onSubmit={handleChangeEmail}
                  className="flex items-center gap-2"
                >
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={user.email}
                    className="bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm flex-1"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    {t('common:save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailChange(false)
                      setNewEmail('')
                    }}
                    className="px-3 py-1.5 text-gray-300 hover:text-white text-sm"
                  >
                    {t('common:cancel')}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-white">
                  {t('auth:verifyEmailPrompt') ||
                    'Please verify your email to unlock sharing and Pro features.'}
                </p>
              )}
            </div>
          </div>

          {!showEmailChange && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`}
                />
                {t('auth:resendVerification') || 'Resend'}
              </button>

              <button
                onClick={handleCheckVerification}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                ✓ {t('auth:iVerified') || 'I verified'}
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-lg"
                aria-label={t('common:dismiss')}
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificationBanner
