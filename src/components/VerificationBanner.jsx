// ============================================================================
// COMPONENT: VerificationBanner.jsx – Email verification reminder banner
// ============================================================================
import React, { useState } from 'react'
import { Mail, X, RefreshCw, Edit } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sendEmailVerification, updateEmail } from 'firebase/auth'
import { auth } from '../firebase'
import useStore from '../state/store'

const VerificationBanner = ({ user }) => {
  const { t } = useTranslation(['auth', 'common'])
  const [resending, setResending] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const setNotification = useStore((state) => state.setNotification)

  // Don't show if verified
  if (!user || user.emailVerified) return null

  const handleResendVerification = async () => {
    setResending(true)
    try {
      await sendEmailVerification(user)
      setNotification({
        message: t('auth:verificationEmailSent') || 'Verification email sent! Check your inbox.',
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to resend verification:', error)
      setNotification({
        message: t('auth:verificationEmailFailed') || 'Failed to send verification email',
        type: 'error',
      })
    } finally {
      setResending(false)
    }
  }

  const handleChangeEmail = async (e) => {
    e.preventDefault()
    if (!newEmail || newEmail === user.email) return

    try {
      await updateEmail(user, newEmail)
      await sendEmailVerification(user)
      setNotification({
        message: t('auth:emailUpdated') || 'Email updated! Verification sent to new address.',
        type: 'success',
      })
      setShowEmailChange(false)
      setNewEmail('')
    } catch (error) {
      console.error('Failed to update email:', error)
      let errorMessage = t('auth:emailUpdateFailed') || 'Failed to update email'

      if (error.code === 'auth/requires-recent-login') {
        errorMessage = t('auth:recentLoginRequired') || 'Please log out and log in again to change your email'
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('auth:errors.emailInUse') || 'Email already in use'
      }

      setNotification({
        message: errorMessage,
        type: 'error',
      })
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-60 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30 backdrop-blur-sm" style={{ zIndex: 60 }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              {showEmailChange ? (
                <form onSubmit={handleChangeEmail} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={user.email}
                    className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm flex-1"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="ripple-effect flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      {t('common:save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailChange(false)
                        setNewEmail('')
                      }}
                      className="ripple-effect flex-1 sm:flex-none px-4 py-2 text-gray-300 hover:text-white text-sm"
                    >
                      {t('common:cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-white">
                  {t('auth:verifyEmailPrompt') || 'Please verify your email to unlock sharing and Pro features.'}
                </p>
              )}
            </div>
          </div>

          {!showEmailChange && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="ripple-effect flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {t('auth:resendVerification') || 'Resend'}
              </button>

              <button
                onClick={() => setShowEmailChange(true)}
                className="ripple-effect flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <Edit className="w-4 h-4" />
                {t('auth:changeEmail') || 'Change Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificationBanner
