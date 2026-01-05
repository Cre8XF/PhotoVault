// ============================================================================
// SubscriptionPage - Phase 2: Subscription & Storage Management
// ============================================================================
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuth from '../hooks/useAuth'
import usePhotoData from '../hooks/usePhotoData'
import useStore from '../state/store'
import VerificationModal from '../components/VerificationModal'
import {
  ArrowLeft,
  Crown,
  HardDrive,
  Image,
  Zap,
  Check,
  Sparkles,
  Database,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'

/**
 * Subscription Page
 * Shows current plan, storage usage, and AI quota
 */
const SubscriptionPage = ({ user }) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'subscription'])
  const { userProfile, tier } = useAuth() // ✅ Use tier ONLY
  // Single source of truth for subscription
  const currentTier = tier()
  const { photos } = usePhotoData()
  const storageUsed = useStore((state) => state.storageUsed)
  const storageLimit = useStore((state) => state.storageLimit)
  const emailVerified = useStore((state) => state.emailVerified)
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  /**
   * Calculate storage usage percentage
   */
  const storagePercentage = useMemo(() => {
    if (storageLimit === 0) return 0
    return Math.min((storageUsed / storageLimit) * 100, 100)
  }, [storageUsed, storageLimit])

  /**
   * Format bytes to human-readable size
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Get current plan details based ONLY on subscriptionTier
   */
  const currentPlan = useMemo(() => {
    switch (currentTier) {
      case 'PRO':
        return {
          name: 'PRO',
          storage: '50 GB',
          compression: t('subscription:yes'),
          video: t('subscription:yes'),
          color: 'from-purple-600 to-pink-600',
          icon: <Crown className="w-6 h-6" />,
        }
      case 'LITE':
        return {
          name: 'LITE',
          storage: '10 GB',
          compression: t('subscription:yes'),
          video: t('subscription:no'),
          color: 'from-blue-600 to-cyan-600',
          icon: <Zap className="w-6 h-6" />,
        }
      case 'GRATIS':
      default:
        return {
          name: 'GRATIS',
          storage: '1 GB',
          compression: t('subscription:noOriginal'),
          video: t('subscription:no'),
          color: 'from-gray-600 to-gray-700',
          icon: <Database className="w-6 h-6" />,
        }
    }
  }, [currentTier, t])

  /**
   * Subscription plans
   */
  const plans = [
    {
      id: 'GRATIS',
      name: 'GRATIS',
      price: '0 kr',
      period: t('subscription:forever'),
      storage: '1 GB',
      compression: t('subscription:originalQuality'),
      video: t('subscription:no'),
      features: [
        t('subscription:features.gratis.storage'),
        t('subscription:features.gratis.quality'),
        t('subscription:features.gratis.albums'),
        t('subscription:features.gratis.qrCode'),
        t('subscription:features.gratis.collage'),
        t('subscription:features.gratis.timeline'),
        t('subscription:features.gratis.search'),
      ],
      color: 'from-gray-600 to-gray-700',
      current: currentTier === 'GRATIS',
    },
    {
      id: 'LITE',
      name: 'LITE',
      price: '39 kr',
      period: t('subscription:perMonth'),
      storage: '10 GB',
      compression: t('subscription:yes'),
      video: t('subscription:no'),
      features: [
        t('subscription:features.lite.allInGratis'),
        t('subscription:features.lite.storage'),
        t('subscription:features.lite.compression'),
        t('subscription:features.lite.support'),
      ],
      color: 'from-blue-600 to-cyan-600',
      current: currentTier === 'LITE',
      recommended: true,
    },
    // ⚠️ PHASE 3: PRO tier hidden for launch (backend logic kept intact)
    // Existing PRO users will still see their tier in currentPlan above
    // {
    //   id: 'PRO',
    //   name: 'PRO',
    //   price: '79 kr',
    //   period: 'per måned',
    //   storage: '50 GB',
    //   compression: 'Ja',
    //   video: 'Ja',
    //   features: [
    //     'Alt i LITE',
    //     '50 GB lagring',
    //     'Video upload og playback',
    //     'Bildekomprimering',
    //     'AI-funksjoner (fremtidig)',
    //     'Prioritert support',
    //     'Early access til nye features',
    //   ],
    //   color: 'from-purple-600 to-pink-600',
    //   current: currentTier === 'PRO',
    //   recommended: true,
    // },
  ]
  const setCurrentPage = useStore((state) => state.setCurrentPage)
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/more')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('subscription:pageTitle')}</h1>
        </div>
      </div>

      <div className="min-h-screen pb-24">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Current Plan Card */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('subscription:currentPlan')}</h2>
              <div
                className={`px-4 py-2 bg-gradient-to-r ${currentPlan.color} rounded-full text-white font-medium flex items-center gap-2`}
              >
                {currentPlan.icon}
                {currentPlan.name}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Storage */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-purple" />
                  <span className="text-sm text-gray-400">{t('subscription:storage')}</span>
                </div>
                <p className="text-2xl font-bold">{currentPlan.storage}</p>
              </div>

              {/* Photos */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-5 h-5 text-pink-400" />
                  <span className="text-sm text-gray-400">{t('subscription:photos')}</span>
                </div>
                <p className="text-2xl font-bold">{photos.length}</p>
              </div>

              {/* Compression */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">{t('subscription:compression')}</span>
                </div>
                <p className="text-lg font-bold">{currentPlan.compression}</p>
              </div>

              {/* Video */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">{t('subscription:video')}</span>
                </div>
                <p className="text-lg font-bold">{currentPlan.video}</p>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('subscription:storageUsage')}</h2>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">
                  {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
                </span>
                <span className="text-gray-400">
                  {storagePercentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${
                    storagePercentage > 90
                      ? 'from-red-500 to-red-600'
                      : storagePercentage > 70
                      ? 'from-yellow-500 to-orange-600'
                      : 'from-purple-600 to-pink-600'
                  } transition-all duration-500`}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>

            {/* CRITICAL WARNING - Over 90% */}
            {storagePercentage > 90 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-sm font-semibold text-red-400">
                    {t('subscription:criticalLowStorage')}
                  </p>
                </div>
                <p className="text-sm text-red-300 mb-3">
                  {t('subscription:criticalStorageMessage', { remaining: formatBytes(storageLimit - storageUsed) })}
                </p>
                <button
                  onClick={() => {
                    // Scroll to plans section
                    const plansSection = document.getElementById('plans-section')
                    if (plansSection) {
                      plansSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  {t('subscription:upgradeSubscription')}
                </button>
              </div>
            )}

            {/* WARNING - 80-90% */}
            {storagePercentage > 80 && storagePercentage <= 90 && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm font-semibold text-yellow-400">
                    {t('subscription:lowStorage')}
                  </p>
                </div>
                <p className="text-sm text-yellow-300">
                  {t('subscription:lowStorageMessage', { percent: storagePercentage.toFixed(0) })}
                </p>
              </div>
            )}
          </div>

          {/* Available Plans */}
          <div className="mb-6">
            <h2 id="plans-section" className="text-2xl font-bold mb-6 text-center">
              {t('subscription:choosePlan')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`glass-card p-6 relative ${
                    plan.current ? 'ring-2 ring-purple-500' : ''
                  } ${plan.recommended ? 'shadow-2xl' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                        {t('subscription:recommended')}
                      </span>
                    </div>
                  )}

                  {plan.current && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {t('subscription:yourPlan')}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      if (!plan.current && !emailVerified) {
                        setSelectedPlan(plan.name)
                        setVerificationModalOpen(true)
                      } else if (!plan.current) {
                        // Navigate to billing page for Stripe Checkout
                        navigate('/billing')
                      }
                    }}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      plan.current
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current
                      ? t('subscription:currentPlanButton')
                      : t('subscription:upgradeToButton', { plan: plan.name })}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-3">{t('subscription:aboutSubscriptions')}</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                • <strong>GRATIS:</strong> {t('subscription:aboutGratis')}
              </p>
              <p>
                • <strong>LITE:</strong> {t('subscription:aboutLite')}
              </p>
              {/* PHASE 3: PRO info hidden but tier logic remains */}
              <p className="pt-2 border-t border-white/10">
                {t('subscription:allPlansInclude')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setVerificationModalOpen(false)
          setSelectedPlan(null)
        }}
        feature={selectedPlan ? `upgrade to ${selectedPlan}` : 'plan upgrades'}
      />
    </>
  )
}

export default SubscriptionPage
