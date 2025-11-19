/**
 * Photo Editor - Phase 1, 2 & 3: Crop, Rotate, Filters & Text
 *
 * EditorToolbar Component - Tool selection toolbar
 */

import React from 'react'
import { Crop, RotateCw, Palette, Type, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EditorToolbar = ({ activeTool, onToolChange, onReset }) => {
  const { t } = useTranslation(['editor'])

  const tools = [
    { id: 'crop', label: t('editor:toolbar.crop'), icon: Crop },
    { id: 'rotate', label: t('editor:toolbar.rotate'), icon: RotateCw },
    { id: 'filters', label: t('editor:toolbar.filters'), icon: Palette },
    { id: 'text', label: t('editor:toolbar.text'), icon: Type }
  ]

  return (
    <div className="bg-transparent px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Tool Buttons */}
        <div className="flex gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id

            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{tool.label}</span>
              </button>
            )
          })}
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
        >
          <Undo2 className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{t('editor:buttons.reset')}</span>
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar
