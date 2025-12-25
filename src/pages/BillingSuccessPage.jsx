import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import useAuth from '../hooks/useAuth'

/**
 * BillingSuccessPage
 *
 * Displayed after successful Stripe payment
 * Triggers profile refresh to get updated subscription tier from Firestore
 */
const BillingSuccessPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUserProfile } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(true)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Wait a moment for webhook to process, then refresh profile
    const refreshProfile = async () => {
      // Wait 2 seconds to allow webhook to update Firestore
      await new Promise(resolve => setTimeout(resolve, 2000))

      try {
        // Trigger auth/profile refresh to get updated tier
        if (refreshUserProfile) {
          await refreshUserProfile()
        }
      } catch (error) {
        console.error('Error refreshing profile:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    refreshProfile()
  }, [refreshUserProfile])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {isRefreshing ? (
          <>
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Oppdaterer din profil...</h1>
            <p className="text-gray-400">
              Vennligst vent mens vi aktiverer ditt abonnement.
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Betaling Vellykket!</h1>
            <p className="text-gray-400 mb-6">
              Ditt abonnement er nå aktivt. Du har nå tilgang til alle funksjoner i din nye plan.
            </p>

            {sessionId && (
              <p className="text-xs text-gray-500 mb-6">
                Session ID: {sessionId.slice(0, 20)}...
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/subscription')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                Se Ditt Abonnement
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/home')}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
              >
                Gå til Hjem
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Du vil motta en betalingsbekreftelse fra Stripe på e-post.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BillingSuccessPage
