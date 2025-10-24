// ============================================================================
// SecuritySettings.jsx - MED FULL I18N
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Lock,
  Fingerprint,
  Clock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronLeft,
  Scan
} from 'lucide-react';
import { useSecurityContext } from '../contexts/SecurityContext';
import { validatePIN, checkPINStrength } from '../utils/security';
import { getBiometricIcon, getBiometricDisplayName } from '../utils/biometric';

const SecuritySettings = ({ onBack }) => {
  const { t } = useTranslation(['security', 'common']);
  const {
    pinEnabled,
    biometricEnabled,
    biometricAvailable,
    autoLockEnabled,
    autoLockTimeout,
    lockOnBackground,
    enablePIN,
    disablePIN,
    changePIN,
    enableBiometric,
    disableBiometric,
    toggleAutoLock,
    toggleLockOnBackground
  } = useSecurityContext();

  // PIN setup state
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [pinStep, setPinStep] = useState(1);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [showPIN, setShowPIN] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinStrength, setPinStrength] = useState({ strength: 'weak', score: 0 });

  // Change PIN state
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [currentPIN, setCurrentPIN] = useState('');
  const [changePINStep, setChangePINStep] = useState(1);

  // Biometric state
  const [biometricIcon, setBiometricIcon] = useState('Fingerprint');
  const [biometricName, setBiometricName] = useState('');

  // UI state
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBiometricInfo();
  }, []);

  useEffect(() => {
    if (newPIN) {
      const strength = checkPINStrength(newPIN);
      setPinStrength(strength);
    }
  }, [newPIN]);

  const loadBiometricInfo = async () => {
    const icon = await getBiometricIcon();
    const name = await getBiometricDisplayName();
    setBiometricIcon(icon);
    setBiometricName(name);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePINSetupNext = () => {
    setPinError('');

    if (pinStep === 1) {
      const validation = validatePIN(newPIN);
      if (!validation.valid) {
        setPinError(validation.error);
        return;
      }

      if (pinStrength.strength === 'weak') {
        setPinError(t('pin.errors.tooWeak'));
        return;
      }

      setPinStep(2);
    } else if (pinStep === 2) {
      if (newPIN !== confirmPIN) {
        setPinError(t('pin.errors.mismatch'));
        return;
      }

      handleEnablePIN();
    }
  };

  const handleEnablePIN = async () => {
    setLoading(true);
    const result = await enablePIN(newPIN);
    setLoading(false);

    if (result.success) {
      showNotification(t('pin.notifications.enabled'), 'success');
      resetPINSetup();
    } else {
      setPinError(result.error || t('pin.notifications.couldNotEnable'));
    }
  };

  const handleDisablePIN = async () => {
    if (!window.confirm(t('pin.confirm.disable'))) {
      return;
    }

    setLoading(true);
    const result = await disablePIN();
    setLoading(false);

    if (result.success) {
      showNotification(t('pin.notifications.disabled'), 'success');
    } else {
      showNotification(result.error || t('pin.notifications.couldNotDisable'), 'error');
    }
  };

  const handleChangePINNext = async () => {
    setPinError('');

    if (changePINStep === 1) {
      if (!currentPIN) {
        setPinError(t('pin.errors.enterCurrent'));
        return;
      }
      setChangePINStep(2);
    } else if (changePINStep === 2) {
      const validation = validatePIN(newPIN);
      if (!validation.valid) {
        setPinError(validation.error);
        return;
      }

      if (pinStrength.strength === 'weak') {
        setPinError(t('pin.errors.newTooWeak'));
        return;
      }

      setChangePINStep(3);
    } else if (changePINStep === 3) {
      if (newPIN !== confirmPIN) {
        setPinError(t('pin.errors.mismatch'));
        return;
      }

      setLoading(true);
      const result = await changePIN(currentPIN, newPIN);
      setLoading(false);

      if (result.success) {
        showNotification(t('pin.notifications.changed'), 'success');
        resetChangePIN();
      } else {
        setPinError(result.error || t('pin.notifications.couldNotChange'));
      }
    }
  };

  const resetPINSetup = () => {
    setShowPINSetup(false);
    setPinStep(1);
    setNewPIN('');
    setConfirmPIN('');
    setPinError('');
    setShowPIN(false);
  };

  const resetChangePIN = () => {
    setShowChangePIN(false);
    setChangePINStep(1);
    setCurrentPIN('');
    setNewPIN('');
    setConfirmPIN('');
    setPinError('');
    setShowPIN(false);
  };

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      disableBiometric();
      showNotification(t('biometric.notifications.disabled', { type: biometricName }), 'success');
    } else {
      if (!pinEnabled) {
        showNotification(t('biometric.notifications.mustEnablePin'), 'error');
        return;
      }

      setLoading(true);
      const result = await enableBiometric();
      setLoading(false);

      if (result.success) {
        showNotification(t('biometric.notifications.enabled', { type: biometricName }), 'success');
      } else {
        showNotification(result.error || t('biometric.notifications.couldNotEnable', { type: biometricName }), 'error');
      }
    }
  };

  const BiometricIcon = biometricIcon === 'Fingerprint' ? Fingerprint : Scan;

  // PIN Setup Modal
  if (showPINSetup) {
    return (
      <div className="min-h-screen p-6 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={resetPINSetup}
              className="ripple-effect p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">{t('pin.setup.title')}</h1>
          </div>

          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-1 rounded-full ${pinStep >= 1 ? 'bg-purple-500' : 'bg-white/20'}`} />
            <div className={`flex-1 h-1 rounded-full ${pinStep >= 2 ? 'bg-purple-500' : 'bg-white/20'}`} />
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">
              {pinStep === 1 ? t('pin.setup.enterTitle') : t('pin.setup.confirmTitle')}
            </h3>

            <div className="relative mb-4">
              <input
                type={showPIN ? 'tel' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pinStep === 1 ? newPIN : confirmPIN}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (pinStep === 1) {
                    setNewPIN(value);
                  } else {
                    setConfirmPIN(value);
                  }
                  setPinError('');
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                placeholder="••••"
              />
              <button
                onClick={() => setShowPIN(!showPIN)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition"
              >
                {showPIN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {pinStep === 1 && newPIN && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{t('pin.strength.label')}</span>
                  <span className={`font-semibold ${
                    pinStrength.strength === 'strong' ? 'text-green-400' :
                    pinStrength.strength === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {t(`pin.strength.${pinStrength.strength}`)}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pinStrength.strength === 'strong' ? 'bg-green-500' :
                      pinStrength.strength === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${pinStrength.score}%` }}
                  />
                </div>
              </div>
            )}

            {pinError && (
              <div className="flex items-start gap-2 text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{pinError}</p>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200">
                  <p className="font-medium mb-1">{t('pin.tips.title')}</p>
                  <ul className="space-y-1 text-xs opacity-80">
                    {t('pin.tips.items', { returnObjects: true }).map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePINSetupNext}
            disabled={loading || (pinStep === 1 ? newPIN.length < 4 : confirmPIN.length < 4)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? t('pin.setup.loading') : pinStep === 1 ? t('pin.setup.next') : t('pin.setup.finish')}
          </button>
        </div>
      </div>
    );
  }

  // Change PIN Modal
  if (showChangePIN) {
    return (
      <div className="min-h-screen p-6 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={resetChangePIN}
              className="ripple-effect p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">{t('pin.change.title')}</h1>
          </div>

          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-1 rounded-full ${changePINStep >= 1 ? 'bg-purple-500' : 'bg-white/20'}`} />
            <div className={`flex-1 h-1 rounded-full ${changePINStep >= 2 ? 'bg-purple-500' : 'bg-white/20'}`} />
            <div className={`flex-1 h-1 rounded-full ${changePINStep >= 3 ? 'bg-purple-500' : 'bg-white/20'}`} />
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">
              {changePINStep === 1 ? t('pin.change.enterCurrent') :
               changePINStep === 2 ? t('pin.change.enterNew') :
               t('pin.change.confirmNew')}
            </h3>

            <div className="relative mb-4">
              <input
                type={showPIN ? 'tel' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={changePINStep === 1 ? currentPIN : changePINStep === 2 ? newPIN : confirmPIN}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (changePINStep === 1) {
                    setCurrentPIN(value);
                  } else if (changePINStep === 2) {
                    setNewPIN(value);
                  } else {
                    setConfirmPIN(value);
                  }
                  setPinError('');
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                placeholder="••••"
              />
              <button
                onClick={() => setShowPIN(!showPIN)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition"
              >
                {showPIN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {changePINStep === 2 && newPIN && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{t('pin.strength.label')}</span>
                  <span className={`font-semibold ${
                    pinStrength.strength === 'strong' ? 'text-green-400' :
                    pinStrength.strength === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {t(`pin.strength.${pinStrength.strength}`)}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pinStrength.strength === 'strong' ? 'bg-green-500' :
                      pinStrength.strength === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${pinStrength.score}%` }}
                  />
                </div>
              </div>
            )}

            {pinError && (
              <div className="flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{pinError}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleChangePINNext}
            disabled={loading || 
              (changePINStep === 1 && currentPIN.length < 4) ||
              (changePINStep === 2 && newPIN.length < 4) ||
              (changePINStep === 3 && confirmPIN.length < 4)}
            className="ripple-effect w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? t('pin.setup.loading') : changePINStep < 3 ? t('pin.setup.next') : t('pin.setup.finish')}
          </button>
        </div>
      </div>
    );
  }

  // Main settings view
  return (
    <div className="min-h-screen p-6 pb-24 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{t('security.title')}</h1>
            <p className="text-sm opacity-70">{t('security.subtitle')}</p>
          </div>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-500/20 border border-green-500/50' :
            'bg-red-500/20 border border-red-500/50'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <X className="w-5 h-5 text-red-400" />
            )}
            <p className={notification.type === 'success' ? 'text-green-200' : 'text-red-200'}>
              {notification.message}
            </p>
          </div>
        )}

        {/* PIN Lock */}
        <section className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/30 rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{t('pin.title')}</h3>
              <p className="text-sm opacity-70">{t('pin.description')}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              pinEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {pinEnabled ? t('pin.status.enabled') : t('pin.status.disabled')}
            </div>
          </div>

          <div className="space-y-2">
            {!pinEnabled ? (
              <button
                onClick={() => setShowPINSetup(true)}
                className="ripple-effect w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition text-left px-4 font-medium"
              >
                {t('pin.enable')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowChangePIN(true)}
                  className="ripple-effect w-full py-3 glass hover:bg-white/10 rounded-xl transition text-left px-4"
                >
                  {t('pin.change')}
                </button>
                <button
                  onClick={handleDisablePIN}
                  className="ripple-effect w-full py-3 glass hover:bg-red-500/20 rounded-xl transition text-left px-4 text-red-400"
                >
                  {t('pin.disable')}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Biometric */}
        {biometricAvailable && (
          <section className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600/30 rounded-xl">
                <BiometricIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{biometricName}</h3>
                <p className="text-sm opacity-70">
                  {pinEnabled ? t('biometric.description', { type: biometricName }) : t('biometric.requiresPin')}
                </p>
              </div>
              <button
                onClick={handleBiometricToggle}
                disabled={!pinEnabled || loading}
                className={`relative w-14 h-7 rounded-full transition ${
                  biometricEnabled ? 'bg-purple-600' : 'bg-gray-600'
                } disabled:opacity-50`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    biometricEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {!pinEnabled && (
              <div className="flex items-start gap-2 text-yellow-400 text-sm">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{t('biometric.requiresPinDesc')}</p>
              </div>
            )}
          </section>
        )}

        {/* Auto-lock */}
        <section className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-600/30 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{t('autoLock.title')}</h3>
              <p className="text-sm opacity-70">
                {pinEnabled ? t('autoLock.description') : t('autoLock.requiresPin')}
              </p>
            </div>
            <button
              onClick={() => toggleAutoLock(!autoLockEnabled, autoLockTimeout)}
              disabled={!pinEnabled}
              className={`relative w-14 h-7 rounded-full transition ${
                autoLockEnabled ? 'bg-purple-600' : 'bg-gray-600'
              } disabled:opacity-50`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoLockEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {autoLockEnabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                {t('autoLock.timeout')}
              </label>
              <select
                value={autoLockTimeout}
                onChange={(e) => toggleAutoLock(true, Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={1}>{t('autoLock.timeoutOptions.1')}</option>
                <option value={2}>{t('autoLock.timeoutOptions.2')}</option>
                <option value={5}>{t('autoLock.timeoutOptions.5')}</option>
                <option value={10}>{t('autoLock.timeoutOptions.10')}</option>
                <option value={15}>{t('autoLock.timeoutOptions.15')}</option>
                <option value={30}>{t('autoLock.timeoutOptions.30')}</option>
              </select>
            </div>
          )}
        </section>

        {/* Lock on background */}
        {pinEnabled && (
          <section className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-600/30 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t('lockOnBackground.title')}</h3>
                <p className="text-sm opacity-70">{t('lockOnBackground.description')}</p>
              </div>
              <button
                onClick={() => toggleLockOnBackground(!lockOnBackground)}
                className={`relative w-14 h-7 rounded-full transition ${
                  lockOnBackground ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    lockOnBackground ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>
        )}

        {/* Info */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm opacity-70">
              <p className="mb-2">
                <strong>{t('info.title')}:</strong>
              </p>
              <ul className="space-y-1 list-disc list-inside">
                {t('info.items', { returnObjects: true }).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;