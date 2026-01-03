// ============================================================================
// COMPONENT: KeyboardShortcutsHelp.jsx - Keyboard shortcuts help modal
// ============================================================================
import React from 'react'
import Modal from './Modal'
import { Keyboard } from 'lucide-react'

const shortcuts = [
  {
    category: 'General',
    items: [
      { key: 'Ctrl + U', action: 'Upload photo' },
      { key: 'Ctrl + N', action: 'Create album' },
      { key: 'Ctrl + F', action: 'Search' },
      { key: '/', action: 'Quick search' },
      { key: 'Ctrl + ,', action: 'Settings' },
      { key: '?', action: 'Show keyboard shortcuts' },
    ],
  },
  {
    category: 'Photo Viewer',
    items: [
      { key: '←/→', action: 'Previous/Next photo' },
      { key: 'F', action: 'Toggle favorite' },
      { key: 'I', action: 'Show/hide info' },
      { key: 'Delete', action: 'Delete photo' },
      { key: 'Escape', action: 'Close viewer' },
    ],
  },
  {
    category: 'Album View',
    items: [
      { key: 'Ctrl + A', action: 'Select all' },
      { key: 'Ctrl + D', action: 'Deselect all' },
      { key: 'Delete', action: 'Delete selected' },
      { key: 'Escape', action: 'Clear selection' },
    ],
  },
]

export default function KeyboardShortcutsHelp({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="md"
      closeOnEscape={true}
      closeOnOutsideClick={true}
    >
      <div className="space-y-6">
        {shortcuts.map(({ category, items }) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-purple-400 dark:text-purple-300 mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              {category}
            </h3>
            <div className="space-y-2">
              {items.map(({ key, action }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {action}
                  </span>
                  <kbd className="px-2 py-1 bg-white/10 dark:bg-white/5 rounded text-xs font-mono text-gray-900 dark:text-white border border-white/20">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-600 dark:text-blue-300">
          💡 Tip: Press{' '}
          <kbd className="px-1 py-0.5 bg-blue-500/20 rounded font-mono">?</kbd>{' '}
          anytime to see this list
        </p>
      </div>
    </Modal>
  )
}
