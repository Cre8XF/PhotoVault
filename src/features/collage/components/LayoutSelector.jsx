// ============================================================================
// COMPONENT: LayoutSelector.jsx - Visual layout selection interface
// Grid of clickable layout icons with compatibility filtering
// ============================================================================
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import LayoutIcon from './LayoutIcon'
import { getCompatibleLayouts, getAllLayouts } from '../layouts/layouts_v3'

/**
 * LayoutSelector Component
 * Displays visual grid of layout options with compatibility filtering
 *
 * @param {number} photoCount - Number of selected photos
 * @param {Object} selectedLayout - Currently selected layout
 * @param {Function} onSelect - Selection handler (layout) => void
 * @param {boolean} showIncompatible - Show disabled incompatible layouts
 * @param {Function} onBack - Back button handler
 * @param {boolean} showBack - Show back button
 */
const LayoutSelector = ({
  photoCount,
  selectedLayout = null,
  onSelect,
  showIncompatible = false,
  onBack = null,
  showBack = false
}) => {
  const { t } = useTranslation(['collage'])

  // Get compatible layouts for current photo count
  const compatibleLayouts = useMemo(() => {
    return getCompatibleLayouts(photoCount)
  }, [photoCount])

  // Get all layouts if showing incompatible
  const allLayouts = useMemo(() => {
    return showIncompatible ? getAllLayouts() : compatibleLayouts
  }, [showIncompatible, compatibleLayouts])

  // Check if layout is compatible with current photo count
  const isCompatible = (layout) => {
    return photoCount >= layout.minPhotos && photoCount <= layout.maxPhotos
  }

  // Auto-select first compatible layout
  const handleAutoSelect = () => {
    if (compatibleLayouts.length > 0) {
      onSelect(compatibleLayouts[0])
    }
  }

  // Group layouts by photo count
  const layoutGroups = useMemo(() => {
    const groups = {}

    allLayouts.forEach(layout => {
      const key = layout.minPhotos === layout.maxPhotos
        ? `${layout.minPhotos} Photo${layout.minPhotos > 1 ? 's' : ''}`
        : `${layout.minPhotos}-${layout.maxPhotos} Photos`

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(layout)
    })

    return Object.entries(groups).sort((a, b) => {
      const aNum = parseInt(a[0])
      const bNum = parseInt(b[0])
      return aNum - bNum
    })
  }, [allLayouts])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="ripple-effect px-3 py-2 hover:bg-white/10 rounded-lg transition"
            >
              ← {t('collage:selector.back')}
            </button>
          )}

          <div>
            <h2 className="text-lg font-semibold">
              {t('collage:selector.title')}
            </h2>
            <p className="text-sm opacity-60">
              {t('collage:selector.subtitle', { count: photoCount })}
            </p>
          </div>
        </div>

        {/* Auto-select button */}
        {compatibleLayouts.length > 0 && !selectedLayout && (
          <button
            onClick={handleAutoSelect}
            className="ripple-effect flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{t('collage:selector.autoFill')}</span>
            <span className="sm:hidden">Auto</span>
          </button>
        )}
      </div>

      {/* Layout grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {compatibleLayouts.length === 0 ? (
          // No compatible layouts
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-lg font-medium mb-2">
              {t('collage:selector.noLayouts')}
            </p>
            <p className="text-sm opacity-60">
              {t('collage:selector.selectPhotos', { min: 1, max: 6 })}
            </p>
          </div>
        ) : (
          // Layout groups
          <div className="space-y-6">
            {layoutGroups.map(([groupName, layouts]) => (
              <div key={groupName}>
                {/* Group header */}
                <h3 className="text-sm font-medium opacity-70 mb-3">
                  {groupName}
                </h3>

                {/* Layout grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {layouts.map(layout => {
                    const compatible = isCompatible(layout)
                    const selected = selectedLayout?.id === layout.id

                    return (
                      <button
                        key={layout.id}
                        onClick={() => compatible && onSelect(layout)}
                        disabled={!compatible}
                        className={`
                          relative aspect-square rounded-xl border-2 p-3 md:p-4
                          transition-all duration-200
                          ${compatible ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
                          ${selected
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                            : compatible
                              ? 'border-white/20 hover:border-white/40'
                              : 'border-white/10 opacity-30'
                          }
                        `}
                        title={t(layout.nameKey) || layout.name}
                      >
                        {/* Layout icon */}
                        <div className="w-full h-full flex flex-col">
                          <div className="flex-1 mb-2">
                            <LayoutIcon
                              layout={layout}
                              className={selected ? 'text-blue-400' : 'text-white'}
                            />
                          </div>

                          {/* Layout name */}
                          <div className="text-xs font-medium truncate text-center">
                            {t(layout.nameKey) || layout.name}
                          </div>

                          {/* Selected indicator */}
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      {compatibleLayouts.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-60">
              {t('collage:selector.availableLayouts', { count: compatibleLayouts.length })}
            </span>
            {selectedLayout && (
              <span className="text-blue-400 font-medium">
                {t(selectedLayout.nameKey) || selectedLayout.name} {t('collage:selector.selected')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

LayoutSelector.propTypes = {
  photoCount: PropTypes.number.isRequired,
  selectedLayout: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  showIncompatible: PropTypes.bool,
  onBack: PropTypes.func,
  showBack: PropTypes.bool
}

LayoutSelector.defaultProps = {
  selectedLayout: null,
  showIncompatible: false,
  onBack: null,
  showBack: false
}

export default LayoutSelector
