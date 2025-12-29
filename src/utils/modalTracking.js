/**
 * Modal Fatigue Prevention
 * Only show each modal type once per 24 hours
 */

const MODAL_STORAGE_KEY = 'pixtr_modals_shown'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check if modal can be shown (not shown recently)
 */
export function canShowModal(modalType) {
  try {
    const stored = localStorage.getItem(MODAL_STORAGE_KEY)

    if (!stored) return true

    const modalsShown = JSON.parse(stored)
    const lastShown = modalsShown[modalType]

    if (!lastShown) return true

    // Check if 24 hours have passed
    const timeSinceShown = Date.now() - lastShown
    return timeSinceShown > SESSION_DURATION
  } catch (error) {
    console.error('canShowModal error:', error)
    return true // Show on error (fail open)
  }
}

/**
 * Mark modal as shown
 */
export function markModalShown(modalType) {
  try {
    const stored = localStorage.getItem(MODAL_STORAGE_KEY)
    const modalsShown = stored ? JSON.parse(stored) : {}

    modalsShown[modalType] = Date.now()

    localStorage.setItem(MODAL_STORAGE_KEY, JSON.stringify(modalsShown))
  } catch (error) {
    console.error('markModalShown error:', error)
  }
}

/**
 * Reset modal tracking (for testing)
 */
export function resetModalTracking() {
  try {
    localStorage.removeItem(MODAL_STORAGE_KEY)
  } catch (error) {
    console.error('resetModalTracking error:', error)
  }
}
