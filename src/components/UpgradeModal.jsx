/**
 * UpgradeModal - Psychology-driven conversion modal
 * Shows when users hit freemium limits
 */

import { X, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useStore from '../state/store'
import { canShowModal, markModalShown } from '../utils/modalTracking'

/**
 * Map modal types to translation keys
 */
const TYPE_TO_TRANSLATION_KEY = {
  'album-limit': 'albumLimit',
  'photo-limit': 'photoLimit',
  'editor-save': 'editorSave',
  'collage-save': 'collageSave',
  'storage-warning': 'storageWarning',
  'storage-full': 'storageFull',
  'qr-sharing': 'qrSharing',
}

export default function UpgradeModal() {
  const { t } = useTranslation('upgrade')
  const upgradeModal = useStore((state) => state.upgradeModal)
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)

  if (!upgradeModal) return null

  const { type } = upgradeModal
  const translationKey = TYPE_TO_TRANSLATION_KEY[type]

  if (!translationKey) {
    console.error(`Unknown upgrade modal type: ${type}`)
    return null
  }

  // Check modal fatigue (24h cooldown)
  if (!canShowModal(type)) {
    console.log(`Modal ${type} shown recently, skipping`)
    setUpgradeModal(null)
    return null
  }

  const handleClose = () => {
    markModalShown(type)
    setUpgradeModal(null)
  }

  const handleUpgrade = () => {
    markModalShown(type)
    // TODO: Navigate to upgrade page or Stripe checkout
    console.log('Upgrade clicked:', type)
    window.showToast?.('Upgrade flow coming soon!', 'info')
    setUpgradeModal(null)
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative max-w-md w-full bg-gradient-to-br rounded-2xl shadow-2xl border border-white/10 animate-scale-in"
        style={{ background: 'var(--gradient-modal-dark)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="text-6xl mb-4 animate-bounce-subtle">
            {t(`${translationKey}.icon`)}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 text-white">
            {t(`${translationKey}.title`)}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-400 mb-6">{t(`${translationKey}.subtitle`)}</p>

          {/* Pain Point → Solution */}
          <div className="bg-black/30 rounded-lg p-4 mb-6 border border-white/5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-red-400">❌ {t(`${translationKey}.painPoint`)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">✅ {t(`${translationKey}.solution`)}</span>
            </div>
          </div>

          {/* Features */}
          <div className="text-left space-y-2 mb-6">
            {t(`${translationKey}.features`, { returnObjects: true }).map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-white mb-1">
              {t(`${translationKey}.price`)}
            </p>
            <p className="text-xs text-gray-400">{t('common.cancelAnytime')}</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t(`${translationKey}.cta`)}
              </span>
            </button>

            <button
              onClick={handleClose}
              className="w-full py-3 text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              {t('common.maybeLater')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
