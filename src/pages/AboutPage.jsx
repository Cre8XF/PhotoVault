import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Shield,
  Lock,
  Sparkles,
  Image,
  Search,
  QrCode,
  Info,
} from 'lucide-react'

/**
 * AboutPage - In-app informational page about Pixtr
 * Accessible from Account → Information → About Pixtr
 * Reuses content from LandingPage in an informational format
 */
const AboutPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['landing', 'common'])

  const coreFeatures = [
    {
      icon: Shield,
      title: t('landing:features.privacy.title'),
      description: t('landing:features.privacy.desc'),
    },
    {
      icon: Image,
      title: t('landing:features.albums.title'),
      description: t('landing:features.albums.desc'),
    },
    {
      icon: Search,
      title: t('landing:features.search.title'),
      description: t('landing:features.search.desc'),
    },
    {
      icon: Sparkles,
      title: t('landing:features.collage.title'),
      description: t('landing:features.collage.desc'),
    },
    {
      icon: QrCode,
      title: t('landing:features.sharing.title'),
      description: t('landing:features.sharing.desc'),
    },
    {
      icon: Lock,
      title: t('landing:features.control.title'),
      description: t('landing:features.control.desc'),
    },
  ]

  const plans = [
    {
      name: 'FREE',
      storage: '1 GB',
      features: [
        t('landing:pricing.free.feature1'),
        t('landing:pricing.free.feature2'),
        t('landing:pricing.free.feature3'),
        t('landing:pricing.free.feature4'),
      ],
    },
    {
      name: 'LITE',
      storage: '5 GB',
      features: [
        t('landing:pricing.lite.feature1'),
        t('landing:pricing.lite.feature2'),
        t('landing:pricing.lite.feature3'),
        t('landing:pricing.lite.feature4'),
      ],
    },
    {
      name: 'PRO',
      storage: '50 GB',
      features: [
        t('landing:pricing.pro.feature1'),
        t('landing:pricing.pro.feature2'),
        t('landing:pricing.pro.feature3'),
        t('landing:pricing.pro.feature4'),
      ],
    },
  ]

  return (
    <div className="min-h-screen pb-24">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/more')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t('landing:about.pageTitle')}</h1>
          </div>
          <div className="text-xs opacity-70 font-mono">
            v{import.meta.env.VITE_VERSION || '7.1'}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* What is Pixtr */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Info className="w-5 h-5 text-purple" />
            </div>
            <h2 className="text-xl font-bold">{t('landing:about.whatIs.title')}</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {t('landing:hero.subtitle')}
          </p>
        </section>

        {/* Core Principles */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{t('landing:about.corePrinciples.title')}</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {t('landing:why.noTracking.title')}
                </h3>
                <p className="text-sm text-gray-300">
                  {t('landing:why.noTracking.desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {t('landing:why.yourData.title')}
                </h3>
                <p className="text-sm text-gray-300">
                  {t('landing:why.yourData.desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {t('landing:why.creative.title')}
                </h3>
                <p className="text-sm text-gray-300">
                  {t('landing:why.creative.desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {t('landing:features.title')}
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            {t('landing:features.subtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg">
                    <feature.icon className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Plans Overview */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {t('landing:pricing.title')}
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            {t('landing:pricing.subtitle')}
          </p>
          <div className="space-y-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">{plan.name}</h3>
                  <span className="text-sm text-gray-400">
                    {plan.storage} {t('landing:pricing.storage')}
                  </span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy & Control */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{t('landing:about.privacyControl.title')}</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              {t('landing:about.privacyControl.para1')}
            </p>
            <p>
              {t('landing:about.privacyControl.para2')}
            </p>
            <p className="text-xs text-gray-400 pt-2">
              {t('landing:about.privacyControl.para3')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
