// ============================================================================
// utils/aiAuth.js - AI Authentication & Authorization
// ============================================================================

/**
 * Bestemmer AI-modus basert på brukerplan og tilgjengelige nøkler
 * @param {Object} user - Firebase auth user
 * @param {string} plan - Brukerplan ('free' eller 'pro')
 * @param {Object} keys - API-nøkler { vision, picsart }
 * @returns {Object} - Auth-konfigurasjon
 */
export function getAIAuth(user, plan = 'free', keys = {}) {
  if (!user) {
    return {
      mode: 'none',
      error: 'User not authenticated',
      canUseVision: false,
      canUsePicsart: false
    };
  }

  // Pro-brukere: Server-proxy
  if (plan === 'pro') {
    return {
      mode: 'server',
      userId: user.uid,
      canUseVision: true,
      canUsePicsart: true,
      proxyUrl: process.env.REACT_APP_AI_PROXY_URL || 'https://us-central1-photovault-app-a0946.cloudfunctions.net'
    };
  }

  // Gratis-brukere: Client-side med egen nøkkel
  const visionKey = keys.vision || process.env.REACT_APP_GOOGLE_VISION_KEY;
  const picsartKey = keys.picsart || process.env.REACT_APP_PICSART_KEY;

  return {
    mode: 'client',
    userId: user.uid,
    canUseVision: !!visionKey,
    canUsePicsart: !!picsartKey,
    keys: {
      vision: visionKey,
      picsart: picsartKey
    },
    warning: !visionKey ? 'Google Vision API-nøkkel mangler. Sett den i innstillinger.' : null
  };
}

/**
 * Sjekk om bruker kan bruke en spesifikk AI-funksjon
 * @param {Object} auth - Auth-objekt fra getAIAuth()
 * @param {string} service - 'vision' eller 'picsart'
 * @returns {boolean}
 */
export function canUseAI(auth, service) {
  if (!auth || auth.mode === 'none') return false;

  if (service === 'vision') return auth.canUseVision;
  if (service === 'picsart') return auth.canUsePicsart;

  return false;
}

/**
 * Hent API-endpoint basert på auth-modus
 * @param {Object} auth - Auth-objekt
 * @param {string} operation - 'analyze', 'removeBg', 'enhance', etc.
 * @returns {string|null}
 */
export function getAIEndpoint(auth, operation) {
  if (auth.mode === 'server') {
    const endpoints = {
      analyze: `${auth.proxyUrl}/ai-vision-analyze`,
      removeBg: `${auth.proxyUrl}/ai-picsart-removeBg`,
      enhance: `${auth.proxyUrl}/ai-picsart-enhance`,
      effect: `${auth.proxyUrl}/ai-picsart-effect`
    };
    return endpoints[operation] || null;
  }

  // Client-mode bruker direkte API-er (håndteres i utils)
  return null;
}

export default {
  getAIAuth,
  canUseAI,
  getAIEndpoint
};