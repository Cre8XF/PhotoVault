// ============================================================================
// Browser Detection - P3-B: Auth Link Context Awareness
// ============================================================================
// Detects if running in Gmail WebView, in-app browser, or restricted context
// Used to show appropriate messaging for auth flows
// ============================================================================

/**
 * Detect if running in Gmail WebView (Android)
 */
export function isGmailWebView() {
  const ua = navigator.userAgent || ''

  // Gmail app on Android uses custom WebView
  if (ua.includes('Android') && (
    ua.includes('Gmail') ||
    ua.includes('GSA/') || // Google Search App
    ua.match(/\bwv\b/) // WebView indicator
  )) {
    return true
  }

  return false
}

/**
 * Detect if running in iOS in-app browser
 */
export function isIOSInAppBrowser() {
  const ua = navigator.userAgent || ''

  // iOS but not Safari (likely in-app browser)
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    // Safari has 'Safari/' in UA, in-app browsers don't
    const isSafari = ua.includes('Safari/') && !ua.includes('CriOS') && !ua.includes('FxiOS')
    return !isSafari
  }

  return false
}

/**
 * Detect if running in Facebook/Instagram/Twitter in-app browser
 */
export function isSocialMediaBrowser() {
  const ua = navigator.userAgent || ''

  return ua.includes('FBAN') ||  // Facebook
         ua.includes('FBAV') ||  // Facebook
         ua.includes('Instagram') ||
         ua.includes('Twitter')
}

/**
 * Detect if running in any restricted browser context
 */
export function isRestrictedBrowserContext() {
  return isGmailWebView() ||
         isIOSInAppBrowser() ||
         isSocialMediaBrowser()
}

/**
 * Get browser context name for messaging
 */
export function getBrowserContextName() {
  if (isGmailWebView()) return 'Gmail'
  if (isIOSInAppBrowser()) return 'in-app browser'
  if (isSocialMediaBrowser()) {
    const ua = navigator.userAgent || ''
    if (ua.includes('Instagram')) return 'Instagram'
    if (ua.includes('FBAN') || ua.includes('FBAV')) return 'Facebook'
    if (ua.includes('Twitter')) return 'Twitter'
  }
  return 'restricted browser'
}

/**
 * Check if browser supports essential features
 */
export function hasBrowserFeatureSupport() {
  // Check for localStorage
  try {
    const test = 'test'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
  } catch (e) {
    return false
  }

  // Check for modern features
  const hasSupport = typeof window !== 'undefined' &&
                     typeof document !== 'undefined' &&
                     typeof fetch !== 'undefined' &&
                     typeof Promise !== 'undefined'

  return hasSupport
}

/**
 * Detect if opened from email link
 * (heuristic based on URL params and referrer)
 */
export function isLikelyFromEmailLink() {
  // Check for Firebase auth action params
  const url = new URL(window.location.href)
  const mode = url.searchParams.get('mode')
  const oobCode = url.searchParams.get('oobCode')

  // Has auth action params
  if (mode && oobCode) {
    return true
  }

  // Check referrer
  const referrer = document.referrer || ''
  if (referrer.includes('mail.google.com') ||
      referrer.includes('outlook.') ||
      referrer.includes('yahoo.') ||
      referrer.includes('protonmail.')) {
    return true
  }

  return false
}

/**
 * Get appropriate message for user based on context
 */
export function getContextMessage() {
  if (isGmailWebView()) {
    return {
      title: 'Åpner i nettleser',
      message: 'For sikker innlogging åpnes Pixtr i din standard nettleser.',
      action: 'Vent et øyeblikk...'
    }
  }

  if (isIOSInAppBrowser() || isSocialMediaBrowser()) {
    const contextName = getBrowserContextName()
    return {
      title: 'Åpne i nettleser',
      message: `Du ser på dette i ${contextName}. For beste opplevelse, åpne lenken i Safari eller Chrome.`,
      action: 'Kopier lenke og åpne i nettleser'
    }
  }

  return null
}

/**
 * Log browser context for debugging
 */
export function logBrowserContext() {
  if (import.meta.env.DEV) console.log('🌐 [BROWSER] Context:', {
    userAgent: navigator.userAgent,
    isGmailWebView: isGmailWebView(),
    isIOSInAppBrowser: isIOSInAppBrowser(),
    isSocialMediaBrowser: isSocialMediaBrowser(),
    isRestricted: isRestrictedBrowserContext(),
    fromEmailLink: isLikelyFromEmailLink(),
    contextName: getBrowserContextName(),
    hasFeatureSupport: hasBrowserFeatureSupport()
  })
}
