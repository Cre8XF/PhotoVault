// ============================================================================
// COMPONENT: Input.jsx – Unified form input component (Phase 5B Session 4)
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'

/**
 * Input Component - Unified form inputs
 *
 * Supports:
 * - Input types: text, email, password, number, url, tel
 * - Textarea (multiline)
 * - Validation states (error, success)
 * - Character count
 * - Helper text
 * - Labels with required indicator
 * - WCAG AA compliant
 * - 16px font (prevents iOS zoom)
 *
 * Features:
 * - Accessible with proper ARIA attributes
 * - Works in dark and light mode
 * - Focus states with purple ring
 * - Disabled state support
 */
const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  helperText,
  maxLength,
  showCharacterCount = false,
  required = false,
  disabled = false,
  className = '',
  rows = 3,
  as = 'input',
  id,
  name,
  autoComplete,
  ...props
}) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  const baseInputStyles = `
    w-full px-4 py-3 rounded-lg
    bg-white/5 dark:bg-white/5
    border border-white/10 dark:border-white/10
    text-gray-900 dark:text-white
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-purple-300/50
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim().replace(/\s+/g, ' ')

  // Font size 16px to prevent iOS zoom
  const fontSizeStyles = 'text-base' // 16px

  const stateStyles = error
    ? 'border-red-500 focus:ring-red-300/50'
    : success
    ? 'border-green-500 focus:ring-green-300/50'
    : 'hover:border-white/20 dark:hover:border-white/20'

  const Tag = as === 'textarea' ? 'textarea' : 'input'

  const inputProps = {
    id: inputId,
    name: name || inputId,
    value,
    onChange,
    placeholder,
    disabled,
    maxLength,
    autoComplete,
    className: `${baseInputStyles} ${fontSizeStyles} ${stateStyles} ${className}`,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error || helperText ? `${inputId}-helper` : undefined,
    ...props
  }

  if (as === 'textarea') {
    inputProps.rows = rows
  } else {
    inputProps.type = type
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}

      <Tag {...inputProps} />

      <div className="flex items-center justify-between mt-1 min-h-[20px]">
        <div className="flex-1">
          {error && (
            <p id={`${inputId}-helper`} className="text-xs text-error">
              {error}
            </p>
          )}
          {success && !error && (
            <p id={`${inputId}-helper`} className="text-xs text-success">
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p id={`${inputId}-helper`} className="text-xs text-muted">
              {helperText}
            </p>
          )}
        </div>

        {showCharacterCount && maxLength && (
          <p className="text-xs text-muted ml-2">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'url', 'tel']),
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.string,
  helperText: PropTypes.string,
  maxLength: PropTypes.number,
  showCharacterCount: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  rows: PropTypes.number,
  as: PropTypes.oneOf(['input', 'textarea']),
  id: PropTypes.string,
  name: PropTypes.string,
  autoComplete: PropTypes.string
}

export default Input
