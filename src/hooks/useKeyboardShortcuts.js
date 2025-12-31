import { useEffect, useCallback } from 'react'

/**
 * Keyboard shortcuts hook for desktop users
 * Automatically disables when user is typing in input/textarea
 *
 * @param {Array} shortcuts - Array of { key: string, action: function }
 * @example
 * useKeyboardShortcuts([
 *   { key: 'ArrowLeft', action: () => navigateToPrev() },
 *   { key: 'ArrowRight', action: () => navigateToNext() },
 *   { key: 'Ctrl+a', action: () => selectAll() },
 *   { key: 'Escape', action: () => close() }
 * ])
 */
export function useKeyboardShortcuts(shortcuts) {
  const handleKeyDown = useCallback(
    (event) => {
      // Ignore if user is typing in input/textarea/contenteditable
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return
      }

      const key = event.key
      const ctrl = event.ctrlKey || event.metaKey // Support both Ctrl and Cmd (Mac)
      const shift = event.shiftKey
      const alt = event.altKey

      // Build key combo string
      let combo = ''
      if (ctrl) combo += 'Ctrl+'
      if (shift) combo += 'Shift+'
      if (alt) combo += 'Alt+'
      combo += key

      // Find matching shortcut
      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === combo.toLowerCase() ||
          s.key.toLowerCase() === key.toLowerCase()
      )

      if (shortcut) {
        event.preventDefault()
        shortcut.action(event)
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
