import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Shield, Sparkles, Lock, Search, Image, QrCode, Check, ArrowRight, Globe } from 'lucide-react'

/**
 * Public landing page for unauthenticated users
 * Shows value proposition before login/signup
 * LIGHT THEME - Clean, trustworthy, professional
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
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Image,
      title: t('landing:features.albums.title'),
      description: t('landing:features.albums.desc'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Search,
      title: t('landing:features.search.title'),
      description: t('landing:features.search.desc'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Sparkles,
      title: t('landing:features.collage.title'),
      description: t('landing:features.collage.desc'),
      color: 'from-orange-500 to-yellow-500'
    },
    {
      icon: QrCode,
      title: t('landing:features.sharing.title'),
      description: t('landing:features.sharing.desc'),
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Lock,
      title: t('landing:features.control.title'),
      description: t('landing:features.control.desc'),
      color: 'from-violet-500 to-purple-500'
    }
  ]

  const pricing = [
    {
      name: 'GRATIS',
      price: '0 kr',
      period: t('landing:pricing.free.period'),
      storage: '1 GB',
      features: [
        t('landing:pricing.free.feature1'),
        t('landing:pricing.free.feature2'),
        t('landing:pricing.free.feature3'),
        t('landing:pricing.free.feature4')
      ]
    },
    {
      name: 'LITE',
      price: '29 kr',
      period: t('landing:pricing.lite.period'),
      storage: '5 GB',
      recommended: true,
      features: [
        t('landing:pricing.lite.feature1'),
        t('landing:pricing.lite.feature2'),
        t('landing:pricing.lite.feature3'),
        t('landing:pricing.lite.feature4')
      ]
    },
    {
      name: 'PRO',
      price: '79 kr',
      period: t('landing:pricing.pro.period'),
      storage: '50 GB',
      features: [
        t('landing:pricing.pro.feature1'),
        t('landing:pricing.pro.feature2'),
        t('landing:pricing.pro.feature3'),
        t('landing:pricing.pro.feature4')
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">PIXTR</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition text-slate-700"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{currentLang === 'no' ? 'NO' : 'EN'}</span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg"
            >
              {t('landing:cta.getStarted')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-purple-700 to-pink-600 bg-clip-text text-transparent">
              {t('landing:hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
              {t('landing:hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg text-white transition flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {t('landing:cta.startFree')}
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#features"
                className="px-8 py-4 border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 rounded-xl font-semibold text-lg transition text-slate-700"
              >
                {t('landing:cta.learnMore')}
              </a>
            </div>

            <p className="text-sm text-slate-500 pt-2">
              {t('landing:hero.noCreditCard')}
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-3xl" />
            <img
              src="/landing-hero.png"
              alt="Pixtr App Screenshot"
              className="relative mx-auto rounded-2xl shadow-2xl border border-slate-200"
              style={{ maxWidth: '900px' }}
            />
          </div>
        </div>
      </section>

      {/* Why Pixtr */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t('landing:why.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('landing:why.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 space-y-4 rounded-2xl shadow-md hover:shadow-xl transition border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{t('landing:why.noTracking.title')}</h3>
              <p className="text-slate-600">{t('landing:why.noTracking.desc')}</p>
            </div>

            <div className="bg-white p-8 space-y-4 rounded-2xl shadow-md hover:shadow-xl transition border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{t('landing:why.yourData.title')}</h3>
              <p className="text-slate-600">{t('landing:why.yourData.desc')}</p>
            </div>

            <div className="bg-white p-8 space-y-4 rounded-2xl shadow-md hover:shadow-xl transition border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{t('landing:why.creative.title')}</h3>
              <p className="text-slate-600">{t('landing:why.creative.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t('landing:features.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('landing:features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 p-6 space-y-4 rounded-2xl hover:scale-105 transition shadow-sm hover:shadow-md border border-slate-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t('landing:pricing.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('landing:pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`bg-white p-8 space-y-6 relative rounded-2xl shadow-md hover:shadow-xl transition border ${
                  plan.recommended ? 'ring-2 ring-purple-500 scale-105 border-purple-200' : 'border-slate-200'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-bold text-white shadow-md">
                    {t('landing:pricing.recommended')}
                  </div>
                )}

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-500">{plan.storage} {t('landing:pricing.storage')}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                      : 'border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  {t('landing:cta.startFree')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center space-y-6 rounded-2xl shadow-lg border border-purple-100">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t('landing:finalCta.title')}
            </h2>
            <p className="text-xl text-slate-600">
              {t('landing:finalCta.subtitle')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg text-white transition inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {t('landing:cta.startFree')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-lg shadow-md" />
              <span className="text-xl font-bold text-slate-900">PIXTR</span>
            </div>

            <p className="text-sm text-slate-500">
              {t('landing:footer.tagline')}
            </p>

            <div className="flex gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-purple-600 transition font-medium">
                {t('landing:footer.privacy')}
              </a>
              <a href="#" className="hover:text-purple-600 transition font-medium">
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
