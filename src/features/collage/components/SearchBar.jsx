// ============================================================================
// COMPONENT: SearchBar.jsx - Debounced search input for photos
// Search by filename, tags, or AI tags
// ============================================================================
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'

/**
 * SearchBar Component
 * Debounced search input with clear button
 *
 * @param {string} query - Current search query
 * @param {Function} onChange - Query change handler (query) => void
 * @param {string} placeholder - Placeholder text
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
const SearchBar = ({
  query,
  onChange,
  placeholder,
  debounceMs = 300
}) => {
  const { t } = useTranslation(['collage'])
  const [localQuery, setLocalQuery] = useState(query)

  // Sync external query changes
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  // Debounce onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        onChange(localQuery)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localQuery, query, onChange, debounceMs])

  const handleClear = () => {
    setLocalQuery('')
    onChange('')
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg border border-white/10 focus-within:border-blue-500 focus-within:bg-white/10 transition">
        <Search className="w-5 h-5 opacity-60" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder || t('collage:picker.searchPlaceholder')}
          className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-50"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="ripple-effect p-1 hover:bg-white/10 rounded transition"
            aria-label={t('collage:picker.clearSearch')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

SearchBar.propTypes = {
  query: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number
}

SearchBar.defaultProps = {
  placeholder: '',
  debounceMs: 300
}

export default SearchBar
