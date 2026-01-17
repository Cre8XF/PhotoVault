// ============================================================================
// COMPONENT: VaultSettingsModal.jsx – Phase 3.1: Vault Settings
// ============================================================================
import React, { useState, useEffect } from 'react'
import { NativeBiometric } from 'capacitor-native-biometric'
import { useTranslation } from 'react-i18next'
import {
  X,
  Settings,
  Lock,
  Clock,
  Fingerprint,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useVault } from '../hooks/useVault'
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from '../services/encryption'
import useStore from '../state/store'

const VaultSettingsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['vault', 'common'])
  const {
    vaultSettings,
    updateVaultSettings,
    resetVault,
    checkBiometricAvailability,
    unlockWithPassword,
  } = useVault()

  const vaultPasswordHash = useStore((state) => state.vaultPasswordHash)
  const setupVault = useStore((state) => state.setupVault)
  const setConfirmModal = useStore((state) => state.setConfirmModal)
  const showNotification = useStore((state) => state.showNotification)

  const [autoLockTimeout, setAutoLockTimeout] = useState(
    vaultSettings.autoLockTimeout
  )
  const [biometricEnabled, setBiometricEnabled] = useState(
    vaultSettings.biometricEnabled
  )
  const [biometricAvailable, setBiometricAvailable] = useState(false)

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    valid: false,
    errors: [],
  })

  useEffect(() => {
    if (isOpen) {
      setAutoLockTimeout(vaultSettings.autoLockTimeout)
      setBiometricEnabled(vaultSettings.biometricEnabled)
      checkBiometricAvailability().then(setBiometricAvailable)
    }
  }, [isOpen, vaultSettings, checkBiometricAvailability])

  useEffect(() => {
    if (newPassword) {
      const validation = validatePasswordStrength(newPassword)
      setPasswordStrength(validation)
    } else {
      setPasswordStrength({ valid: false, errors: [] })
    }
  }, [newPassword])

  const handleSaveSettings = async () => {
    try {
      await updateVaultSettings({
        autoLockTimeout,
        biometricEnabled,
      })

      showNotification(
        t('vault:settings.saveSuccess', { defaultValue: 'Settings saved' }),
        'success'
      )
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
      showNotification(
        t('vault:settings.saveFailed', {
          defaultValue: 'Failed to save settings',
        }),
        'error'
      )
    }
  }

  const handleChangePassword = async () => {
    if (!passwordStrength.valid) {
      showNotification(
        t('vault:settings.passwordWeak', {
          defaultValue: 'Password is too weak',
        }),
        'error'
      )
      return
    }

    if (newPassword !== confirmNewPassword) {
      showNotification(
        t('vault:settings.passwordMismatch', {
          defaultValue: 'Passwords do not match',
        }),
        'error'
      )
      return
    }

    try {
      // Verify current password
      const isValid = await verifyPassword(currentPassword, vaultPasswordHash)
      if (!isValid) {
        showNotification(
          t('vault:settings.incorrectPassword', {
            defaultValue: 'Current password is incorrect',
          }),
          'error'
        )
        return
      }

      // Update password
      const newPasswordHash = await hashPassword(newPassword)
      setupVault(newPasswordHash, vaultSettings)

      // Update biometric credentials if enabled
      if (biometricEnabled) {
        try {
          await NativeBiometric.setCredentials({
            username: 'vault',
            password: newPassword,
            server: 'photovault.vault',
          })
        } catch (error) {
          console.error('Failed to update biometric credentials:', error)
        }
      }

      showNotification(
        t('vault:settings.passwordChanged', {
          defaultValue: 'Password changed successfully',
        }),
        'success'
      )
      setShowChangePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      console.error('Failed to change password:', error)
      showNotification(
        t('vault:settings.passwordChangeFailed', {
          defaultValue: 'Failed to change password',
        }),
        'error'
      )
    }
  }

  const handleResetVault = () => {
    setConfirmModal({
      title: t('vault:settings.resetConfirm.title', {
        defaultValue: 'Reset Vault',
      }),
      message: t('vault:settings.resetConfirm.message', {
        defaultValue:
          'This will permanently delete all vault photos and settings. This action cannot be undone.',
      }),
      confirmText: t('vault:settings.resetConfirm.confirm', {
        defaultValue: 'Delete Everything',
      }),
      confirmStyle: 'danger',
      onConfirm: async () => {
        await resetVault()
        setConfirmModal(null)
        onClose()
      },
      onCancel: () => setConfirmModal(null),
    })
  }

  if (!isOpen) return null

  const isPasswordMatch = newPassword === confirmNewPassword

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--overlay-bg)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl shadow-2xl glass p-6 backdrop-blur-xl
                    max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Settings className="w-5 h-5 text-purple" />
            {t('vault:settings.title', { defaultValue: 'Vault Settings' })}
          </h2>
          <button
            onClick={onClose}
            className="transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-lock timeout */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="w-4 h-4 text-purple" />
            {t('vault:settings.autoLock.label', {
              defaultValue: 'Auto-Lock Timeout',
            })}
          </label>
          <select
            value={autoLockTimeout}
            onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value={60000}>
              1{' '}
              {t('vault:settings.autoLock.minute', { defaultValue: 'minute' })}
            </option>
            <option value={300000}>
              5{' '}
              {t('vault:settings.autoLock.minutes', {
                defaultValue: 'minutes',
              })}
            </option>
            <option value={900000}>
              15{' '}
              {t('vault:settings.autoLock.minutes', {
                defaultValue: 'minutes',
              })}
            </option>
            <option value={1800000}>
              30{' '}
              {t('vault:settings.autoLock.minutes', {
                defaultValue: 'minutes',
              })}
            </option>
            <option value={0}>
              {t('vault:settings.autoLock.never', { defaultValue: 'Never' })}
            </option>
          </select>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('vault:settings.autoLock.description', {
              defaultValue:
                'Vault will automatically lock after this period of inactivity',
            })}
          </p>
        </div>

        {/* Biometric toggle */}
        {biometricAvailable && (
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 glass rounded-xl">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-purple" />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {t('vault:settings.biometric.label', {
                      defaultValue: 'Biometric Unlock',
                    })}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('vault:settings.biometric.description', {
                      defaultValue: 'Use FaceID/TouchID',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{
                  backgroundColor: biometricEnabled ? 'var(--color-purple-600)' : 'var(--bg-tertiary)'
                }}
              >
                <span
                  className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                    biometricEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Change password section */}
        <div className="mb-6">
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="flex items-center gap-2 text-purple hover:text-purple transition mb-3"
          >
            <Lock className="w-4 h-4" />
            {t('vault:settings.changePassword.button', {
              defaultValue: 'Change Vault Password',
            })}
          </button>

          {showChangePassword && (
            <div className="space-y-3 p-4 glass rounded-xl">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t('vault:settings.changePassword.currentLabel', {
                    defaultValue: 'Current Password',
                  })}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t('vault:settings.changePassword.newLabel', {
                    defaultValue: 'New Password',
                  })}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {newPassword && !passwordStrength.valid && (
                  <div className="mt-1 space-y-0.5">
                    {passwordStrength.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-400">
                        • {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t('vault:settings.changePassword.confirmLabel', {
                    defaultValue: 'Confirm New Password',
                  })}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmNewPassword(!showConfirmNewPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmNewPassword && !isPasswordMatch && (
                  <p className="mt-1 text-xs text-red-400">
                    {t('vault:settings.changePassword.mismatch', {
                      defaultValue: 'Passwords do not match',
                    })}
                  </p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={
                  !currentPassword ||
                  !passwordStrength.valid ||
                  !isPasswordMatch
                }
                className="w-full py-2 rounded-xl bg-purple-600 text-white font-semibold
                           hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('vault:settings.changePassword.submit', {
                  defaultValue: 'Update Password',
                })}
              </button>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('vault:settings.dangerZone.title', {
                defaultValue: 'Danger Zone',
              })}
            </h3>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {t('vault:settings.dangerZone.description', {
              defaultValue:
                'Permanently delete all vault photos and reset vault settings.',
            })}
          </p>
          <button
            onClick={handleResetVault}
            className="w-full py-2 rounded-xl bg-red-600/80 border border-red-500/50
                       text-white font-semibold hover:bg-red-600 transition"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            {t('vault:settings.dangerZone.button', {
              defaultValue: 'Reset Vault',
            })}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl glass hover:bg-white/10 font-semibold transition"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                       text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition"
          >
            {t('common:save', { defaultValue: 'Save' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VaultSettingsModal
