// ============================================================================
// HOOK: useKeyboardShortcuts.js - Keyboard shortcut registration
// ============================================================================
import { useEffect } from 'react'

/**
 * Hook for registering keyboard shortcuts
 *
 * Features:
 * - Supports modifier keys (Ctrl, Shift, Alt, Cmd)
 * - Ignores shortcuts when typing in inputs/textareas (except Escape)
 * - Prevents default browser behavior for registered shortcuts
 * - Cleans up event listeners on unmount
 *
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {Array} dependencies - Hook dependencies (handlers should be memoized)
 *
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+u': () => openUpload(),
 *   'ctrl+n': () => createAlbum(),
 *   'Delete': () => handleDelete(),
 *   '/': () => focusSearch(),
 *   '?': () => showHelp()
 * }, [openUpload, createAlbum, handleDelete, focusSearch, showHelp])
 */
export function useKeyboardShortcuts(shortcuts, dependencies = []) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in input/textarea (except Escape)
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      const isContentEditable = e.target.isContentEditable

      if ((isTyping || isContentEditable) && e.key !== 'Escape') {
        return
      }

      // Check each registered shortcut
      Object.entries(shortcuts).forEach(([key, handler]) => {
        if (matchesShortcut(e, key)) {
          e.preventDefault()
          handler(e)
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Check if keyboard event matches shortcut key combination
 *
 * Supported formats:
 * - Single key: 'a', 'ArrowLeft', 'Delete'
 * - With Ctrl: 'ctrl+a', 'ctrl+shift+a'
 * - With Cmd (Mac): 'cmd+a' (same as ctrl+a, handled automatically)
 * - With Shift: 'shift+a'
 * - With Alt: 'alt+a'
 * - Combinations: 'ctrl+shift+alt+a'
 *
 * @param {KeyboardEvent} e - The keyboard event
 * @param {string} shortcut - The shortcut combination (case-insensitive)
 * @returns {boolean} True if event matches shortcut
 */
function matchesShortcut(e, shortcut) {
  const keys = shortcut.toLowerCase().split('+').map(k => k.trim())

  // Extract modifiers and main key
  const hasCtrl = keys.includes('ctrl') || keys.includes('cmd')
  const hasShift = keys.includes('shift')
  const hasAlt = keys.includes('alt')
  const mainKey = keys[keys.length - 1]

  // Check if modifiers are pressed
  const ctrlPressed = hasCtrl && (e.ctrlKey || e.metaKey) // metaKey = Cmd on Mac
  const shiftPressed = hasShift && e.shiftKey
  const altPressed = hasAlt && e.altKey

  // Check if main key is pressed
  const keyPressed = e.key.toLowerCase() === mainKey.toLowerCase()

  // All required modifiers must match
  const ctrlMatch = !hasCtrl || ctrlPressed
  const shiftMatch = !hasShift || shiftPressed
  const altMatch = !hasAlt || altPressed

  // Also check that extra modifiers aren't pressed
  const noExtraCtrl = hasCtrl || !(e.ctrlKey || e.metaKey)
  const noExtraShift = hasShift || !e.shiftKey
  const noExtraAlt = hasAlt || !e.altKey

  return (
    keyPressed &&
    ctrlMatch &&
    shiftMatch &&
    altMatch &&
    noExtraCtrl &&
    noExtraShift &&
    noExtraAlt
  )
}

export default useKeyboardShortcuts
