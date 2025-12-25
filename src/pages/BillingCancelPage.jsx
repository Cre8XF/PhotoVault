import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft } from 'lucide-react'

/**
 * BillingCancelPage
 *
 * Displayed when user cancels Stripe checkout
 */
const BillingCancelPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Checkout Avbrutt</h1>
        <p className="text-gray-400 mb-6">
          Du har avbrutt checkout-prosessen. Ingen endringer er gjort til ditt abonnement.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/billing')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Tilbake til Abonnementer
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
            Har du spørsmål? Kontakt oss på support@pixtr.no
          </p>
        </div>
      </div>
    </div>
  )
}

export default BillingCancelPage
