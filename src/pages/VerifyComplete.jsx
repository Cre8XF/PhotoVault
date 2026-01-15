import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Mail } from 'lucide-react'
import { auth } from '../firebase'
import useAuth from '../hooks/useAuth'
import Particles from '../components/Particles'
import LogoLight from '../assets/logo_light.png'
import LogoDark from '../assets/logo_dark.png'

const VerifyComplete = () => {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [status, setStatus] = useState('checking') // checking | verified | notLoggedIn | error
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Determine theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme !== 'light'
    setIsDarkMode(isDark)
  }, [])

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        // Check if user is logged in
        if (!auth.currentUser) {
          setStatus('notLoggedIn')
          return
        }

        // Reload Firebase user to get latest emailVerified status
        await auth.currentUser.reload()

        // Check if email is now verified
        if (auth.currentUser.emailVerified) {
          setStatus('verified')

          // Refresh auth state in the app
          if (refreshUser) {
            await refreshUser()
          }

          // Wait 2 seconds so user sees confirmation, then redirect
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 2000)
        } else {
          // Email not verified yet (user may have clicked link before verification processed)
          setStatus('error')
        }
      } catch (error) {
        console.error('Error verifying email:', error)
        setStatus('error')
      }
    }

    verifyAndRedirect()
  }, [navigate, refreshUser])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
      <Particles />

      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <img
              src={isDarkMode ? LogoDark : LogoLight}
              alt={t('appName')}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Status Content */}
        <div className="text-center">
          {status === 'checking' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('verifySuccess.checking')}
              </h2>
              <p className="text-gray-400">{t('verifySuccess.checkingBody')}</p>
            </>
          )}

          {status === 'verified' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('verifySuccess.title')}
              </h2>
              <p className="text-gray-400 mb-6">{t('verifySuccess.body')}</p>
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm">
                {t('verifySuccess.redirect')}
              </div>
            </>
          )}

          {status === 'notLoggedIn' && (
            <>
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('verifySuccess.notLoggedInTitle')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('verifySuccess.notLoggedInBody')}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="ripple-effect w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                {t('login')}
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <Mail className="w-16 h-16 mx-auto mb-4 text-amber-400" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('verifySuccess.errorTitle')}
              </h2>
              <p className="text-gray-400 mb-6">{t('verifySuccess.errorBody')}</p>
              <button
                onClick={() => navigate('/')}
                className="ripple-effect w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                {t('verifySuccess.continueToApp')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyComplete
