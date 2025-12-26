import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Sparkles,
  Lock,
  Search,
  Image,
  QrCode,
  Check,
  ArrowRight,
  Globe,
} from 'lucide-react'

/**
 * Public landing page for unauthenticated users
 * Shows value proposition before login/signup
 */
function LandingPage() {
  const { t, i18n } = useTranslation(['landing', 'common'])
  const navigate = useNavigate()
  const [currentLang, setCurrentLang] = useState(i18n.language)

  const toggleLanguage = () => {
    const newLang = currentLang === 'no' ? 'en' : 'no'
    i18n.changeLanguage(newLang)
    setCurrentLang(newLang)
  }

  const features = [
    {
      icon: Shield,
      title: t('landing:features.privacy.title'),
      description: t('landing:features.privacy.desc'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Image,
      title: t('landing:features.albums.title'),
      description: t('landing:features.albums.desc'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Search,
      title: t('landing:features.search.title'),
      description: t('landing:features.search.desc'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Sparkles,
      title: t('landing:features.collage.title'),
      description: t('landing:features.collage.desc'),
      color: 'from-orange-500 to-yellow-500',
    },
    {
      icon: QrCode,
      title: t('landing:features.sharing.title'),
      description: t('landing:features.sharing.desc'),
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Lock,
      title: t('landing:features.control.title'),
      description: t('landing:features.control.desc'),
      color: 'from-violet-500 to-purple-500',
    },
  ]

  const pricing = [
    {
      name: 'GRATIS',
      price: '0 kr',
      period: t('landing:pricing.free.period'),
      storage: '1 GB',
      limitation: t('landing:pricing.free.limitation'),
      cta: t('landing:cta.startFree'),
      features: [
        t('landing:pricing.free.feature1'),
        t('landing:pricing.free.feature2'),
        t('landing:pricing.free.feature3'),
        t('landing:pricing.free.feature4'),
      ],
    },
    {
      name: 'LITE',
      price: '39 kr',
      period: t('landing:pricing.lite.period'),
      storage: '5 GB',
      recommended: true,
      trustLine: t('landing:pricing.lite.trustLine'),
      cta: t('landing:cta.startLite'),
      unlocks: [
        t('landing:pricing.lite.unlock1'),
        t('landing:pricing.lite.unlock2'),
        t('landing:pricing.lite.unlock3'),
        t('landing:pricing.lite.unlock4'),
      ],
      features: [
        t('landing:pricing.lite.feature1'),
        t('landing:pricing.lite.feature2'),
        t('landing:pricing.lite.feature3'),
      ],
    },
    {
      name: 'PRO',
      price: '79 kr',
      period: t('landing:pricing.pro.period'),
      storage: '50 GB',
      trustLine: t('landing:pricing.pro.trustLine'),
      cta: t('landing:cta.startPro'),
      features: [
        t('landing:pricing.pro.feature1'),
        t('landing:pricing.pro.feature2'),
        t('landing:pricing.pro.feature3'),
        t('landing:pricing.pro.feature4'),
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold">P</span>
            </div>
            <span className="text-2xl font-bold">PIXTR</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">
                {currentLang === 'no' ? 'NO' : 'EN'}
              </span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition"
            >
              {t('landing:cta.startFree')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('landing:hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              {t('landing:hero.subtitle')}
            </p>
            <p className="text-sm text-gray-400 pt-1">
              {t('landing:hero.trustLine')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg transition flex items-center gap-2"
              >
                {t('landing:cta.startFree')}
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#pricing"
                className="px-8 py-4 border border-white/20 hover:bg-white/10 rounded-xl font-semibold text-lg transition"
              >
                {t('landing:cta.seePlans')}
              </a>
            </div>

            <p className="text-sm text-gray-400 pt-2">
              {t('landing:hero.noCreditCard')}
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl" />

            <img
              src="/landing-hero.jpg"
              alt="Pixtr App Screenshot"
              className="relative mx-auto rounded-2xl shadow-2xl border border-white/10"
              style={{ maxWidth: '900px' }}
            />
          </div>
        </div>
      </section>

      {/* Why Pixtr */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              {t('landing:why.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('landing:why.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">
                {t('landing:why.noTracking.title')}
              </h3>
              <p className="text-gray-300">
                {t('landing:why.noTracking.desc')}
              </p>
            </div>

            <div className="glass-card p-8 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">
                {t('landing:why.yourData.title')}
              </h3>
              <p className="text-gray-300">{t('landing:why.yourData.desc')}</p>
            </div>

            <div className="glass-card p-8 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">
                {t('landing:why.creative.title')}
              </h3>
              <p className="text-gray-300">{t('landing:why.creative.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              {t('landing:features.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('landing:features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 space-y-4 hover:scale-105 transition"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              {t('landing:pricing.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('landing:pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`glass-card p-8 space-y-6 relative ${
                  plan.recommended ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-bold">
                    {t('landing:pricing.recommended')}
                  </div>
                )}

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {plan.storage} {t('landing:pricing.storage')}
                  </p>
                  {plan.trustLine && (
                    <p className="text-sm font-semibold text-purple-400 pt-1">
                      {plan.trustLine}
                    </p>
                  )}
                  {plan.limitation && (
                    <p className="text-xs text-gray-500 italic pt-1">
                      {plan.limitation}
                    </p>
                  )}
                </div>

                {/* Unlocks section for Lite */}
                {plan.unlocks && (
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs font-semibold text-purple-400 mb-2">
                      {t('landing:pricing.lite.unlocksTitle')}
                    </p>
                    <ul className="space-y-2">
                      {plan.unlocks.map((unlock, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-300">{unlock}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                      : 'border border-white/20 hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card p-12 text-center space-y-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
            <h2 className="text-4xl md:text-5xl font-bold">
              {t('landing:finalCta.title')}
            </h2>
            <p className="text-xl text-gray-300">
              {t('landing:finalCta.subtitle')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg transition inline-flex items-center gap-2"
            >
              {t('landing:cta.startFree')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-lg" />
              <span className="text-xl font-bold">PIXTR</span>
            </div>

            <p className="text-sm text-gray-400">
              {t('landing:footer.tagline')}
            </p>

            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">
                {t('landing:footer.privacy')}
              </a>
              <a href="#" className="hover:text-white transition">
                {t('landing:footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
