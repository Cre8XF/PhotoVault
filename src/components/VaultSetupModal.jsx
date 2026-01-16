// ============================================================================
// COMPONENT: VaultSetupModal.jsx – Phase 3.1: Vault Setup
// ============================================================================
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Fingerprint,
} from 'lucide-react'
import { validatePasswordStrength } from '../services/encryption'
import { useVault } from '../hooks/useVault'

const VaultSetupModal = ({ isOpen, onClose, onComplete }) => {
  const { t } = useTranslation(['vault', 'common'])
  const { setupVaultWithPassword, checkBiometricAvailability } = useVault()

  const [step, setStep] = useState(1) // 1: intro, 2: password, 3: biometric, 4: complete
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    valid: false,
    errors: [],
  })
  const [enableBiometric, setEnableBiometric] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [autoLockTimeout, setAutoLockTimeout] = useState(300000) // 5 minutes
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check biometric availability
    checkBiometricAvailability().then(setBiometricAvailable)
  }, [checkBiometricAvailability])

  useEffect(() => {
    // Validate password strength
    if (password) {
      const validation = validatePasswordStrength(password)
      setPasswordStrength(validation)
    } else {
      setPasswordStrength({ valid: false, errors: [] })
    }
  }, [password])

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      if (!passwordStrength.valid) {
        return
      }
      if (password !== confirmPassword) {
        return
      }
      if (biometricAvailable) {
        setStep(3)
      } else {
        handleComplete()
      }
    } else if (step === 3) {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const success = await setupVaultWithPassword(password, {
        autoLockTimeout,
        requireBiometric: enableBiometric,
        biometricEnabled: enableBiometric && biometricAvailable,
      })

      if (success) {
        setStep(4)
        setTimeout(() => {
          onComplete && onComplete(password)
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Vault setup failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setPassword('')
      setConfirmPassword('')
      setStep(1)
      onClose()
    }
  }

  if (!isOpen) return null

  const isPasswordMatch = password === confirmPassword
  const canProceed =
    step === 1 || (step === 2 && passwordStrength.valid && isPasswordMatch)

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700/40
                    bg-white dark:bg-gradient-to-b dark:from-gray-800/90 dark:to-gray-900/90 p-6 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple" />
            {t('vault:setupModal.title', {
              defaultValue: 'Set Up Secure Vault',
            })}
          </h2>
          {step !== 4 && (
            <button
              onClick={handleClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, biometricAvailable ? 3 : null].filter(Boolean).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step >= s ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('vault:setupModal.intro.title', {
                      defaultValue: 'Secure Your Private Photos',
                    })}
                  </p>
                  <p>
                    {t('vault:setupModal.intro.description', {
                      defaultValue:
                        'The vault uses strong AES-256 encryption to protect your private photos. Only you can access them with your password.',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-white">
                {t('vault:setupModal.intro.featuresTitle', {
                  defaultValue: 'Features:',
                })}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {t('vault:setupModal.intro.feature1', {
                      defaultValue:
                        'Client-side encryption - your password never leaves your device',
                    })}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {t('vault:setupModal.intro.feature2', {
                      defaultValue: 'Biometric unlock support (FaceID/TouchID)',
                    })}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {t('vault:setupModal.intro.feature3', {
                      defaultValue: 'Auto-lock after inactivity',
                    })}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {t('vault:setupModal.intro.feature4', {
                      defaultValue: 'Hidden from main gallery',
                    })}
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                         text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition"
            >
              {t('vault:setupModal.getStarted', {
                defaultValue: 'Get Started',
              })}
            </button>
          </div>
        )}

        {/* Step 2: Password Setup */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('vault:setupModal.password.warning', {
                    defaultValue:
                      'Important: If you forget your password, your vault photos cannot be recovered. Write it down securely.',
                  })}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                {t('vault:setupModal.password.label', {
                  defaultValue: 'Vault Password',
                })}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.trim())}
                  placeholder={t('vault:setupModal.password.placeholder', {
                    defaultValue: 'Enter strong password',
                  })}
                  className="w-full p-3 pr-10 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600/50
                             text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordStrength.errors.map((error, index) => (
                    <p
                      key={index}
                      className="text-sm text-red-400 font-medium flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  ))}
                  {passwordStrength.valid && (
                    <p className="text-sm text-green-400 font-medium flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded">
                      <Check className="w-4 h-4" />
                      {t('vault:setupModal.password.strong', {
                        defaultValue: 'Strong password',
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                {t('vault:setupModal.password.confirmLabel', {
                  defaultValue: 'Confirm Password',
                })}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.trim())}
                  placeholder={t(
                    'vault:setupModal.password.confirmPlaceholder',
                    { defaultValue: 'Re-enter password' }
                  )}
                  className="w-full p-3 pr-10 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600/50
                             text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && !isPasswordMatch && (
                <p className="mt-2 text-sm text-red-400 font-semibold flex items-center gap-1 border border-red-400/30 p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="w-4 h-4" />
                  {t('vault:setupModal.password.mismatch', {
                    defaultValue: 'Passwords do not match',
                  })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                {t('vault:setupModal.autoLock.label', {
                  defaultValue: 'Auto-Lock Timeout',
                })}
              </label>
              <select
                value={autoLockTimeout}
                onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-600/50
                           text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={60000}>
                  1{' '}
                  {t('vault:setupModal.autoLock.minute', {
                    defaultValue: 'minute',
                  })}
                </option>
                <option value={300000}>
                  5{' '}
                  {t('vault:setupModal.autoLock.minutes', {
                    defaultValue: 'minutes',
                  })}
                </option>
                <option value={900000}>
                  15{' '}
                  {t('vault:setupModal.autoLock.minutes', {
                    defaultValue: 'minutes',
                  })}
                </option>
                <option value={0}>
                  {t('vault:setupModal.autoLock.never', {
                    defaultValue: 'Never',
                  })}
                </option>
              </select>
            </div>

            <button
              onClick={handleNextStep}
              disabled={!canProceed || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                         text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? t('common:loading', { defaultValue: 'Loading...' })
                : t('vault:setupModal.next', { defaultValue: 'Next' })}
            </button>
          </div>
        )}

        {/* Step 3: Biometric Setup */}
        {step === 3 && biometricAvailable && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <Fingerprint className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('vault:setupModal.biometric.title', {
                      defaultValue: 'Enable Biometric Unlock',
                    })}
                  </p>
                  <p>
                    {t('vault:setupModal.biometric.description', {
                      defaultValue:
                        'Use your fingerprint or Face ID to quickly unlock the vault without typing your password.',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/60 rounded-xl">
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {t('vault:setupModal.biometric.enable', {
                    defaultValue: 'Enable Biometric',
                  })}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('vault:setupModal.biometric.optional', {
                    defaultValue: 'Optional, can be changed later',
                  })}
                </p>
              </div>
              <button
                onClick={() => setEnableBiometric(!enableBiometric)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  enableBiometric ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                    enableBiometric ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleNextStep}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                         text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition
                         disabled:opacity-50"
            >
              {loading
                ? t('common:loading', { defaultValue: 'Loading...' })
                : t('vault:setupModal.complete', {
                    defaultValue: 'Complete Setup',
                  })}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('vault:setupModal.success.title', {
                defaultValue: 'Vault Setup Complete!',
              })}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {t('vault:setupModal.success.message', {
                defaultValue: 'Your secure vault is ready to use.',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VaultSetupModal
