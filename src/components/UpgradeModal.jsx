/**
 * UpgradeModal - Psychology-driven conversion modal
 * Shows when users hit freemium limits
 */

import { X, Sparkles, Zap, Crown, Camera } from 'lucide-react'
import useStore from '../state/store'
import { canShowModal, markModalShown } from '../utils/modalTracking'

/**
 * Modal content by type
 */
const MODAL_CONTENT = {
  'album-limit': {
    icon: '📁',
    title: 'You've hit the album limit!',
    subtitle: "But you're clearly loving Pixtr 🎉",
    painPoint: 'GRATIS = 5 albums max',
    solution: 'LITE = Unlimited albums',
    features: [
      '✅ Unlimited albums',
      '✅ 20 photos per album → Unlimited',
      '✅ 750 MB → 5 GB storage',
      '✅ Save filters & collages',
    ],
    cta: 'Upgrade to LITE',
    price: '$4.99/month',
    showUpgradeButton: true,
  },
  'photo-limit': {
    icon: '📸',
    title: 'Album full!',
    subtitle: 'Time to upgrade or create a new album',
    painPoint: 'GRATIS = 20 photos per album',
    solution: 'LITE = Unlimited photos per album',
    features: [
      '✅ Unlimited photos per album',
      '✅ Unlimited albums',
      '✅ 5 GB storage (6.5x more)',
      '✅ Save filters & collages',
    ],
    cta: 'Upgrade to LITE',
    price: '$4.99/month',
    showUpgradeButton: true,
  },
  'editor-save': {
    icon: '🎨',
    title: 'Love this edit?',
    subtitle: 'Upgrade to save it!',
    painPoint: 'GRATIS = Preview only',
    solution: 'LITE = Save all edits',
    features: [
      '✅ Save filters & adjustments',
      '✅ Unlimited albums & photos',
      '✅ 5 GB storage',
      '✅ Save collages',
    ],
    cta: 'Upgrade to LITE',
    price: '$4.99/month',
    showUpgradeButton: true,
  },
  'collage-save': {
    icon: '🖼️',
    title: 'Beautiful collage!',
    subtitle: 'Upgrade to save it',
    painPoint: 'GRATIS = Build only',
    solution: 'LITE = Save collages',
    features: [
      '✅ Save unlimited collages',
      '✅ Save filters & edits',
      '✅ Unlimited albums & photos',
      '✅ 5 GB storage',
    ],
    cta: 'Upgrade to LITE',
    price: '$4.99/month',
    showUpgradeButton: true,
  },
  'storage-warning': {
    icon: '⚠️',
    title: 'Storage almost full',
    subtitle: `You've used 90% of your storage`,
    painPoint: 'GRATIS = 750 MB',
    solution: 'LITE = 5 GB (6.5x more)',
    features: [
      '✅ 5 GB storage (6.5x more)',
      '✅ Unlimited albums & photos',
      '✅ Save filters & collages',
      '✅ Document uploads',
    ],
    cta: 'Upgrade to LITE',
    price: '$4.99/month',
    showUpgradeButton: true,
  },
  'storage-full': {
    icon: '🚫',
    title: 'Storage full!',
    subtitle: 'Delete photos or upgrade',
    painPoint: 'GRATIS = 750 MB',
    solution: 'LITE = 5 GB',
    features: [
      '✅ 5 GB storage (6.5x more)',
      '✅ Unlimited albums & photos',
      '✅ Save filters & collages',
      '✅ Document uploads',
    ],
    cta: 'Upgrade to LITE',
    price: '$4.99/month',
    showUpgradeButton: true,
  },
  'qr-sharing': {
    icon: '🔗',
    title: 'Share with QR codes',
    subtitle: 'PRO feature',
    painPoint: 'LITE = Basic sharing only',
    solution: 'PRO = QR code sharing',
    features: [
      '✅ QR code album sharing',
      '✅ 50 GB storage',
      '✅ Video uploads',
      '✅ Priority support',
    ],
    cta: 'Upgrade to PRO',
    price: '$9.99/month',
    showUpgradeButton: true,
  },
}

export default function UpgradeModal() {
  const upgradeModal = useStore((state) => state.upgradeModal)
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)

  if (!upgradeModal) return null

  const { type } = upgradeModal
  const content = MODAL_CONTENT[type]

  if (!content) {
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
        className="relative max-w-md w-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl border border-white/10 animate-scale-in"
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
          <div className="text-6xl mb-4 animate-bounce-subtle">{content.icon}</div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 text-white">{content.title}</h2>

          {/* Subtitle */}
          <p className="text-gray-400 mb-6">{content.subtitle}</p>

          {/* Pain Point → Solution */}
          <div className="bg-black/30 rounded-lg p-4 mb-6 border border-white/5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-red-400">❌ {content.painPoint}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">✅ {content.solution}</span>
            </div>
          </div>

          {/* Features */}
          <div className="text-left space-y-2 mb-6">
            {content.features.map((feature, index) => (
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
            <p className="text-3xl font-bold text-white mb-1">{content.price}</p>
            <p className="text-xs text-gray-400">Cancel anytime</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            {content.showUpgradeButton && (
              <button
                onClick={handleUpgrade}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {content.cta}
                </span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="w-full py-3 text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
