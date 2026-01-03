// ============================================================================
// COMPONENT: Loading.jsx – Unified loading states (Phase 5B Session 3)
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'

/**
 * Unified Loading Component - Consolidates all loading states
 *
 * Variants:
 * - spinner: Inline spinner (default)
 * - overlay: Full-screen blocking overlay
 * - skeleton: Content placeholder animation
 *
 * Features:
 * - WCAG AA compliant with ARIA labels
 * - Works in dark and light mode
 * - Responsive sizing
 * - Smooth animations
 */
const Loading = ({
  variant = 'spinner',
  size = 'md',
  message,
  className = '',
  count = 8,
  ...props
}) => {
  // Spinner variant
  if (variant === 'spinner') {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4'
    }

    return (
      <div
        className={`flex items-center justify-center gap-2 ${className}`}
        {...props}
      >
        <div
          className={`
            ${sizes[size]}
            border-purple-600 border-t-transparent
            rounded-full animate-spin
          `}
          role="status"
          aria-label={message || "Loading"}
        />
        {message && (
          <span className="text-sm text-muted">
            {message}
          </span>
        )}
      </div>
    )
  }

  // Overlay variant
  if (variant === 'overlay') {
    return (
      <div
        className={`
          fixed inset-0 z-50
          flex flex-col items-center justify-center gap-4
          bg-black/50 backdrop-blur-sm
          animate-fade-in
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-label={message || "Loading"}
        {...props}
      >
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        {message && (
          <p className="text-white font-medium">{message}</p>
        )}
      </div>
    )
  }

  // Skeleton variant
  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`} {...props}>
        <div
          className="bg-white/10 dark:bg-white/5 rounded-lg h-full w-full"
          role="status"
          aria-label="Loading content"
        />
      </div>
    )
  }

  return null
}

Loading.propTypes = {
  variant: PropTypes.oneOf(['spinner', 'overlay', 'skeleton']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
  className: PropTypes.string,
  count: PropTypes.number
}

export default Loading

// Legacy exports for backwards compatibility (will be removed in future)
export const LoadingSpinner = (props) => <Loading variant="spinner" {...props} />
export const LoadingOverlay = (props) => <Loading variant="overlay" {...props} />
export const SkeletonCard = (props) => <Loading variant="skeleton" {...props} />
export const SkeletonGrid = ({ count = 8, ...props }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Loading key={i} variant="skeleton" className="aspect-square" {...props} />
    ))}
  </div>
)
