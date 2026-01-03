import React from 'react'
import PropTypes from 'prop-types'

/**
 * Button Component - Unified button for entire app
 *
 * Features:
 * - WCAG AA compliant (44px touch targets on md/lg)
 * - Loading states built-in
 * - Disabled states with proper cursor
 * - Focus indicators for keyboard navigation
 * - Dark/light mode support
 *
 * Variants:
 * - primary: Main CTAs (purple gradient)
 * - secondary: Secondary actions (glass effect)
 * - danger: Destructive actions (red)
 * - ghost: Subtle actions (transparent)
 * - icon: Icon-only buttons (square, 44x44px minimum)
 *
 * Sizes:
 * - sm: Small (36px height)
 * - md: Medium (44px height - WCAG compliant default)
 * - lg: Large (52px height)
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    font-semibold rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    ripple-effect
  `.trim().replace(/\s+/g, ' ')

  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600 to-purple-500
      hover:from-purple-700 hover:to-purple-600
      text-white shadow-md hover:shadow-lg
      hover:-translate-y-0.5 active:translate-y-0
      focus-visible:ring-purple-400
    `.trim().replace(/\s+/g, ' '),

    'primary-gradient': `
      bg-gradient-to-r from-blue-600 to-purple-600
      hover:from-blue-700 hover:to-purple-700
      text-white shadow-lg hover:shadow-xl
      hover:scale-105 active:scale-100
      focus-visible:ring-purple-400
    `.trim().replace(/\s+/g, ' '),

    secondary: `
      bg-white/5 hover:bg-white/10
      dark:bg-white/5 dark:hover:bg-white/10
      border border-white/10 hover:border-white/20
      backdrop-blur-sm
      focus-visible:ring-white/30
    `.trim().replace(/\s+/g, ' '),

    danger: `
      bg-red-600 hover:bg-red-700
      text-white shadow-md
      hover:-translate-y-0.5 active:translate-y-0
      focus-visible:ring-red-400
    `.trim().replace(/\s+/g, ' '),

    ghost: `
      bg-transparent hover:bg-white/5
      dark:hover:bg-white/5
      focus-visible:ring-white/30
    `.trim().replace(/\s+/g, ' '),

    icon: `
      bg-white/5 hover:bg-white/10
      dark:bg-white/5 dark:hover:bg-white/10
      border border-white/10 hover:border-white/20
      backdrop-blur-sm
      focus-visible:ring-white/30
      aspect-square p-0
    `.trim().replace(/\s+/g, ' ')
  }

  const sizes = {
    sm: variant === 'icon' ? 'w-9 h-9 min-w-[36px] min-h-[36px]' : 'px-3 py-1.5 text-sm min-h-[36px]',
    md: variant === 'icon' ? 'w-11 h-11 min-w-[44px] min-h-[44px]' : 'px-4 py-2 text-base min-h-[44px]', // WCAG AA: 44px touch target
    lg: variant === 'icon' ? 'w-14 h-14 min-w-[56px] min-h-[56px]' : 'px-6 py-3 text-lg min-h-[52px]'
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-label="Loading"
          />
        </div>
      )}

      {/* Button content */}
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />}
      </span>
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'primary-gradient', 'secondary', 'danger', 'ghost', 'icon']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
}

export default Button
