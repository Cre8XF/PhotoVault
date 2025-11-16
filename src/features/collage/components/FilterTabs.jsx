// ============================================================================
// COMPONENT: FilterTabs.jsx - Filter buttons for photo categories
// Horizontal tab bar with icons and labels
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { ImageIcon, Star, Smartphone, Clock, Sparkles } from 'lucide-react'

/**
 * FilterTabs Component
 * Displays filter tabs for photo categories
 *
 * @param {string} activeFilter - Currently active filter ID
 * @param {Function} onChange - Filter change handler (filterId) => void
 * @param {Array} photoCounts - Photo counts per filter { filterId, count }
 */
const FilterTabs = ({ activeFilter, onChange, photoCounts = {} }) => {
  const { t } = useTranslation(['collage'])

  const filters = [
    {
      id: 'all',
      label: t('collage:picker.filters.all'),
      icon: ImageIcon,
      color: 'text-white'
    },
    {
      id: 'favorites',
      label: t('collage:picker.filters.favorites'),
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      id: 'screenshots',
      label: t('collage:picker.filters.screenshots'),
      icon: Smartphone,
      color: 'text-blue-400'
    },
    {
      id: 'recent',
      label: t('collage:picker.filters.recent'),
      icon: Clock,
      color: 'text-green-400'
    },
    {
      id: 'ai',
      label: t('collage:picker.filters.ai'),
      icon: Sparkles,
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map(filter => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id
        const count = photoCounts[filter.id] || 0

        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={`
              ripple-effect flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
              }
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : filter.color}`} />
            <span className="text-sm font-medium">{filter.label}</span>
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

FilterTabs.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  photoCounts: PropTypes.object
}

export default FilterTabs
