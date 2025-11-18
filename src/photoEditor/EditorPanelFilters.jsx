/**
 * EditorPanelFilters.jsx
 * Filter presets with preview (long-press for before/after)
 */
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const EditorPanelFilters = ({ currentFilter, onFilterChange }) => {
  const { t } = useTranslation(['editor'])
  const [isShowingBefore, setIsShowingBefore] = useState(false)
  const longPressTimerRef = useRef(null)

  const filters = [
    { id: 'none', label: t('editor:filters.original'), preview: '🌅' },
    { id: 'warm', label: t('editor:filters.warm'), preview: '🔥' },
    { id: 'cool', label: t('editor:filters.cool'), preview: '❄️' },
    { id: 'vintage', label: t('editor:filters.vintage'), preview: '📷' },
    { id: 'contrast', label: t('editor:filters.contrast'), preview: '⚡' },
    { id: 'fade', label: t('editor:filters.fade'), preview: '🌫️' },
    { id: 'bw', label: t('editor:filters.blackWhite'), preview: '⚫' },
  ]

  const handleFilterClick = (filterId) => {
    onFilterChange({ type: filterId })
  }

  // Long press handlers for before/after preview
  const handlePressStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsShowingBefore(true)
      // Temporarily show original
      onFilterChange({ type: 'none', temporary: true })
    }, 500)
  }

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    if (isShowingBefore) {
      // Restore current filter
      onFilterChange({ type: currentFilter?.type || 'none' })
      setIsShowingBefore(false)
    }
  }

  return (
    <div className="editor-panel">
      <div className="editor-panel-header">
        <h3 className="editor-panel-title">{t('editor:filters.title')}</h3>
        <p className="editor-panel-subtitle">{t('editor:filters.subtitle')}</p>
      </div>

      {/* Filter Grid */}
      <div className="editor-panel-section">
        <div className="editor-filter-grid">
          {filters.map((filter) => {
            const isActive = currentFilter?.type === filter.id

            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`editor-filter-btn ${isActive ? 'active' : ''}`}
              >
                <div className="editor-filter-preview">{filter.preview}</div>
                <span className="editor-filter-label">{filter.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Long Press Hint */}
      <div className="editor-panel-section">
        <div
          className="editor-hint-box"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          <p className="editor-hint-text">
            {isShowingBefore
              ? t('editor:filters.showingBefore')
              : t('editor:filters.longPressHint')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EditorPanelFilters
