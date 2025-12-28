/**
 * Development Logger Utility
 * Provides clean, organized console logging for development
 * Production builds automatically strip these logs
 */

const isDev = import.meta.env.DEV

/**
 * Log levels for different types of messages
 */
export const LogLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
  SUCCESS: 'success',
}

/**
 * Log a message only in development mode
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error, debug, success)
 * @param {object} data - Optional data to log
 */
export function devLog(message, level = LogLevel.INFO, data = null) {
  if (!isDev) return

  const emoji = {
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.SUCCESS]: '✅',
  }

  const prefix = emoji[level] || 'ℹ️'

  switch (level) {
    case LogLevel.ERROR:
      console.error(`${prefix} ${message}`, data || '')
      break
    case LogLevel.WARN:
      console.warn(`${prefix} ${message}`, data || '')
      break
    default:
      console.log(`${prefix} ${message}`, data || '')
  }
}

/**
 * Log a group of related messages
 * @param {string} title - Group title
 * @param {function} callback - Function containing logs
 */
export function devGroup(title, callback) {
  if (!isDev) return

  console.group(`📦 ${title}`)
  callback()
  console.groupEnd()
}

/**
 * Log a collapsible group (collapsed by default)
 * @param {string} title - Group title
 * @param {function} callback - Function containing logs
 */
export function devGroupCollapsed(title, callback) {
  if (!isDev) return

  console.groupCollapsed(`📦 ${title}`)
  callback()
  console.groupEnd()
}

/**
 * Log a section header
 * @param {string} title - Section title
 */
export function devSection(title) {
  if (!isDev) return

  console.log('═══════════════════════════════════════════════')
  console.log(`🔧 ${title}`)
  console.log('═══════════════════════════════════════════════')
}

/**
 * Log environment variable diagnostics
 * @param {object} vars - Object with var names and values
 * @param {string} category - Category name (e.g., "Firebase", "Stripe")
 */
export function devLogEnvVars(vars, category = 'Environment') {
  if (!isDev) return

  devSection(`${category} Configuration`)

  const missing = []
  const present = []

  Object.entries(vars).forEach(([key, value]) => {
    if (value) {
      present.push(key)
      console.log(`  ✅ ${key}: SET`)
    } else {
      missing.push(key)
      console.log(`  ❌ ${key}: MISSING`)
    }
  })

  if (missing.length > 0) {
    console.warn(`⚠️ Missing ${missing.length} ${category} variable(s):`, missing.join(', '))
    console.warn(`⚠️ Check your .env.local file`)
  } else {
    console.log(`✅ All ${category} variables loaded (${present.length})`)
  }

  console.log('═══════════════════════════════════════════════')
}

/**
 * Create a scoped logger for a specific module
 * @param {string} moduleName - Name of the module
 * @returns {object} Logger functions scoped to module
 */
export function createModuleLogger(moduleName) {
  return {
    info: (msg, data) => devLog(`[${moduleName}] ${msg}`, LogLevel.INFO, data),
    warn: (msg, data) => devLog(`[${moduleName}] ${msg}`, LogLevel.WARN, data),
    error: (msg, data) => devLog(`[${moduleName}] ${msg}`, LogLevel.ERROR, data),
    debug: (msg, data) => devLog(`[${moduleName}] ${msg}`, LogLevel.DEBUG, data),
    success: (msg, data) => devLog(`[${moduleName}] ${msg}`, LogLevel.SUCCESS, data),
  }
}

/**
 * Log only if a condition is met
 * @param {boolean} condition - Condition to check
 * @param {string} message - Message to log if true
 * @param {string} level - Log level
 */
export function devLogIf(condition, message, level = LogLevel.INFO) {
  if (!isDev || !condition) return
  devLog(message, level)
}

/**
 * Log performance timing
 * @param {string} label - Performance label
 * @returns {function} Function to end timing
 */
export function devTime(label) {
  if (!isDev) return () => {}

  const start = performance.now()
  console.time(`⏱️ ${label}`)

  return () => {
    const duration = performance.now() - start
    console.timeEnd(`⏱️ ${label}`)
    return duration
  }
}

export default {
  log: devLog,
  group: devGroup,
  groupCollapsed: devGroupCollapsed,
  section: devSection,
  logEnvVars: devLogEnvVars,
  createModuleLogger,
  logIf: devLogIf,
  time: devTime,
  LogLevel,
}
