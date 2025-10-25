# SecuritySettings - Polish & Enhancements

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat(security): enhance security UI with animations and better UX"

## FILES TO MODIFY

- @src/pages/SecuritySettings.jsx
- Create @src/components/SecurityStatusIndicator.jsx
- Create @src/components/BiometricSetupFlow.jsx

## CURRENT STATE ANALYSIS

SecuritySettings is already well-designed. We'll add:

- Visual security status indicator
- Animated setup flows
- Activity log enhancements
- Better mobile experience

## TARGET STATE

Polished security interface with:

- Security score visualization
- Smooth biometric setup flow
- Enhanced activity log
- Security recommendations

## IMPLEMENTATION STEPS

### 1. Create SecurityStatusIndicator Component

**File:** `src/components/SecurityStatusIndicator.jsx`

```jsx
import { motion } from 'framer-motion';
import { Shield, Check, AlertTriangle } from 'lucide-react';

export const SecurityStatusIndicator = ({ score, features }) => {
  const getScoreColor = score => {
    if (score >= 80) return { from: 'from-green-600', to: 'to-emerald-600', text: 'text-green-400' };
    if (score >= 60) return { from: 'from-yellow-600', to: 'to-orange-600', text: 'text-yellow-400' };
    return { from: 'from-red-600', to: 'to-pink-600', text: 'text-red-400' };
  };

  const colors = getScoreColor(score);

  return (
    <motion.div className="glass p-6 rounded-2xl relative overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to} opacity-10`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div className={`p-3 bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl`} animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Shield className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg">Sikkerhetsstatus</h3>
              <p className="text-sm opacity-70">{score >= 80 ? 'Utmerket sikkerhet' : score >= 60 ? 'God sikkerhet' : 'Trenger forbedring'}</p>
            </div>
          </div>

          <div className="text-right">
            <motion.div className={`text-4xl font-bold ${colors.text}`} key={score} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
              {score}
            </motion.div>
            <div className="text-xs opacity-50">av 100</div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-10" />
            {/* Progress circle */}
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={colors.text}
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${(score / 100) * 352} 352` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
              {score >= 80 ? <Check className={`w-12 h-12 ${colors.text}`} /> : <AlertTriangle className={`w-12 h-12 ${colors.text}`} />}
            </motion.div>
          </div>
        </div>

        {/* Security Features Status */}
        <div className="space-y-2">
          {features.map((feature, i) => (
            <motion.div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
              {feature.enabled ? <Check className="w-5 h-5 text-green-400 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
              <span className="flex-1">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
```

### 2. Create BiometricSetupFlow Component

**File:** `src/components/BiometricSetupFlow.jsx`

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Check, AlertCircle, X } from 'lucide-react';

export const BiometricSetupFlow = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    {
      title: 'Aktiver biometrisk autentisering',
      description: 'Bruk fingeravtrykk eller Face ID for rask og sikker innlogging',
      action: 'Start oppsett'
    },
    {
      title: 'Plasser fingeren din',
      description: 'Hold fingeren på sensoren til vibrasjonen',
      action: 'Neste'
    },
    {
      title: 'Gjenta for bekreftelse',
      description: 'Skann fingeravtrykket en gang til',
      action: 'Fullfør'
    }
  ];

  const handleNext = async () => {
    if (step === steps.length - 1) {
      setIsVerifying(true);
      try {
        // Simulate biometric setup
        await new Promise(resolve => setTimeout(resolve, 2000));
        onComplete?.();
      } catch (err) {
        setError('Kunne ikke aktivere biometrisk autentisering');
        setIsVerifying(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center 
                 justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="glass p-8 rounded-2xl max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition">
          <X className="w-5 h-5" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-purple-600' : 'bg-white/10'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"
                animate={
                  isVerifying
                    ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 360]
                      }
                    : {}
                }
                transition={
                  isVerifying
                    ? {
                        duration: 2,
                        repeat: Infinity
                      }
                    : {}
                }
              >
                <Fingerprint className="w-12 h-12" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{steps[step].title}</h2>
              <p className="text-sm opacity-70">{steps[step].description}</p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg
                           flex items-start gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {step > 0 && !isVerifying && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl
                           transition font-semibold"
                >
                  Tilbake
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isVerifying}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
                         hover:from-purple-700 hover:to-pink-700 rounded-xl
                         transition font-semibold flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    Verifiserer...
                  </>
                ) : (
                  <>
                    {steps[step].action}
                    {step === steps.length - 1 && <Check className="w-5 h-5" />}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
```

### 3. Update SecuritySettings.jsx

```jsx
import { useState } from 'react';
import { SecurityStatusIndicator } from '../components/SecurityStatusIndicator';
import { BiometricSetupFlow } from '../components/BiometricSetupFlow';
import { Shield, Lock, Key, Smartphone, History, AlertTriangle, Check, MapPin, Chrome } from 'lucide-react';

// Calculate security score
const calculateSecurityScore = settings => {
  let score = 0;
  if (settings.twoFactorEnabled) score += 30;
  if (settings.biometricEnabled) score += 25;
  if (settings.pinEnabled) score += 20;
  if (settings.sessionTimeout < 30) score += 15;
  if (settings.loginAlerts) score += 10;
  return score;
};

const [showBiometricSetup, setShowBiometricSetup] = useState(false);
const [securitySettings, setSecuritySettings] = useState({
  twoFactorEnabled: false,
  biometricEnabled: false,
  pinEnabled: true,
  sessionTimeout: 15,
  loginAlerts: true
});

const securityScore = calculateSecurityScore(securitySettings);

const securityFeatures = [
  { label: 'To-faktor autentisering', enabled: securitySettings.twoFactorEnabled },
  { label: 'Biometrisk pålogging', enabled: securitySettings.biometricEnabled },
  { label: 'PIN-kode beskyttelse', enabled: securitySettings.pinEnabled },
  { label: 'Påloggingsvarsler', enabled: securitySettings.loginAlerts }
];

// In render:
<div className="container mx-auto px-4 py-8 max-w-4xl">
  <motion.h1 className="text-3xl font-bold mb-8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
    Sikkerhet
  </motion.h1>

  {/* Security Status */}
  <div className="mb-8">
    <SecurityStatusIndicator score={securityScore} features={securityFeatures} />
  </div>

  {/* Security Options */}
  <motion.div className="glass p-6 rounded-2xl mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
    <h2 className="text-xl font-semibold mb-6">Autentisering</h2>

    <div className="space-y-4">
      {/* Two-Factor Authentication */}
      <motion.div className="p-4 hover:bg-white/5 rounded-xl transition" whileHover={{ x: 4 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="font-medium">To-faktor autentisering</div>
              <div className="text-sm opacity-70">Ekstra sikkerhetslag for innlogging</div>
            </div>
          </div>
          <button
            onClick={() =>
              setSecuritySettings(prev => ({
                ...prev,
                twoFactorEnabled: !prev.twoFactorEnabled
              }))
            }
            className={`relative w-12 h-6 rounded-full transition-colors ${securitySettings.twoFactorEnabled ? 'bg-purple-600' : 'bg-white/10'}`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: securitySettings.twoFactorEnabled ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
        {securitySettings.twoFactorEnabled && (
          <motion.div className="ml-11 mt-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition">Konfigurer autentiseringsapp →</button>
          </motion.div>
        )}
      </motion.div>

      {/* Biometric */}
      <motion.div className="p-4 hover:bg-white/5 rounded-xl transition cursor-pointer" whileHover={{ x: 4 }} onClick={() => !securitySettings.biometricEnabled && setShowBiometricSetup(true)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-medium">Biometrisk pålogging</div>
              <div className="text-sm opacity-70">Fingeravtrykk eller Face ID</div>
            </div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              if (securitySettings.biometricEnabled) {
                setSecuritySettings(prev => ({ ...prev, biometricEnabled: false }));
              } else {
                setShowBiometricSetup(true);
              }
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${securitySettings.biometricEnabled ? 'bg-purple-600' : 'bg-white/10'}`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: securitySettings.biometricEnabled ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>
    </div>
  </motion.div>

  {/* Activity Log */}
  <motion.div className="glass p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold">Aktivitetslogg</h2>
      <button className="text-sm text-purple-400 hover:text-purple-300 transition">Se alle</button>
    </div>

    <div className="space-y-3">
      {[
        { icon: Check, action: 'Vellykket pålogging', location: 'Oslo, Norge', device: 'Chrome på Mac', time: '2 timer siden', status: 'success' },
        { icon: AlertTriangle, action: 'Mislykket påloggingsforsøk', location: 'Ukjent', device: 'Chrome på Windows', time: '5 timer siden', status: 'warning' },
        { icon: Key, action: 'Passord endret', location: 'Oslo, Norge', device: 'Safari på iPhone', time: '1 dag siden', status: 'info' }
      ].map((activity, i) => (
        <motion.div
          key={i}
          className={`p-4 rounded-xl border ${
            activity.status === 'success' ? 'bg-green-500/5 border-green-500/20' : activity.status === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-blue-500/5 border-blue-500/20'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-600/20' : activity.status === 'warning' ? 'bg-yellow-600/20' : 'bg-blue-600/20'}`}>
              <activity.icon className={`w-4 h-4 ${activity.status === 'success' ? 'text-green-400' : activity.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`} />
            </div>
            <div className="flex-1">
              <div className="font-medium mb-1">{activity.action}</div>
              <div className="flex flex-wrap gap-3 text-xs opacity-70">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {activity.location}
                </span>
                <span className="flex items-center gap-1">
                  <Chrome className="w-3 h-3" />
                  {activity.device}
                </span>
                <span>{activity.time}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>

  {/* Biometric Setup Modal */}
  <AnimatePresence>
    {showBiometricSetup && (
      <BiometricSetupFlow
        onComplete={() => {
          setSecuritySettings(prev => ({ ...prev, biometricEnabled: true }));
          setShowBiometricSetup(false);
        }}
        onCancel={() => setShowBiometricSetup(false)}
      />
    )}
  </AnimatePresence>
</div>;
```

## TESTING CHECKLIST

- [ ] Security score calculates correctly
- [ ] Progress ring animates smoothly
- [ ] Biometric setup flow works
- [ ] Multi-step modal transitions smooth
- [ ] Toggle switches responsive
- [ ] Activity log displays correctly
- [ ] Mobile responsive
- [ ] All animations 60fps
- [ ] No console errors
- [ ] i18n works (NO/EN)

## PERFORMANCE REQUIREMENTS

- Security score animation: <500ms
- Toggle response: <100ms
- Modal transitions: <300ms
- 60fps animations throughout

## COMMIT MESSAGE

```
feat(security): enhance security UI with animations and better UX

- Add SecurityStatusIndicator with score visualization
- Implement BiometricSetupFlow with multi-step modal
- Enhance activity log with status indicators
- Add smooth toggle animations
- Improve mobile responsive design
- Add visual feedback for all interactions

All animations 60fps, toggles respond in <100ms
```

## NEXT SESSION

After this is complete and committed, proceed to: `@docs/prompts/11-login.md`

---

END OF PROMPT
