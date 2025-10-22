// ============================================================================
// pages/AISettingsPage.jsx - AI Innstillinger
// ============================================================================
import React, { useState, useEffect } from "react";
import {
  Wand2,
  Key,
  DollarSign,
  Activity,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { checkAPIKey as checkGoogleKey } from "../utils/googleVision";
import { checkAPIKey as checkPicsartKey, estimateCost } from "../utils/picsartAI";

const AISettingsPage = ({ onBack, photos }) => {
  const [googleKey, setGoogleKey] = useState('');
  const [picsartKey, setPicsartKey] = useState('');
  const [autoTagEnabled, setAutoTagEnabled] = useState(
    localStorage.getItem('aiAutoTag') !== 'false'
  );
  const [apiStatus, setApiStatus] = useState({
    google: null,
    picsart: null,
  });

  useEffect(() => {
    // Sjekk API-nøkler ved lasting
    const google = checkGoogleKey();
    const picsart = checkPicsartKey();
    
    setApiStatus({
      google: google.isConfigured,
      picsart: picsart.isConfigured,
    });

    setGoogleKey(google.key);
    setPicsartKey(picsart.key);
  }, []);

  // Kalkuler AI-bruk
  const aiStats = {
    analyzed: photos.filter(p => p.aiAnalyzed).length,
    enhanced: photos.filter(p => p.enhanced).length,
    bgRemoved: photos.filter(p => p.bgRemoved).length,
    total: photos.length,
  };

  const monthlyRequests = aiStats.analyzed + aiStats.enhanced + aiStats.bgRemoved;
  const googleCost = monthlyRequests <= 1000 ? 0 : ((monthlyRequests - 1000) * 0.0015).toFixed(2);
  const picsartCost = estimateCost(aiStats.enhanced + aiStats.bgRemoved);

  const handleAutoTagToggle = () => {
    const newValue = !autoTagEnabled;
    setAutoTagEnabled(newValue);
    localStorage.setItem('aiAutoTag', newValue.toString());
  };

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-purple-400" />
          AI-innstillinger
        </h1>
      </div>

      {/* API Status */}
      <section className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-400" />
          API-nøkler
        </h2>

        <div className="space-y-4">
          {/* Google Vision */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              {apiStatus.google ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="font-medium">Google Cloud Vision</p>
                <p className="text-xs opacity-70">{googleKey}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                apiStatus.google
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {apiStatus.google ? 'Aktiv' : 'Ikke konfigurert'}
            </span>
          </div>

          {/* Picsart */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              {apiStatus.picsart ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="font-medium">Picsart API</p>
                <p className="text-xs opacity-70">{picsartKey}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                apiStatus.picsart
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {apiStatus.picsart ? 'Aktiv' : 'Ikke konfigurert'}
            </span>
          </div>
        </div>

        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-xs opacity-70">
              <p className="font-medium text-blue-400 mb-1">Setup guide</p>
              <p>
                For å aktivere AI-funksjoner, legg til API-nøkler i <code className="bg-black/30 px-1 rounded">.env</code> filen:
              </p>
              <div className="mt-2 bg-black/30 p-2 rounded font-mono text-xs">
                REACT_APP_GOOGLE_VISION_KEY=your_key<br />
                REACT_APP_PICSART_KEY=your_key
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Innstillinger */}
      <section className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Innstillinger
        </h2>

        <div className="space-y-4">
          {/* Auto-tagging */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-medium">Auto-tagging ved opplasting</p>
              <p className="text-xs opacity-70">
                Analyser bilder automatisk med AI når de lastes opp
              </p>
            </div>
            <button
              onClick={handleAutoTagToggle}
              className={`relative w-14 h-7 rounded-full transition ${
                autoTagEnabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoTagEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Statistikk */}
      <section className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          AI-aktivitet
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-2xl font-bold">{aiStats.analyzed}</p>
            <p className="text-sm opacity-70">Analysert</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-2xl font-bold">{aiStats.enhanced}</p>
            <p className="text-sm opacity-70">Forbedret</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-2xl font-bold">{aiStats.bgRemoved}</p>
            <p className="text-sm opacity-70">Bakgrunn fjernet</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-2xl font-bold">{monthlyRequests}</p>
            <p className="text-sm opacity-70">Total requests</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Gratis tier bruk</span>
            <span>{Math.min(monthlyRequests, 1000)}/1000</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className={`h-full rounded-full transition-all ${
                monthlyRequests > 1000 ? 'bg-red-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min((monthlyRequests / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Kostnader */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          Estimerte kostnader
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-medium">Google Vision API</p>
              <p className="text-xs opacity-70">
                {monthlyRequests <= 1000 ? 'Gratis tier' : `${monthlyRequests} requests`}
              </p>
            </div>
            <span className={`text-lg font-bold ${monthlyRequests <= 1000 ? 'text-green-400' : 'text-yellow-400'}`}>
              ${googleCost}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-medium">Picsart API</p>
              <p className="text-xs opacity-70">
                {picsartCost.tier === 'free' 
                  ? `Gratis (${picsartCost.remaining} igjen)` 
                  : `${picsartCost.paidRequests} betalte requests`
                }
              </p>
            </div>
            <span className={`text-lg font-bold ${picsartCost.tier === 'free' ? 'text-green-400' : 'text-yellow-400'}`}>
              ${picsartCost.cost}
            </span>
          </div>

          <div className="border-t border-white/10 pt-3 flex items-center justify-between p-4">
            <p className="font-semibold text-lg">Total per måned</p>
            <span className="text-2xl font-bold text-purple-400">
              ${(parseFloat(googleCost) + parseFloat(picsartCost.cost)).toFixed(2)}
            </span>
          </div>
        </div>

        {monthlyRequests > 1000 && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <p className="text-xs opacity-70">
                Du har overskredet gratis tier. Vurder å oppgradere til betalt plan eller redusere AI-bruk.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AISettingsPage;
