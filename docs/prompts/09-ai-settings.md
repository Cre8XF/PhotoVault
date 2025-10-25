# AISettingsPage - Visual Enhancements

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat(ai-settings): add visual API validation and usage tracking"

## FILES TO MODIFY

- @src/pages/AISettingsPage.jsx
- Create @src/components/APIKeyValidator.jsx
- Create @src/components/CostCalculator.jsx
- Create @src/components/UsageChart.jsx

## CURRENT STATE ANALYSIS

AISettingsPage currently has:

- Basic API key input
- Simple enable/disable toggles
- No visual feedback
- No cost tracking

## TARGET STATE

Enhanced AI settings with:

- Visual API key validation
- Real-time cost calculator
- Usage charts and statistics
- Feature previews
- Interactive configuration

## IMPLEMENTATION STEPS

### 1. Create APIKeyValidator Component

**File:** `src/components/APIKeyValidator.jsx`

```jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const APIKeyValidator = ({
  provider,
  value,
  onChange,
  onValidate
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [showKey, setShowKey] = useState(false);

  const validateKey = async (key) => {
    if (!key || key.length < 10) {
      setValidationStatus(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await onValidate(provider, key);
      setValidationStatus(result);
    } catch (error) {
      setValidationStatus({ valid: false, error: error.message });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) validateKey(value);
    }, 1000);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${provider} API Key`}
          className="w-full px-4 py-3 pr-24 bg-white/5 border border-white/10 rounded-xl
                     focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                     transition outline-none font-mono text-sm"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Show/Hide Toggle */}
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            type="button"
          >
            {showKey ? (
              <EyeOff className="w-4 h-4 opacity-50" />
            ) : (
              <Eye className="w-4 h-4 opacity-50" />
            )}
          </button>

          {/* Validation Status */}
          <div className="w-6 h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isValidating ? (
                <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: aiSettings[feature.id]?.enabled ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>
      ))}
    </div>
  </motion.div>
</div>
```

## TESTING CHECKLIST

- [ ] API key validation works for all providers
- [ ] Show/hide password toggle functional
- [ ] Validation animations smooth
- [ ] Cost calculator updates in real-time
- [ ] Usage chart renders correctly
- [ ] Feature toggles work
- [ ] Mobile responsive
- [ ] All animations 60fps
- [ ] No console errors
- [ ] i18n works (NO/EN)

## PERFORMANCE REQUIREMENTS

- API validation debounced (1s)
- Chart animations <300ms
- Calculator updates instant (<50ms)
- Toggle switches <100ms response

## COMMIT MESSAGE

```
feat(ai-settings): add visual API validation and usage tracking

- Add APIKeyValidator component with real-time validation
- Implement CostCalculator with provider comparison
- Create UsageChart with 7-day statistics
- Add show/hide toggle for API keys
- Improve feature toggles with animations
- Add cost savings recommendations

All validations debounced, animations 60fps
```

## NEXT SESSION

After this is complete and committed, proceed to: `@docs/prompts/10-security.md`

---

END OF PROMPT.div key="loading" initial={{ scale: 0, rotate: 0 }} animate={{ scale: 1, rotate: 360 }} exit={{ scale: 0 }} transition={{ duration: 0.3 }} > <Loader2 className="w-5 h-5 text-purple-400 animate-spin" /> </motion.div> ) : validationStatus?.valid ? ( <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} > <Check className="w-5 h-5 text-green-400" /> </motion.div> ) : validationStatus?.valid === false ? ( <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} > <X className="w-5 h-5 text-red-400" /> </motion.div> ) : null} </AnimatePresence> </div> </div> </div>

      {/* Validation Message */}
      <AnimatePresence>
        {validationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
              validationStatus.valid
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {validationStatus.valid ? (
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-medium">
                {validationStatus.valid ? 'API Key er gyldig' : 'Ugyldig API Key'}
              </div>
              {validationStatus.message && (
                <div className="text-xs opacity-80 mt-1">
                  {validationStatus.message}
                </div>
              )}
              {validationStatus.valid && validationStatus.credits && (
                <div className="text-xs opacity-80 mt-1">
                  Tilgjengelige credits: {validationStatus.credits.toLocaleString('no-NO')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

); };

````

### 2. Create CostCalculator Component

**File:** `src/components/CostCalculator.jsx`

```jsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';

export const CostCalculator = ({ photosCount, aiSettings }) => {
  const [estimatePhotos, setEstimatePhotos] = useState(100);

  const calculateCosts = useMemo(() => {
    const costs = {
      openai: 0,
      claude: 0,
      gemini: 0
    };

    if (aiSettings.tagging?.enabled) {
      costs.openai += estimatePhotos * 0.002; // $0.002 per image
      costs.claude += estimatePhotos * 0.003;
      costs.gemini += estimatePhotos * 0.001;
    }

    if (aiSettings.faceDetection?.enabled) {
      costs.openai += estimatePhotos * 0.005;
      costs.claude += estimatePhotos * 0.006;
      costs.gemini += estimatePhotos * 0.003;
    }

    if (aiSettings.enhancement?.enabled) {
      costs.openai += estimatePhotos * 0.01;
      costs.claude += estimatePhotos * 0.012;
      costs.gemini += estimatePhotos * 0.008;
    }

    return costs;
  }, [estimatePhotos, aiSettings]);

  const totalCost = useMemo(() => {
    return Object.values(calculateCosts).reduce((sum, cost) => sum + cost, 0);
  }, [calculateCosts]);

  return (
    <motion.div
      className="glass p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Kostnadskalkulator</h3>
          <p className="text-sm opacity-70">Estimert kostnad per måned</p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm opacity-70 mb-2">
          Antall bilder per måned
        </label>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={estimatePhotos}
          onChange={(e) => setEstimatePhotos(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-2">
          <span className="opacity-50">10</span>
          <motion.span
            className="font-semibold text-purple-400"
            key={estimatePhotos}
            initial={{ scale: 1.2, color: '#8B5CF6' }}
            animate={{ scale: 1, color: 'inherit' }}
          >
            {estimatePhotos} bilder
          </motion.span>
          <span className="opacity-50">1000</span>
        </div>
      </div>

      {/* Provider Costs */}
      <div className="space-y-3 mb-6">
        {Object.entries(calculateCosts).map(([provider, cost]) => (
          <div key={provider} className="flex items-center justify-between p-3
                                         bg-white/5 rounded-lg">
            <span className="capitalize font-medium">{provider}</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <motion.span
                className="font-bold"
                key={cost}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                ${cost.toFixed(2)}
              </motion.span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total estimert kostnad</span>
          <motion.div
            className="flex items-center gap-2 text-2xl font-bold text-green-400"
            key={totalCost}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            <DollarSign className="w-6 h-6" />
            {totalCost.toFixed(2)}
          </motion.div>
        </div>
        <p className="text-xs opacity-50 mt-2">
          Per måned basert på valgte funksjoner
        </p>
      </div>

      {/* Savings Tip */}
      {totalCost > 10 && (
        <motion.div
          className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-400">Sparetips</div>
              <div className="opacity-70 text-xs mt-1">
                Vurder å bruke Gemini for tagging - 60% billigere
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
````

### 3. Create UsageChart Component

**File:** `src/components/UsageChart.jsx`

```jsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';

export const UsageChart = ({ usageData }) => {
  const maxValue = useMemo(() => Math.max(...usageData.map(d => d.count), 1), [usageData]);

  const totalRequests = useMemo(() => usageData.reduce((sum, d) => sum + d.count, 0), [usageData]);

  const averagePerDay = useMemo(() => totalRequests / usageData.length, [totalRequests, usageData]);

  return (
    <motion.div className="glass p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Bruk</h3>
            <p className="text-sm opacity-70">Siste 7 dager</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold">{totalRequests}</div>
          <div className="text-xs opacity-50">Forespørsler</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3 mb-6">
        {usageData.map((day, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-70">{day.label}</span>
              <span className="font-medium">{day.count}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(day.count / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
            <TrendingUp className="w-3 h-3" />
            Gjennomsnitt
          </div>
          <div className="text-lg font-bold">{averagePerDay.toFixed(1)}/dag</div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
            <Clock className="w-3 h-3" />
            Peak dag
          </div>
          <div className="text-lg font-bold">{Math.max(...usageData.map(d => d.count))}</div>
        </div>
      </div>
    </motion.div>
  );
};
```

### 4. Update AISettingsPage.jsx

```jsx
import { APIKeyValidator } from '../components/APIKeyValidator';
import { CostCalculator } from '../components/CostCalculator';
import { UsageChart } from '../components/UsageChart';
import { Sparkles, Image, Users, Wand2, Eye } from 'lucide-react';

// Add state
const [apiKeys, setApiKeys] = useState({
  openai: '',
  claude: '',
  gemini: ''
});

const [usageData] = useState([
  { label: 'Man', count: 12 },
  { label: 'Tir', count: 18 },
  { label: 'Ons', count: 15 },
  { label: 'Tor', count: 24 },
  { label: 'Fre', count: 20 },
  { label: 'Lør', count: 8 },
  { label: 'Søn', count: 5 }
]);

// In render:
<div className="container mx-auto px-4 py-8 max-w-4xl">
  <motion.h1
    className="text-3xl font-bold mb-8"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    AI Innstillinger
  </motion.h1>

  <div className="grid lg:grid-cols-2 gap-6 mb-8">
    {/* Usage Chart */}
    <UsageChart usageData={usageData} />

    {/* Cost Calculator */}
    <CostCalculator
      photosCount={photos.length}
      aiSettings={aiSettings}
    />
  </div>

  {/* API Keys Section */}
  <motion.div
    className="glass p-6 rounded-2xl mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <h2 className="text-xl font-semibold mb-6">API Nøkler</h2>

    <div className="space-y-6">
      {['openai', 'claude', 'gemini'].map((provider, i) => (
        <motion.div
          key={provider}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <label className="block text-sm font-medium mb-2 capitalize">
            {provider}
          </label>
          <APIKeyValidator
            provider={provider}
            value={apiKeys[provider]}
            onChange={(value) => setApiKeys(prev => ({ ...prev, [provider]: value }))}
            onValidate={validateAPIKey}
          />
        </motion.div>
      ))}
    </div>
  </motion.div>

  {/* AI Features */}
  <motion.div
    className="glass p-6 rounded-2xl"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <h2 className="text-xl font-semibold mb-6">Aktiverte funksjoner</h2>

    <div className="space-y-4">
      {[
        { id: 'tagging', icon: Sparkles, title: 'Smart Tagging', desc: 'Automatisk bildetagging' },
        { id: 'faces', icon: Users, title: 'Ansiktsgjenkjenning', desc: 'Finn personer i bilder' },
        { id: 'enhancement', icon: Wand2, title: 'Bildeforbedring', desc: 'Forbedre bildekvalitet' },
        { id: 'categorization', icon: Image, title: 'Kategorisering', desc: 'Organiser automatisk' },
        { id: 'ocr', icon: Eye, title: 'Tekstgjenkjenning', desc: 'Les tekst i bilder' }
      ].map((feature, i) => (
        <motion.div
          key={feature.id}
          className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.05 }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <feature.icon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="font-medium">{feature.title}</div>
              <div className="text-sm opacity-70">{feature.desc}</div>
            </div>
          </div>

          <button
            onClick={() => toggleFeature(feature.id)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              aiSettings[feature.id]?.enabled ? 'bg-purple-600' : 'bg-white/10'
            }`}
          >
            <motion
```
