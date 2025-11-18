/**
 * EditorTabs.jsx
 * Tool selection tabs (Crop, Rotate, Filters, Text, Adjust)
 */
import React from 'react'
import { Crop, RotateCw, Palette, Type, Sliders } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EditorTabs = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation(['editor'])

  const tabs = [
    { id: 'crop', label: t('editor:toolbar.crop'), icon: Crop },
    { id: 'rotate', label: t('editor:toolbar.rotate'), icon: RotateCw },
    { id: 'filters', label: t('editor:toolbar.filters'), icon: Palette },
    { id: 'text', label: t('editor:toolbar.text'), icon: Type },
    { id: 'adjust', label: t('editor:toolbar.adjust'), icon: Sliders },
  ]

  return (
    <div className="editor-tabs">
      <div className="editor-tabs-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`editor-tab ${isActive ? 'editor-tab-active' : ''}`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <Icon className="editor-tab-icon" />
              <span className="editor-tab-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EditorTabs
