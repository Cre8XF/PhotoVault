// ============================================================================
// COMPONENT: Badge.jsx – Unified badge component (Phase 5B Session 4)
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'

/**
 * Badge Component - Labels and status indicators
 *
 * Variants:
 * - default: Neutral gray badge
 * - purple: Brand color (subscriptions, features)
 * - success: Positive actions (verified, completed)
 * - warning: Caution states (pending, needs attention)
 * - error: Error states (failed, rejected)
 * - info: Informational (new, beta, tips)
 *
 * Features:
 * - WCAG AA compliant colors
 * - Works in dark and light mode
 * - Responsive sizing
 * - Smooth transitions
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-full
    transition-colors duration-200
  `

  // WCAG AA compliant variants for both light and dark modes
  const variants = {
    default: `
      bg-gray-100 text-gray-700
      dark:bg-gray-800 dark:text-gray-300
    `,
    purple: `
      bg-purple-100 text-purple-700
      dark:bg-purple-900/30 dark:text-purple-300
    `,
    success: `
      bg-green-100 text-green-700
      dark:bg-green-900/30 dark:text-green-300
    `,
    warning: `
      bg-yellow-100 text-yellow-700
      dark:bg-yellow-900/30 dark:text-yellow-300
    `,
    error: `
      bg-red-100 text-red-700
      dark:bg-red-900/30 dark:text-red-300
    `,
    info: `
      bg-blue-100 text-blue-700
      dark:bg-blue-900/30 dark:text-blue-300
    `
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  }

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </span>
  )
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'purple', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
}

export default Badge
