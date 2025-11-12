/**
 * Photo Editor - Phase 1: Crop & Rotate
 *
 * RotateTool Component - Rotate image by 90 degrees
 */

import React from 'react'
import { RotateCw, RotateCcw } from 'lucide-react'

const RotateTool = ({ onRotate, rotation = 0 }) => {
  return (
    <div className="rotate-tool bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <RotateCw className="w-4 h-4" />
        Roter bilde
      </h3>

      <div className="space-y-3">
        {/* Rotation Info */}
        <div className="text-center p-2 bg-gray-700/30 rounded-lg">
          <p className="text-sm text-gray-400">Nåværende rotasjon</p>
          <p className="text-lg font-bold">{rotation}°</p>
        </div>

        {/* Rotate Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={onRotate}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <RotateCw className="w-5 h-5" />
            <span>Roter 90° medurs</span>
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          Klikk for å rotere bildet 90° til høyre
        </p>
      </div>
    </div>
  )
}

export default RotateTool
