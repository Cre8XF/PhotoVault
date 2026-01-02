import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Mail, X } from 'lucide-react'

/**
 * Banner shown to unverified users
 * Prompts them to verify email to unlock features
 */
const VerificationBanner = ({ user, onDismiss }) => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  if (!user || user.emailVerified) {
    return null
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
              {t('verificationBanner.description')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/verify-email')}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            {t('verificationBanner.verifyButton')}
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
