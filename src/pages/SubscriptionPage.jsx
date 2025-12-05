// ============================================================================
// SubscriptionPage - Phase 2: Subscription & Storage Management
// ============================================================================
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import usePhotoData from '../hooks/usePhotoData';
import useStore from '../state/store';
import {
  ArrowLeft,
  Crown,
  HardDrive,
  Image,
  Zap,
  Check,
  Sparkles,
  Shield,
  Database,
} from 'lucide-react'

/**
 * Subscription Page
 * Shows current plan, storage usage, and AI quota
 */
const SubscriptionPage = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'subscription']);
  const { userProfile, tier, isAdmin } = useAuth(); // ✅ Use tier
  const { photos } = usePhotoData();
  const storageUsed = useStore((state) => state.storageUsed);
  const storageLimit = useStore((state) => state.storageLimit);

  /**
   * Calculate storage usage percentage
   */
  const storagePercentage = useMemo(() => {
    if (isAdmin) return 0 // Unlimited for admins
    return Math.min((storageUsed / storageLimit) * 100, 100)
  }, [storageUsed, storageLimit, isAdmin])

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
   * Get current plan details
   */
  const currentPlan = useMemo(() => {
    if (isAdmin) {
      return {
        name: 'Admin',
        storage: 'Unlimited',
        compression: 'Valgfri',
        video: 'Ja',
        color: 'from-red-600 to-red-800',
        icon: <Shield className="w-6 h-6" />,
      }
    }

    switch(tier) {
      case 'PRO':
        return {
          name: 'PRO',
          storage: '50 GB',
          compression: 'Ja',
          video: 'Ja',
          color: 'from-purple-600 to-pink-600',
          icon: <Crown className="w-6 h-6" />,
        }
      case 'LITE':
        return {
          name: 'LITE',
          storage: '5 GB',
          compression: 'Ja',
          video: 'Nei',
          color: 'from-blue-600 to-cyan-600',
          icon: <Zap className="w-6 h-6" />,
        }
      case 'GRATIS':
      default:
        return {
          name: 'GRATIS',
          storage: '1 GB',
          compression: 'Nei (original)',
          video: 'Nei',
          color: 'from-gray-600 to-gray-700',
          icon: <Database className="w-6 h-6" />,
        }
    }
  }, [tier, isAdmin])

  /**
   * Subscription plans
   */
  const plans = [
    {
      id: 'GRATIS',
      name: 'GRATIS',
      price: '0 kr',
      period: 'for alltid',
      storage: '1 GB',
      compression: 'Original kvalitet',
      video: 'Nei',
      features: [
        '1 GB lagring',
        'Original bildekvalitet',
        'Album-organisering',
        'QR-kode deling',
        'Collage Builder',
        'Timeline',
        'Søk i bilder'
      ],
      color: 'from-gray-600 to-gray-700',
      current: tier === 'GRATIS',
    },
    {
      id: 'LITE',
      name: 'LITE',
      price: '29 kr',
      period: 'per måned',
      storage: '5 GB',
      compression: 'Ja',
      video: 'Nei',
      features: [
        'Alt i GRATIS',
        '5 GB lagring',
        'Bildekomprimering',
        'Prioritert support'
      ],
      color: 'from-blue-600 to-cyan-600',
      current: tier === 'LITE',
      recommended: false,
    },
    {
      id: 'PRO',
      name: 'PRO',
      price: '79 kr',
      period: 'per måned',
      storage: '50 GB',
      compression: 'Ja',
      video: 'Ja',
      features: [
        'Alt i LITE',
        '50 GB lagring',
        'Video upload og playback',
        'Bildekomprimering',
        'AI-funksjoner (fremtidig)',
        'Prioritert support',
        'Early access til nye features'
      ],
      color: 'from-purple-600 to-pink-600',
      current: tier === 'PRO',
      recommended: true,
    },
  ]
  const setCurrentPage = useStore((state) => state.setCurrentPage)
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/more')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Subscription & Storage</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Current Plan Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Plan</h2>
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
                <HardDrive className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Lagring</span>
              </div>
              <p className="text-2xl font-bold">{currentPlan.storage}</p>
            </div>

            {/* Photos */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-gray-400">Bilder</span>
              </div>
              <p className="text-2xl font-bold">{photos.length}</p>
            </div>

            {/* Compression */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Komprimering</span>
              </div>
              <p className="text-lg font-bold">{currentPlan.compression}</p>
            </div>

            {/* Video */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Video</span>
              </div>
              <p className="text-lg font-bold">{currentPlan.video}</p>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Lagringsbruk</h2>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">
                {formatBytes(storageUsed)} /{' '}
                {isAdmin ? '∞' : formatBytes(storageLimit)}
              </span>
              <span className="text-gray-400">
                {isAdmin ? 'Ubegrenset' : `${storagePercentage.toFixed(1)}%`}
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
                style={{ width: `${isAdmin ? 20 : storagePercentage}%` }}
              />
            </div>
          </div>

          {storagePercentage > 80 && !isAdmin && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                Du holder på å gå tom for lagring. Vurder å oppgradere til
                {tier === 'GRATIS' ? ' LITE eller PRO' : ' PRO'}.
              </p>
            </div>
          )}
        </div>

        {/* Available Plans */}
        {!isAdmin && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Velg Din Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        ANBEFALT
                      </span>
                    </div>
                  )}

                  {plan.current && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        DIN PLAN
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
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      plan.current
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Nåværende Plan' : `Oppgrader til ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-3">Om Abonnementene</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• <strong>GRATIS:</strong> Perfekt for å teste ut Pixtr. Original bildekvalitet uten komprimering.</p>
            <p>• <strong>LITE:</strong> For deg som trenger mer plass med bildekomprimering for optimal lagring.</p>
            <p>• <strong>PRO:</strong> Full pakke med video support, mye lagring og tilgang til alle fremtidige AI-funksjoner.</p>
            <p className="pt-2 border-t border-white/10">
              Alle planer inkluderer QR-kode deling, Collage Builder, Timeline og søkefunksjonalitet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage
