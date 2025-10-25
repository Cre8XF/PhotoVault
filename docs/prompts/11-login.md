# LoginPage - Modern Login Experience

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat(login): modern login with particles and smooth transitions"

## FILES TO MODIFY

- @src/pages/LoginPage.jsx
- Reuse @src/components/Particles.jsx

## CURRENT STATE ANALYSIS

LoginPage currently has:

- Basic form layout
- Simple validation
- Static background
- No animations

## TARGET STATE

Premium login experience with:

- Animated particle background
- Smooth form transitions
- Visual feedback
- Biometric quick login
- Password strength indicator

## IMPLEMENTATION STEPS

### 1. Update LoginPage.jsx with Animated Background

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Particles } from '../components/Particles';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Fingerprint, AlertCircle, Check, Sparkles } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // login, register, forgot
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = password => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validation
      const newErrors = {};
      if (!formData.email) newErrors.email = 'E-post er påkrevd';
      if (!formData.password) newErrors.password = 'Passord er påkrevd';
      if (mode === 'register' && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passordene matcher ikke';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onLogin?.(formData);
    } catch (error) {
      setErrors({ general: 'Noe gikk galt. Prøv igjen.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-gradient-to-br 
                    from-purple-900 via-pink-900 to-orange-900"
    >
      {/* Animated Background */}
      <Particles />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Logo/Brand */}
          <motion.div className="text-center mb-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <motion.div
              className="inline-flex p-4 bg-gradient-to-br from-purple-600 to-pink-600 
                         rounded-3xl mb-4 shadow-2xl"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-12 h-12" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">PhotoVault</h1>
            <p className="text-sm opacity-70">
              {mode === 'login' && 'Velkommen tilbake'}
              {mode === 'register' && 'Opprett konto'}
              {mode === 'forgot' && 'Tilbakestill passord'}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div className="glass p-8 rounded-3xl shadow-2xl border border-white/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {/* Biometric Quick Login */}
            {mode === 'login' && (
              <motion.button
                className="w-full mb-6 p-4 bg-white/5 hover:bg-white/10 rounded-2xl
                         transition-all duration-300 flex items-center justify-center gap-3
                         border border-white/10 hover:border-purple-500/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Fingerprint className="w-6 h-6 text-purple-400" />
                <span className="font-medium">Logg inn med biometri</span>
              </motion.button>
            )}

            {/* Divider */}
            {mode === 'login' && (
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[var(--bg-primary)] text-white/50">eller</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label className="block text-sm font-medium mb-2">E-post</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl
                               focus:ring-2 focus:ring-purple-500/20 transition outline-none
                               ${errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'}`}
                    placeholder="din@epost.no"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.div className="flex items-center gap-2 text-sm text-red-400 mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              {mode !== 'forgot' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <label className="block text-sm font-medium mb-2">Passord</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl
                                 focus:ring-2 focus:ring-purple-500/20 transition outline-none
                                 ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 
                               rounded-lg transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 opacity-50" /> : <Eye className="w-5 h-5 opacity-50" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {mode === 'register' && formData.password && (
                    <motion.div className="mt-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <div className="flex gap-1 mb-1">
                        {[25, 50, 75, 100].map(threshold => (
                          <div
                            key={threshold}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength >= threshold
                                ? passwordStrength === 100
                                  ? 'bg-green-500'
                                  : passwordStrength >= 75
                                  ? 'bg-yellow-500'
                                  : passwordStrength >= 50
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs ${passwordStrength === 100 ? 'text-green-400' : passwordStrength >= 75 ? 'text-yellow-400' : passwordStrength >= 50 ? 'text-orange-400' : 'text-red-400'}`}
                      >
                        {passwordStrength === 100 ? 'Veldig sterkt passord' : passwordStrength >= 75 ? 'Sterkt passord' : passwordStrength >= 50 ? 'Middels passord' : 'Svakt passord'}
                      </p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {errors.password && (
                      <motion.div className="flex items-center gap-2 text-sm text-red-400 mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Confirm Password Field */}
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                  <label className="block text-sm font-medium mb-2">Bekreft passord</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl
                                 focus:ring-2 focus:ring-purple-500/20 transition outline-none
                                 ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'}`}
                      placeholder="••••••••"
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.div className="flex items-center gap-2 text-sm text-red-400 mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Forgot Password Link */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setMode('forgot')} className="text-sm text-purple-400 hover:text-purple-300 transition">
                    Glemt passord?
                  </button>
                </div>
              )}

              {/* General Error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg
                               flex items-start gap-2 text-sm text-red-400"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {errors.general}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600
                         hover:from-purple-700 hover:to-pink-700 rounded-xl
                         font-semibold transition-all duration-300 flex items-center 
                         justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {isLoading ? (
                  <>
                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    {mode === 'login' && 'Logger inn...'}
                    {mode === 'register' && 'Oppretter konto...'}
                    {mode === 'forgot' && 'Sender e-post...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' && 'Logg inn'}
                    {mode === 'register' && 'Opprett konto'}
                    {mode === 'forgot' && 'Send tilbakestillingslenke'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Mode Toggle */}
            <motion.div className="mt-6 text-center text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              {mode === 'login' ? (
                <p>
                  Har du ikke konto?{' '}
                  <button onClick={() => setMode('register')} className="text-purple-400 hover:text-purple-300 transition font-medium">
                    Registrer deg
                  </button>
                </p>
              ) : mode === 'register' ? (
                <p>
                  Har du allerede konto?{' '}
                  <button onClick={() => setMode('login')} className="text-purple-400 hover:text-purple-300 transition font-medium">
                    Logg inn
                  </button>
                </p>
              ) : (
                <button onClick={() => setMode('login')} className="text-purple-400 hover:text-purple-300 transition font-medium">
                  ← Tilbake til innlogging
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div className="mt-8 text-center text-xs opacity-50" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1 }}>
            <p>Ved å fortsette godtar du våre vilkår og personvernregler</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
```

## TESTING CHECKLIST

- [ ] Particle background animates smoothly
- [ ] Form transitions work (login/register/forgot)
- [ ] Password show/hide toggle functional
- [ ] Password strength indicator updates correctly
- [ ] Validation errors display properly
- [ ] Loading state shows during submission
- [ ] Biometric button renders (login mode only)
- [ ] Confirm password field validates match
- [ ] Mobile responsive (form fits small screens)
- [ ] All animations 60fps
- [ ] No console errors
- [ ] Focus states work correctly
- [ ] i18n works (NO/EN)

## PERFORMANCE REQUIREMENTS

- Page load: <500ms
- Form validation: Instant (<50ms)
- Animations: 60fps throughout
- Password strength calculation: <10ms
- Particles don't block main thread

## COMMIT MESSAGE

```
feat(login): modern login with particles and smooth transitions

- Add animated particle background
- Implement smooth form mode transitions (login/register/forgot)
- Add password strength indicator with visual feedback
- Create biometric quick login option
- Add show/hide password toggle
- Implement real-time validation with animations
- Add loading states for all actions
- Improve mobile responsive design

All animations 60fps, form validations instant
```

## NEXT SESSION

After this is complete and committed, proceed to: `@docs/prompts/12-admin.md`

---

END OF PROMPT
