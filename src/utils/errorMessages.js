// ============================================================================
// UTILITY: errorMessages.js - Standardized error messaging (Phase 5B Session 6)
// ============================================================================

/**
 * Get user-friendly error message from error object
 *
 * @param {Error|Object} error - Error object from Firebase, fetch, or other sources
 * @param {string} context - Context for the error (e.g., 'Photo', 'Album', 'Collage')
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, context = '') => {
  if (!error) return ERROR_MESSAGES.GENERIC

  // Firebase Authentication errors
  if (error.code?.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password'
      case 'auth/email-already-in-use':
        return 'This email is already registered'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/user-disabled':
        return 'This account has been disabled'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later'
      case 'auth/operation-not-allowed':
        return 'Operation not allowed. Please contact support'
      case 'auth/requires-recent-login':
        return 'Please sign in again to continue'
      default:
        return 'Authentication error. Please try again'
    }
  }

  // Firebase Firestore errors
  if (error.code === 'permission-denied') {
    return context
      ? `You don't have permission to ${context.toLowerCase()}`
      : "You don't have permission to perform this action"
  }

  if (error.code === 'unauthenticated') {
    return 'Please sign in to continue'
  }

  if (error.code === 'not-found') {
    return context ? `${context} not found` : 'Not found'
  }

  if (error.code === 'already-exists') {
    return context ? `${context} already exists` : 'Already exists'
  }

  if (error.code === 'aborted') {
    return 'Operation was cancelled. Please try again'
  }

  if (error.code === 'deadline-exceeded' || error.code === 'cancelled') {
    return 'Request timed out. Please check your connection and try again'
  }

  if (error.code === 'resource-exhausted') {
    return 'Too many requests. Please wait a moment and try again'
  }

  // Firebase Storage errors
  if (error.code?.startsWith('storage/')) {
    switch (error.code) {
      case 'storage/unauthorized':
      case 'storage/unauthenticated':
        return 'Upload failed: You don\'t have permission'
      case 'storage/canceled':
        return 'Upload was cancelled'
      case 'storage/unknown':
        return 'Upload failed due to an unknown error. Please try again'
      case 'storage/object-not-found':
        return 'File not found'
      case 'storage/quota-exceeded':
        return 'Storage limit reached. Please upgrade or delete some photos'
      case 'storage/invalid-checksum':
        return 'File was corrupted during upload. Please try again'
      case 'storage/retry-limit-exceeded':
        return 'Upload failed after multiple retries. Please try again later'
      case 'storage/invalid-event-name':
      case 'storage/invalid-url':
      case 'storage/invalid-argument':
        return 'Invalid file. Please try a different file'
      case 'storage/no-default-bucket':
        return 'Storage is not configured. Please contact support'
      case 'storage/cannot-slice-blob':
        return 'File could not be processed. Please try a different file'
      case 'storage/server-file-wrong-size':
        return 'Upload verification failed. Please try again'
      default:
        return 'Upload failed. Please try again'
    }
  }

  // Network errors
  if (
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('fetch') ||
    error.message?.toLowerCase().includes('failed to fetch')
  ) {
    return 'Network error. Please check your connection and try again'
  }

  // Quota/limits errors
  if (
    error.message?.toLowerCase().includes('quota') ||
    error.message?.toLowerCase().includes('limit')
  ) {
    return 'You\'ve reached your limit. Please upgrade your plan or delete some items'
  }

  // File size errors
  if (error.message?.toLowerCase().includes('size')) {
    return 'File is too large. Please choose a smaller file'
  }

  // Generic fallback
  if (error.message) {
    // Clean up technical error messages
    const msg = error.message
    // Don't expose internal Firebase messages
    if (msg.includes('Missing or insufficient permissions')) {
      return 'You don\'t have permission to perform this action'
    }
    if (msg.length > 100) {
      return 'An error occurred. Please try again'
    }
    return msg
  }

  return ERROR_MESSAGES.GENERIC
}

/**
 * Common error messages used throughout the app
 */
export const ERROR_MESSAGES = {
  // Generic
  GENERIC: 'Something went wrong. Please try again',
  NETWORK: 'Network error. Please check your connection',
  TIMEOUT: 'Request timed out. Please try again',

  // Upload
  UPLOAD_FAILED: 'Upload failed. Please try again',
  UPLOAD_CANCELLED: 'Upload was cancelled',
  FILE_TOO_LARGE: 'File is too large. Maximum size is',
  INVALID_FILE: 'Invalid file type. Please upload an image or video',
  INVALID_IMAGE: 'Invalid image file. Please try a different image',
  INVALID_VIDEO: 'Invalid video file. Please try a different video',

  // Delete
  DELETE_FAILED: 'Could not delete. Please try again',
  DELETE_PERMISSION: 'You don\'t have permission to delete this',

  // Save/Update
  SAVE_FAILED: 'Save failed. Please try again',
  UPDATE_FAILED: 'Update failed. Please try again',

  // Load
  LOAD_FAILED: 'Failed to load data. Please refresh the page',

  // Limits
  TIER_LIMIT: 'You\'ve reached your plan limit',
  TIER_LIMIT_PHOTOS: 'You\'ve reached your photo limit. Upgrade to continue',
  TIER_LIMIT_ALBUMS: 'You\'ve reached your album limit. Upgrade to continue',
  TIER_LIMIT_STORAGE: 'Storage limit reached. Upgrade or delete some photos',

  // Verification
  EMAIL_NOT_VERIFIED: 'Please verify your email to continue',
  VERIFICATION_SENT: 'Verification email sent. Please check your inbox',

  // Authentication
  SIGNIN_REQUIRED: 'Please sign in to continue',
  SIGNIN_FAILED: 'Sign in failed. Please try again',
  SIGNUP_FAILED: 'Sign up failed. Please try again',

  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',

  // Albums
  ALBUM_NAME_REQUIRED: 'Album name is required',
  ALBUM_NOT_FOUND: 'Album not found',
  ALBUM_DELETE_FAILED: 'Could not delete album. Please try again',

  // Photos
  PHOTO_NOT_FOUND: 'Photo not found',
  PHOTO_DELETE_FAILED: 'Could not delete photo. Please try again',
  NO_PHOTOS_SELECTED: 'Please select at least one photo',

  // Collages
  COLLAGE_CREATE_FAILED: 'Could not create collage. Please try again',
  COLLAGE_DELETE_FAILED: 'Could not delete collage. Please try again',
  COLLAGE_PHOTO_LIMIT: 'Please select between 2 and 9 photos',
}

/**
 * Get validation error message for form fields
 *
 * @param {string} field - Field name (e.g., 'email', 'password', 'albumName')
 * @param {string} value - Field value
 * @param {Object} options - Validation options (e.g., { minLength: 6, maxLength: 50 })
 * @returns {string|null} Error message or null if valid
 */
export const getValidationError = (field, value, options = {}) => {
  const trimmedValue = typeof value === 'string' ? value.trim() : value

  // Required field
  if (options.required && !trimmedValue) {
    return ERROR_MESSAGES.REQUIRED_FIELD
  }

  // Email validation
  if (field === 'email' && trimmedValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedValue)) {
      return ERROR_MESSAGES.INVALID_EMAIL
    }
  }

  // Password validation
  if (field === 'password' && trimmedValue) {
    if (options.minLength && trimmedValue.length < options.minLength) {
      return `Password must be at least ${options.minLength} characters`
    }
  }

  // Password confirmation
  if (field === 'confirmPassword' && trimmedValue) {
    if (options.compareWith && trimmedValue !== options.compareWith) {
      return ERROR_MESSAGES.PASSWORDS_DONT_MATCH
    }
  }

  // Max length
  if (options.maxLength && trimmedValue.length > options.maxLength) {
    return `Maximum length is ${options.maxLength} characters`
  }

  // Min length
  if (options.minLength && trimmedValue.length < options.minLength) {
    return `Minimum length is ${options.minLength} characters`
  }

  return null
}

/**
 * Check if error is a network error
 */
export const isNetworkError = (error) => {
  if (!error) return false
  return (
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('fetch') ||
    error.code === 'unavailable'
  )
}

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error) => {
  if (!error) return false
  return (
    error.code === 'permission-denied' ||
    error.code === 'unauthenticated' ||
    error.code?.startsWith('storage/unauthorized')
  )
}

/**
 * Check if error is a quota/limit error
 */
export const isQuotaError = (error) => {
  if (!error) return false
  return (
    error.code === 'storage/quota-exceeded' ||
    error.code === 'resource-exhausted' ||
    error.message?.toLowerCase().includes('quota') ||
    error.message?.toLowerCase().includes('limit')
  )
}
