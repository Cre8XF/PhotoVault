import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { XCircle, ArrowLeft } from 'lucide-react'

/**
 * BillingCancelPage
 *
 * Displayed when user cancels Stripe checkout
 */
const BillingCancelPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('subscription')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t('billingCancel.title')}</h1>
        <p className="text-gray-400 mb-6">
          {t('billingCancel.message')}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/billing')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('billingCancel.backToSubscriptions')}
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
          >
            {t('billingCancel.goToHome')}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400">
            {t('billingCancel.needHelp')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BillingCancelPage
