// ============================================================================
// SecuritySettings.jsx - Sikkerhetskonfigurasjon
// FASE 3 - Sikkerhet & Privacy
// ============================================================================
import React, { useState, useEffect } from 'react';
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
  const [pinStep, setPinStep] = useState(1); // 1: enter, 2: confirm
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [showPIN, setShowPIN] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinStrength, setPinStrength] = useState({ strength: 'weak', score: 0 });

  // Change PIN state
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [currentPIN, setCurrentPIN] = useState('');
  const [changePINStep, setChangePINStep] = useState(1); // 1: current, 2: new, 3: confirm

  // Biometric state
  const [biometricIcon, setBiometricIcon] = useState('Fingerprint');
  const [biometricName, setBiometricName] = useState('Biometri');

  // UI state
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load biometric info
  useEffect(() => {
    loadBiometricInfo();
  }, []);

  // Check PIN strength on input
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

  // Handle PIN setup
  const handlePINSetupNext = () => {
    setPinError('');

    if (pinStep === 1) {
      const validation = validatePIN(newPIN);
      if (!validation.valid) {
        setPinError(validation.error);
        return;
      }

      if (pinStrength.strength === 'weak') {
        setPinError('PIN er for svak. Velg en sterkere kombinasjon.');
        return;
      }

      setPinStep(2);
    } else if (pinStep === 2) {
      if (newPIN !== confirmPIN) {
        setPinError('PIN-kodene stemmer ikke overens');
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
      showNotification('PIN-kode aktivert', 'success');
      resetPINSetup();
    } else {
      setPinError(result.error || 'Kunne ikke aktivere PIN');
    }
  };

  const handleDisablePIN = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Er du sikker på at du vil deaktivere PIN-kode? Dette vil også deaktivere biometrisk autentisering.')) {
      return;
    }

    setLoading(true);
    const result = await disablePIN();
    setLoading(false);

    if (result.success) {
      showNotification('PIN-kode deaktivert', 'success');
    } else {
      showNotification(result.error || 'Kunne ikke deaktivere PIN', 'error');
    }
  };

  // Handle change PIN
  const handleChangePINNext = async () => {
    setPinError('');

    if (changePINStep === 1) {
      if (!currentPIN) {
        setPinError('Skriv inn nåværende PIN');
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
        setPinError('Ny PIN er for svak');
        return;
      }

      setChangePINStep(3);
    } else if (changePINStep === 3) {
      if (newPIN !== confirmPIN) {
        setPinError('PIN-kodene stemmer ikke overens');
        return;
      }

      setLoading(true);
      const result = await changePIN(currentPIN, newPIN);
      setLoading(false);

      if (result.success) {
        showNotification('PIN-kode endret', 'success');
        resetChangePIN();
      } else {
        setPinError(result.error || 'Kunne ikke endre PIN');
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

  // Handle biometric toggle
  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      disableBiometric();
      showNotification(`${biometricName} deaktivert`, 'success');
    } else {
      if (!pinEnabled) {
        showNotification('Du må aktivere PIN-kode først', 'error');
        return;
      }

      setLoading(true);
      const result = await enableBiometric();
      setLoading(false);

      if (result.success) {
        showNotification(`${biometricName} aktivert`, 'success');
      } else {
        showNotification(result.error || `Kunne ikke aktivere ${biometricName}`, 'error');
      }
    }
  };

  const BiometricIcon = biometricIcon === 'Fingerprint' ? Fingerprint : Scan;

  // PIN Setup Modal
  if (showPINSetup) {
    return (
      <div className="min-h-screen p-6 pb-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={resetPINSetup}
              className="ripple-effect p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Opprett PIN-kode</h1>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-1 rounded-full ${pinStep >= 1 ? 'bg-purple-500' : 'bg-white/20'}`} />
            <div className={`flex-1 h-1 rounded-full ${pinStep >= 2 ? 'bg-purple-500' : 'bg-white/20'}`} />
          </div>

          {/* PIN input */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">
              {pinStep === 1 ? 'Skriv inn ny PIN (4-6 siffer)' : 'Bekreft PIN-kode'}
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

            {/* PIN strength indicator */}
            {pinStep === 1 && newPIN && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>PIN-styrke</span>
                  <span className={`font-semibold ${
                    pinStrength.strength === 'strong' ? 'text-green-400' :
                    pinStrength.strength === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {pinStrength.strength === 'strong' ? 'Sterk' :
                     pinStrength.strength === 'medium' ? 'Middels' : 'Svak'}
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

            {/* Error */}
            {pinError && (
              <div className="flex items-start gap-2 text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{pinError}</p>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200">
                  <p className="font-medium mb-1">Tips for sikker PIN:</p>
                  <ul className="space-y-1 text-xs opacity-80">
                    <li>• Bruk minst 5 siffer</li>
                    <li>• Unngå enkle mønstre (1234, 1111)</li>
                    <li>• Bruk unike kombinasjoner</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handlePINSetupNext}
            disabled={loading || (pinStep === 1 ? newPIN.length < 4 : confirmPIN.length < 4)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Laster...' : pinStep === 1 ? 'Neste' : 'Fullfør'}
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
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={resetChangePIN}
              className="ripple-effect p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Endre PIN-kode</h1>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-1 rounded-full ${changePINStep >= 1 ? 'bg-purple-500' : 'bg-white/20'}`} />
            <div className={`flex-1 h-1 rounded-full ${changePINStep >= 2 ? 'bg-purple-500' : 'bg-white/20'}`} />
            <div className={`flex-1 h-1 rounded-full ${changePINStep >= 3 ? 'bg-purple-500' : 'bg-white/20'}`} />
          </div>

          {/* PIN input */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">
              {changePINStep === 1 ? 'Skriv inn nåværende PIN' :
               changePINStep === 2 ? 'Skriv inn ny PIN (4-6 siffer)' :
               'Bekreft ny PIN'}
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

            {/* PIN strength (step 2 only) */}
            {changePINStep === 2 && newPIN && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>PIN-styrke</span>
                  <span className={`font-semibold ${
                    pinStrength.strength === 'strong' ? 'text-green-400' :
                    pinStrength.strength === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {pinStrength.strength === 'strong' ? 'Sterk' :
                     pinStrength.strength === 'medium' ? 'Middels' : 'Svak'}
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

            {/* Error */}
            {pinError && (
              <div className="flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{pinError}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <button
            onClick={handleChangePINNext}
            disabled={loading || 
              (changePINStep === 1 && currentPIN.length < 4) ||
              (changePINStep === 2 && newPIN.length < 4) ||
              (changePINStep === 3 && confirmPIN.length < 4)}
            className="ripple-effect w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Laster...' : changePINStep < 3 ? 'Neste' : 'Fullfør'}
          </button>
        </div>
      </div>
    );
  }

  // Main settings view
  return (
    <div className="min-h-screen p-6 pb-24 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Sikkerhet</h1>
            <p className="text-sm opacity-70">Beskytt dine bilder</p>
          </div>
        </div>

        {/* Notification */}
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
              <h3 className="font-semibold text-lg">PIN-kode</h3>
              <p className="text-sm opacity-70">Lås appen med PIN-kode</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              pinEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {pinEnabled ? 'Aktivert' : 'Deaktivert'}
            </div>
          </div>

          <div className="space-y-2">
            {!pinEnabled ? (
              <button
                onClick={() => setShowPINSetup(true)}
                className="ripple-effect w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition text-left px-4 font-medium"
              >
                Aktiver PIN-kode
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowChangePIN(true)}
                  className="ripple-effect w-full py-3 glass hover:bg-white/10 rounded-xl transition text-left px-4"
                >
                  Endre PIN-kode
                </button>
                <button
                  onClick={handleDisablePIN}
                  className="ripple-effect w-full py-3 glass hover:bg-red-500/20 rounded-xl transition text-left px-4 text-red-400"
                >
                  Deaktiver PIN-kode
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
                  {pinEnabled ? 'Lås opp med biometri' : 'Krever PIN-kode'}
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
                <p>Du må aktivere PIN-kode først før du kan bruke biometrisk autentisering.</p>
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
              <h3 className="font-semibold text-lg">Auto-lås</h3>
              <p className="text-sm opacity-70">
                {pinEnabled ? 'Lås automatisk etter inaktivitet' : 'Krever PIN-kode'}
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
                Lås etter (minutter)
              </label>
              <select
                value={autoLockTimeout}
                onChange={(e) => toggleAutoLock(true, Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={1}>1 minutt</option>
                <option value={2}>2 minutter</option>
                <option value={5}>5 minutter</option>
                <option value={10}>10 minutter</option>
                <option value={15}>15 minutter</option>
                <option value={30}>30 minutter</option>
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
                <h3 className="font-semibold">Lås ved bakgrunn</h3>
                <p className="text-sm opacity-70">Lås når appen går i bakgrunnen</p>
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
                <strong>Om sikkerhet:</strong>
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>PIN-koden lagres kryptert lokalt på enheten din</li>
                <li>Biometrisk data lagres aldri - kun systemets API brukes</li>
                <li>Private album får ekstra kryptering</li>
                <li>Etter 5 feil forsøk låses appen i 5 minutter</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
