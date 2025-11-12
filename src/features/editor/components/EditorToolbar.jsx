/**
 * Photo Editor - Phase 1: Crop & Rotate
 *
 * EditorToolbar Component - Tool selection toolbar
 */

import React from 'react'
import { Crop, RotateCw, Undo2 } from 'lucide-react'

const EditorToolbar = ({ activeTool, onToolChange, onReset }) => {
  const tools = [
    { id: 'crop', label: 'Beskjær', icon: Crop },
    { id: 'rotate', label: 'Roter', icon: RotateCw }
  ]

  return (
    <div className="editor-toolbar bg-gray-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
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
          <span className="text-sm font-medium hidden sm:inline">Tilbakestill</span>
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar
