/**
 * Environment Variable Diagnostics
 * Validates and reports on environment configuration
 * Only runs in development mode
 */

import { devSection, devLog, LogLevel } from './devLogger'

const isDev = import.meta.env.DEV

/**
 * Required environment variables by category
 */
const ENV_CONFIG = {
  firebase: {
    required: [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
    ],
    optional: [],
  },
  stripe: {
    required: [],
    optional: [
      'VITE_STRIPE_PUBLISHABLE_KEY',
      'VITE_STRIPE_LITE_PRICE_ID',
      'VITE_STRIPE_PRO_PRICE_ID',
    ],
  },
  cloudflare: {
    required: [],
    optional: [
      'VITE_R2_UPLOAD_URL',
      'VITE_R2_PUBLIC_URL',
    ],
  },
  features: {
    required: [],
    optional: [
      'VITE_EXPORT_URL',
      'VITE_IMPORT_URL',
      'VITE_SHARE_BASE_URL',
    ],
  },
}

/**
 * Check if an environment variable is set
 */
function isSet(varName) {
  const value = import.meta.env[varName]
  return value !== undefined && value !== null && value !== ''
}

/**
 * Get environment variable value
 */
function getValue(varName) {
  return import.meta.env[varName]
}

/**
 * Run environment diagnostics
 * @param {boolean} verbose - Show all details
 */
export function runEnvDiagnostics(verbose = false) {
  if (!isDev) return

  devSection('Environment Diagnostics')

  console.log('Mode:', import.meta.env.MODE)
  console.log('Dev:', import.meta.env.DEV)
  console.log('Prod:', import.meta.env.PROD)
  console.log('')

  let totalMissingRequired = 0
  let totalMissingOptional = 0

  Object.entries(ENV_CONFIG).forEach(([category, config]) => {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

    if (verbose || config.required.length > 0) {
      console.log(`📦 ${categoryName}:`)

      // Check required variables
      if (config.required.length > 0) {
        const missing = config.required.filter(v => !isSet(v))

        if (missing.length > 0) {
          totalMissingRequired += missing.length
          console.error(`  ❌ Missing ${missing.length} required variable(s):`)
          missing.forEach(v => console.error(`     - ${v}`))
        } else {
          console.log(`  ✅ All required variables present (${config.required.length})`)
        }
      }

      // Check optional variables (only in verbose mode)
      if (verbose && config.optional.length > 0) {
        const missing = config.optional.filter(v => !isSet(v))
        const present = config.optional.filter(v => isSet(v))

        if (present.length > 0) {
          console.log(`  ℹ️  Optional variables present: ${present.length}/${config.optional.length}`)
        }

        if (missing.length > 0) {
          totalMissingOptional += missing.length
          console.log(`  ⚠️  Optional variables missing: ${missing.length}`)
          if (verbose) {
            missing.forEach(v => console.log(`     - ${v}`))
          }
        }
      }

      console.log('')
    }
  })

  // Summary
  if (totalMissingRequired > 0) {
    console.error(`❌ CRITICAL: ${totalMissingRequired} required variable(s) missing!`)
    console.error(`⚠️  App may not function correctly`)
    console.error(`⚠️  Check your .env.local file`)
  } else {
    console.log(`✅ All required environment variables configured`)
  }

  if (verbose && totalMissingOptional > 0) {
    console.log(`ℹ️  ${totalMissingOptional} optional variable(s) not configured`)
    console.log(`   Some features may be unavailable`)
  }

  console.log('═══════════════════════════════════════════════')
}

/**
 * Check if a specific feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function isFeatureEnabled(feature) {
  const featureVars = {
    stripe: 'VITE_STRIPE_PUBLISHABLE_KEY',
    r2Storage: 'VITE_R2_UPLOAD_URL',
    export: 'VITE_EXPORT_URL',
    import: 'VITE_IMPORT_URL',
    sharing: 'VITE_SHARE_BASE_URL',
  }

  const varName = featureVars[feature]
  if (!varName) return false

  return isSet(varName)
}

/**
 * Log a warning if a feature is not configured
 * @param {string} feature - Feature name
 * @param {string} action - Action being attempted
 */
export function warnIfFeatureDisabled(feature, action) {
  if (!isDev) return

  if (!isFeatureEnabled(feature)) {
    devLog(
      `Feature "${feature}" not configured. ${action} will not work.`,
      LogLevel.WARN
    )
    devLog(
      `Set the required environment variables in .env.local`,
      LogLevel.INFO
    )
  }
}

/**
 * Get diagnostic info for a specific category
 * @param {string} category - Category name
 * @returns {object} Diagnostic info
 */
export function getCategoryDiagnostics(category) {
  const config = ENV_CONFIG[category]
  if (!config) return null

  const required = {
    total: config.required.length,
    present: config.required.filter(v => isSet(v)).length,
    missing: config.required.filter(v => !isSet(v)),
  }

  const optional = {
    total: config.optional.length,
    present: config.optional.filter(v => isSet(v)).length,
    missing: config.optional.filter(v => !isSet(v)),
  }

  return {
    category,
    required,
    optional,
    isFullyConfigured: required.missing.length === 0,
  }
}

export default {
  run: runEnvDiagnostics,
  isFeatureEnabled,
  warnIfFeatureDisabled,
  getCategoryDiagnostics,
}
