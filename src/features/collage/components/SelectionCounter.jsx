// ============================================================================
// COMPONENT: SelectionCounter.jsx - Shows selected photo count and continue button
// Sticky header with selection info
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Check, ArrowRight } from 'lucide-react'

/**
 * SelectionCounter Component
 * Displays selection count and continue button
 *
 * @param {number} count - Number of selected photos
 * @param {number} maxPhotos - Maximum allowed photos
 * @param {Function} onContinue - Continue button handler
 * @param {boolean} showContinue - Show continue button
 */
const SelectionCounter = ({
  count,
  maxPhotos,
  onContinue,
  showContinue = true
}) => {
  const { t } = useTranslation(['collage'])

  const canContinue = count > 0 && count <= maxPhotos
  const isMaxReached = count >= maxPhotos

  return (
    <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full
            ${count > 0 ? 'bg-blue-600' : 'bg-white/10'}
          `}>
            {count > 0 ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span className="text-sm opacity-60">{count}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {count} / {maxPhotos} {t('collage:picker.selected')}
            </p>
            {isMaxReached && (
              <p className="text-xs opacity-60">
                {t('collage:picker.maxReached')}
              </p>
            )}
          </div>
        </div>

        {/* Continue button */}
        {showContinue && (
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className="
              ripple-effect flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-blue-600 hover:bg-blue-700 text-white
              disabled:bg-white/10 disabled:text-white/50
            "
          >
            <span className="text-sm">{t('collage:picker.continue')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isMaxReached ? 'bg-green-500' : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min((count / maxPhotos) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

SelectionCounter.propTypes = {
  count: PropTypes.number.isRequired,
  maxPhotos: PropTypes.number.isRequired,
  onContinue: PropTypes.func,
  showContinue: PropTypes.bool
}

SelectionCounter.defaultProps = {
  onContinue: () => {},
  showContinue: true
}

export default SelectionCounter
