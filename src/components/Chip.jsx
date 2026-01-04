import React from 'react'
import { X } from 'lucide-react'
import PropTypes from 'prop-types'
import './Chip.css'

/**
 * Reusable Chip Component
 * Used for tags, filters, categories, status badges
 *
 * @param {string} variant - 'tag' | 'filter' | 'category' | 'status'
 * @param {boolean} active - Active/selected state
 * @param {boolean} removable - Show remove button
 * @param {function} onRemove - Remove handler
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Chip content
 */
export function Chip({
  variant = 'tag',
  active = false,
  removable = false,
  onRemove,
  onClick,
  children,
  className = '',
  ...props
}) {
  const chipClass = [
    'chip',
    `chip-${variant}`,
    active && 'chip-active',
    onClick && 'chip-clickable',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={chipClass} onClick={onClick} {...props}>
      <span className="chip-content">{children}</span>

      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="chip-remove"
          aria-label="Remove"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

Chip.propTypes = {
  variant: PropTypes.oneOf(['tag', 'filter', 'category', 'status']),
  active: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default Chip
