// ============================================================================
// PINLockScreen.jsx - PIN-låseskjerm
// FASE 3 - Sikkerhet & Privacy
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Delete, Fingerprint, Scan, AlertCircle } from 'lucide-react';
import { useSecurityContext } from '../contexts/SecurityContext';
import { getBiometricIcon, getBiometricDisplayName } from '../utils/biometric';

const PINLockScreen = () => {
  const {
    unlockWithPIN,
    unlockWithBiometric,
    biometricEnabled,
    failedAttempts
  } = useSecurityContext();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [biometricIcon, setBiometricIcon] = useState('Fingerprint');
  const [biometricName, setBiometricName] = useState('Biometri');
  
  const pinInputRef = useRef(null);

  // Load biometric info
  useEffect(() => {
    loadBiometricInfo();
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, []);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadBiometricInfo = async () => {
    const icon = await getBiometricIcon();
    const name = await getBiometricDisplayName();
    setBiometricIcon(icon);
    setBiometricName(name);
  };

  const handleNumberClick = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      // Auto-submit when reaching expected length
      if (newPin.length >= 4) {
        handleSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (pinToSubmit = pin) => {
    if (pinToSubmit.length < 4) {
      setError('PIN må være minst 4 siffer');
      return;
    }

    setLoading(true);
    const result = await unlockWithPIN(pinToSubmit);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setPin('');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  const handleBiometricUnlock = async () => {
    setLoading(true);
    const result = await unlockWithBiometric();
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleNumberClick(e.key);
    } else if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Enter' && pin.length >= 4) {
      handleSubmit();
    }
  };

  const BiometricIcon = biometricIcon === 'Fingerprint' ? Fingerprint : Scan;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-black z-50 flex items-center justify-center">
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Lock screen content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Lock icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          PhotoVault
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Skriv inn PIN-kode
        </p>

        {/* PIN dots */}
        <div className={`flex justify-center gap-4 mb-8 transition-transform ${shakeError ? 'animate-shake' : ''}`}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < pin.length
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{error}</p>
              {failedAttempts > 0 && failedAttempts < 5 && (
                <p className="text-red-300 text-xs mt-1">
                  {5 - failedAttempts} forsøk igjen før låsing
                </p>
              )}
            </div>
          </div>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              disabled={loading}
              className="h-16 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-white text-2xl font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          
          {/* Biometric button */}
          {biometricEnabled && (
            <button
              onClick={handleBiometricUnlock}
              disabled={loading}
              className="h-16 bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-600/70 hover:to-pink-600/70 backdrop-blur-xl rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-50"
              title={`Lås opp med ${biometricName}`}
            >
              <BiometricIcon className="w-6 h-6 text-white" />
            </button>
          )}
          
          {/* Empty space if no biometric */}
          {!biometricEnabled && <div />}

          {/* Zero */}
          <button
            onClick={() => handleNumberClick('0')}
            disabled={loading}
            className="h-16 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-white text-2xl font-semibold transition active:scale-95 disabled:opacity-50"
          >
            0
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-16 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-50"
          >
            <Delete className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Biometric unlock button (alternative placement) */}
        {biometricEnabled && (
          <button
            onClick={handleBiometricUnlock}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <BiometricIcon className="w-5 h-5" />
            Lås opp med {biometricName}
          </button>
        )}

        {/* Hidden input for keyboard support */}
        <input
          ref={pinInputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 6) {
              setPin(value);
              if (value.length >= 4) {
                handleSubmit(value);
              }
            }
          }}
          onKeyDown={handleKeyPress}
          className="sr-only"
          aria-label="PIN input"
        />

        {/* Info text */}
        <p className="text-center text-gray-400 text-sm mt-6">
          {loading ? 'Verifiserer...' : 'Skriv inn PIN for å låse opp'}
        </p>
      </div>

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-shake {
          animation: shake 0.4s;
        }
      `}</style>
    </div>
  );
};

export default PINLockScreen;
