// ============================================================================
// Session Manager - P3-A: Single-Session Detection (Soft Guard)
// ============================================================================
// Detects multiple active instances and provides user choice
// Does NOT force close or redirect - just informs the user
// ============================================================================

const SESSION_KEY = 'pixtr_active_session'
const SESSION_HEARTBEAT_KEY = 'pixtr_session_heartbeat'
const HEARTBEAT_INTERVAL = 5000 // 5 seconds
const STALE_THRESHOLD = 15000 // 15 seconds - session is stale if no heartbeat

let currentSessionId = null
let heartbeatInterval = null

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Initialize session tracking
 * Returns info about existing sessions
 */
export function initSession() {
  // Generate new session ID for this instance
  currentSessionId = generateSessionId()

  // Check if another session exists
  const existingSessionId = localStorage.getItem(SESSION_KEY)
  const existingHeartbeat = parseInt(localStorage.getItem(SESSION_HEARTBEAT_KEY) || '0', 10)

  const now = Date.now()
  const hasActiveSession = existingSessionId &&
                          existingSessionId !== currentSessionId &&
                          (now - existingHeartbeat < STALE_THRESHOLD)

  // Set current session as active
  localStorage.setItem(SESSION_KEY, currentSessionId)
  localStorage.setItem(SESSION_HEARTBEAT_KEY, now.toString())

  // Start heartbeat to keep session alive
  startHeartbeat()

  // Listen for other sessions overwriting ours
  window.addEventListener('storage', handleStorageChange)

  console.log('📍 [SESSION] Initialized:', {
    sessionId: currentSessionId,
    hasActiveSession,
    existingSessionId,
    timeSinceHeartbeat: existingHeartbeat ? now - existingHeartbeat : null
  })

  return {
    sessionId: currentSessionId,
    hasActiveSession,
    existingSessionId: hasActiveSession ? existingSessionId : null
  }
}

/**
 * Start heartbeat to mark this session as alive
 */
function startHeartbeat() {
  // Clear any existing interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }

  heartbeatInterval = setInterval(() => {
    // Only update if this is still the active session
    const activeSession = localStorage.getItem(SESSION_KEY)
    if (activeSession === currentSessionId) {
      localStorage.setItem(SESSION_HEARTBEAT_KEY, Date.now().toString())
    }
  }, HEARTBEAT_INTERVAL)
}

/**
 * Handle storage changes from other tabs/windows
 */
function handleStorageChange(event) {
  if (event.key === SESSION_KEY && event.newValue !== currentSessionId) {
    console.warn('⚠️ [SESSION] Another instance took over session:', event.newValue)
    // Could emit an event here if needed
    // For now, just log - the banner will handle UX
  }
}

/**
 * Claim session as primary (user chose "Continue here")
 */
export function claimSession() {
  const now = Date.now()
  localStorage.setItem(SESSION_KEY, currentSessionId)
  localStorage.setItem(SESSION_HEARTBEAT_KEY, now.toString())
  console.log('✅ [SESSION] Claimed session:', currentSessionId)
}

/**
 * Check if another session is active
 */
export function hasOtherActiveSession() {
  const activeSessionId = localStorage.getItem(SESSION_KEY)
  const lastHeartbeat = parseInt(localStorage.getItem(SESSION_HEARTBEAT_KEY) || '0', 10)
  const now = Date.now()

  const isOtherActive = activeSessionId &&
                       activeSessionId !== currentSessionId &&
                       (now - lastHeartbeat < STALE_THRESHOLD)

  return isOtherActive
}

/**
 * Cleanup session on app close
 */
export function cleanupSession() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }

  // Only clear if this is still the active session
  const activeSession = localStorage.getItem(SESSION_KEY)
  if (activeSession === currentSessionId) {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_HEARTBEAT_KEY)
  }

  window.removeEventListener('storage', handleStorageChange)

  console.log('🧹 [SESSION] Cleaned up:', currentSessionId)
}

/**
 * Get current session ID
 */
export function getCurrentSessionId() {
  return currentSessionId
}
