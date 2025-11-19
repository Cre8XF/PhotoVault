/**
 * Photo Editor - Phase 1: Crop & Rotate
 *
 * RotateTool Component - Rotate image by 90 degrees
 */

import React from 'react'
import { RotateCw, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const RotateTool = ({ onRotate, rotation = 0 }) => {
  const { t } = useTranslation(['editor'])

  return (
    <div className="rotate-tool bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <RotateCw className="w-4 h-4" />
        {t('editor:rotate.title')}
      </h3>

      <div className="space-y-3">
        {/* Rotation Info */}
        <div className="text-center p-2 bg-gray-700/30 rounded-lg">
          <p className="text-sm text-gray-400">{t('editor:rotate.currentRotation')}</p>
          <p className="text-lg font-bold">{rotation}°</p>
        </div>

        {/* Rotate Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={onRotate}
            className="w-full min-h-[44px] px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition flex items-center justify-center gap-2 touch-target"
          >
            <RotateCw className="w-5 h-5" />
            <span>{t('editor:rotate.rotate90')}</span>
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          {t('editor:rotate.help')}
        </p>
      </div>
    </div>
  )
}

export default RotateTool
