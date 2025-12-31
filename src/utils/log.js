/**
 * Development-only logging utilities
 * Production builds strip these out automatically via Vite's tree-shaking
 *
 * Usage:
 * - devLog() for debug info (dev only)
 * - devWarn() for warnings (dev only)
 * - devError() for errors (ALWAYS shown, even in production)
 * - devGroup() for grouped logs (dev only)
 * - devTable() for table logs (dev only)
 */

const isDev = import.meta.env.DEV

/**
 * Log only in development mode
 * @param {...any} args - Arguments to log
 */
export function devLog(...args) {
  if (isDev) {
    console.log(...args)
  }
}

/**
 * Warn only in development mode
 * @param {...any} args - Arguments to warn
 */
export function devWarn(...args) {
  if (isDev) {
    console.warn(...args)
  }
}

/**
 * Error logging (ALWAYS shown, even in production)
 * Use this for critical errors that need monitoring
 * @param {...any} args - Arguments to error log
 */
export function devError(...args) {
  console.error(...args)
}

/**
 * Grouped logs for debugging (dev only)
 * @param {string} label - Group label
 * @param {Function} fn - Function containing logs
 */
export function devGroup(label, fn) {
  if (isDev) {
    console.group(label)
    fn()
    console.groupEnd()
  }
}

/**
 * Table logging (dev only)
 * @param {any} data - Data to display in table format
 */
export function devTable(data) {
  if (isDev) {
    console.table(data)
  }
}
