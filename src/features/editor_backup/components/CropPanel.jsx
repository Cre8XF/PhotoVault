/**
 * Photo Editor V2 - CropPanel Component
 *
 * Crop and Rotate controls with live preview
 * Combines functionality from CropTool and RotateTool
 */

import React, { useState, useEffect } from 'react'
import { Crop, RotateCw, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCropAreaForRatio } from '../utils/cropUtils'

const CropPanel = ({ dimensions, onCropChange, onCropApply, onRotate, rotation }) => {
  const { t } = useTranslation(['editor'])
  const [aspectRatio, setAspectRatio] = useState('free')
  const [cropArea, setCropArea] = useState(null)

  const { width: canvasWidth, height: canvasHeight } = dimensions

  // Initialize crop area
  useEffect(() => {
    if (canvasWidth && canvasHeight) {
      const initialCrop = getCropAreaForRatio(canvasWidth, canvasHeight, aspectRatio)
      setCropArea(initialCrop)
      onCropChange(initialCrop)
      console.log('📐 Initial crop area:', initialCrop)
    }
  }, [canvasWidth, canvasHeight, aspectRatio, onCropChange])

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio)
    const newCrop = getCropAreaForRatio(canvasWidth, canvasHeight, ratio)
    setCropArea(newCrop)
    onCropChange(newCrop)
    console.log(`📐 Changed aspect ratio to ${ratio}:`, newCrop)
  }

  const handleApply = () => {
    if (cropArea && onCropApply) {
      console.log('✂️ Applying crop:', cropArea)
      onCropApply(cropArea)
    }
  }

  const handleCancel = () => {
    // Reset to free aspect ratio
    const defaultCrop = getCropAreaForRatio(canvasWidth, canvasHeight, 'free')
    setAspectRatio('free')
    setCropArea(defaultCrop)
    onCropChange(null)
  }

  if (!cropArea) {
    return (
      <div className="text-center py-4 text-gray-400">
        {t('editor:loading.processing')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crop className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-sm">{t('editor:crop.title')}</h3>
        </div>

        {/* Rotate button */}
        <button
          onClick={onRotate}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition touch-target"
          title={t('editor:rotate.rotate90')}
        >
          <RotateCw className="w-4 h-4" />
          <span className="text-xs font-medium">
            {rotation}°
          </span>
        </button>
      </div>

      {/* Aspect Ratio Selector */}
      <div>
        <label className="text-xs text-gray-400 mb-2 block font-medium">
          {t('editor:crop.aspectRatio')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleAspectRatioChange('free')}
            className={`
              min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition touch-target
              ${aspectRatio === 'free'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }
            `}
          >
            {t('editor:crop.free')}
          </button>
          <button
            onClick={() => handleAspectRatioChange('1:1')}
            className={`
              min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition touch-target
              ${aspectRatio === '1:1'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }
            `}
          >
            1:1
          </button>
          <button
            onClick={() => handleAspectRatioChange('4:3')}
            className={`
              min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition touch-target
              ${aspectRatio === '4:3'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }
            `}
          >
            4:3
          </button>
          <button
            onClick={() => handleAspectRatioChange('16:9')}
            className={`
              min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition touch-target
              ${aspectRatio === '16:9'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }
            `}
          >
            16:9
          </button>
        </div>
      </div>

      {/* Crop Info */}
      <div className="p-3 bg-white/5 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">{t('editor:crop.selectedArea')}</p>
        <p className="text-sm font-mono text-white">
          {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 min-h-[44px] px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition flex items-center justify-center gap-2 touch-target"
        >
          <Check className="w-5 h-5" />
          <span>{t('editor:buttons.apply')}</span>
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 min-h-[44px] px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition flex items-center justify-center gap-2 touch-target"
        >
          <X className="w-5 h-5" />
          <span>{t('editor:buttons.cancel')}</span>
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        {t('editor:crop.help')}
      </p>
    </div>
  )
}

export default CropPanel
