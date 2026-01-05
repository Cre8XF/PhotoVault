// ============================================================================
// COMPONENT: Modal.jsx - Unified Modal with Focus Trap & Accessibility
// ============================================================================
import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'

/**
 * Unified Modal Component with full accessibility support
 *
 * Features:
 * - Focus trap (Tab/Shift+Tab cycles within modal)
 * - ESC to close (configurable)
 * - Click outside to close (configurable)
 * - Scroll lock on body
 * - ARIA attributes for screen readers
 * - Smooth animations
 * - Responsive size variants
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  className = '',
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`)

  // Size variants
  const sizes = {
    sm: 'max-w-md',      // Small modals (confirmations)
    md: 'max-w-lg',      // Default (forms)
    lg: 'max-w-2xl',     // Large content
    xl: 'max-w-4xl',     // Very large (image viewer)
    full: 'max-w-full mx-4', // Full width with margin
  }

  /**
   * Get all focusable elements within the modal
   */
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return []

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ]

    return Array.from(
      modalRef.current.querySelectorAll(focusableSelectors.join(','))
    )
  }, [])

  /**
   * Focus Management: Focus first element on open
   */
  useEffect(() => {
    if (!isOpen) return

    // Save currently focused element to restore later
    previousActiveElement.current = document.activeElement

    // Focus first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Restore focus on unmount
    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, getFocusableElements])

  /**
   * Scroll Lock: Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (!isOpen) return

    // Save current overflow value
    const originalOverflow = document.body.style.overflow

    // Lock scroll
    document.body.style.overflow = 'hidden'

    // Restore on cleanup
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  /**
   * Keyboard Handling: ESC to close, Tab to trap focus
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      // ESC key closes modal
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault()
        onClose()
        return
      }

      // Tab key: trap focus within modal
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements()

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Shift+Tab on first element: go to last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
        // Tab on last element: go to first
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose, getFocusableElements])

  /**
   * Click Outside Handler
   */
  const handleBackdropClick = useCallback((e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose()
    }
  }, [closeOnOutsideClick, onClose])

  // Don't render if not open
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 animate-fade-in"
      role="presentation"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId.current : undefined}
        className={`
          relative glass rounded-2xl shadow-2xl
          max-h-[90vh] overflow-y-auto
          animate-scale-in
          ${sizes[size]}
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            {title && (
              <h2
                id={titleId.current}
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  className: PropTypes.string,
}

export default Modal
