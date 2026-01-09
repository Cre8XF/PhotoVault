import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Crown, Zap, Check, Loader2 } from 'lucide-react'
import useAuth from '../hooks/useAuth'

/**
 * BillingPage - Stripe Checkout Integration
 *
 * Handles subscription upgrades via Stripe Checkout
 * Does NOT hardcode tiers or update Firestore directly
 * Webhook is the ONLY source of truth for subscription updates
 */
const BillingPage = () => {
  const navigate = useNavigate()
  const { user, userProfile, tier } = useAuth()
  const [loading, setLoading] = useState(null) // Track which plan is being purchased

  const currentTier = tier()

  // Stripe Price IDs from environment variables
  const STRIPE_LITE_PRICE_ID = import.meta.env.VITE_STRIPE_LITE_PRICE_ID
  const STRIPE_PRO_PRICE_ID = import.meta.env.VITE_STRIPE_PRO_PRICE_ID

  /**
   * Subscription Plans Configuration
   */
  const plans = [
    {
      id: 'LITE',
      name: 'LITE',
      price: '39 kr',
      period: 'per måned',
      storage: '10 GB',
      priceId: STRIPE_LITE_PRICE_ID,
      features: [
        'Everything in Free',
        '10 GB lagring',
        'Bildekomprimering',
        'Dokumentopplasting',
        'Prioritert support',
      ],
      color: 'from-blue-600 to-cyan-600',
      icon: <Zap className="w-6 h-6" />,
      recommended: true,
    },
    // ⚠️ PHASE 3: PRO tier hidden for launch (Stripe webhook still handles PRO)
    // Backend logic and webhook remain intact for existing PRO users
    // {
    //   id: 'PRO',
    //   name: 'PRO',
    //   price: '79 kr',
    //   period: 'per måned',
    //   storage: '50 GB',
    //   priceId: STRIPE_PRO_PRICE_ID,
    //   features: [
    //     'Alt i LITE',
    //     '50 GB lagring',
    //     'Video upload og playback',
    //     'Bildekomprimering',
    //     'Dokumentopplasting',
    //     'AI-funksjoner (fremtidig)',
    //     'Prioritert support',
    //     'Early access til nye features',
    //   ],
    //   color: 'from-purple-600 to-pink-600',
    //   icon: <Crown className="w-6 h-6" />,
    //   recommended: true,
    // },
  ]

  /**
   * Handle upgrade button click
   * Calls Netlify function to create Stripe Checkout session
   */
  const handleUpgrade = async (plan) => {
    if (!user || !userProfile) {
      alert('Du må være innlogget for å oppgradere')
      return
    }

    if (!plan.priceId) {
      console.error('Price ID not configured for plan:', plan.id)
      alert('Abonnement ikke konfigurert ennå. Kontakt support.')
      return
    }

    setLoading(plan.id)

    try {
      // Call Netlify function to create checkout session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.uid,
          userEmail: user.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url

    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Kunne ikke starte checkout. Prøv igjen senere.')
      setLoading(null)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/subscription')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Oppgrader Abonnement</h1>
        </div>
      </div>

      <div className="min-h-screen pb-24">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Current Tier Info */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Din Nåværende Plan</h2>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              {currentTier}
            </p>
          </div>

          {/* Subscription Plans */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Velg Ditt Abonnement
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`glass-card p-6 relative ${
                    plan.recommended ? 'ring-2 ring-purple-500 shadow-2xl' : ''
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                        ANBEFALT
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${plan.color} rounded-full text-white font-bold mb-4`}
                    >
                      {plan.icon}
                      {plan.name}
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Upgrade Button */}
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading === plan.id || currentTier === plan.id}
                    className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      currentTier === plan.id
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Laster...
                      </>
                    ) : currentTier === plan.id ? (
                      'Nåværende Plan'
                    ) : (
                      `Oppgrader til ${plan.name}`
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-3">Om Betalingen</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                • Du vil bli sendt til Stripe for sikker betaling
              </p>
              <p>
                • Ditt abonnement aktiveres umiddelbart etter vellykket betaling
              </p>
              <p>
                • Du kan kansellere når som helst fra din Stripe-konto
              </p>
              <p>
                • Alle priser er i NOK og inkluderer MVA
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BillingPage
