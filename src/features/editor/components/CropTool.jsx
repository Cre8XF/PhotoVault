/**
 * Photo Editor - Phase 1: Crop & Rotate
 *
 * CropTool Component - Interactive crop area selection
 */

import React, { useState, useEffect } from 'react'
import { Crop, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCropAreaForRatio, constrainCropArea } from '../utils/cropUtils'

const CropTool = ({ canvasDimensions, onCropApply, onCancel }) => {
  const { t } = useTranslation(['editor'])
  const [aspectRatio, setAspectRatio] = useState('free')
  const [cropArea, setCropArea] = useState(null)

  const { width: canvasWidth, height: canvasHeight } = canvasDimensions

  // Initialize crop area
  useEffect(() => {
    if (canvasWidth && canvasHeight) {
      const initialCrop = getCropAreaForRatio(canvasWidth, canvasHeight, aspectRatio)
      setCropArea(initialCrop)
      console.log('📐 Initial crop area:', initialCrop)
    }
  }, [canvasWidth, canvasHeight, aspectRatio])

  const handleApplyCrop = () => {
    if (cropArea && onCropApply) {
      console.log('✂️ Applying crop:', cropArea)
      onCropApply(cropArea)
    }
  }

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio)
    const newCrop = getCropAreaForRatio(canvasWidth, canvasHeight, ratio)
    setCropArea(newCrop)
    console.log(`📐 Changed aspect ratio to ${ratio}:`, newCrop)
  }

  if (!cropArea) {
    return <div className="crop-tool p-4">{t('editor:loading.processing')}</div>
  }

  return (
    <div className="crop-tool bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Crop className="w-4 h-4" />
        {t('editor:crop.title')}
      </h3>

      <div className="space-y-3">
        {/* Aspect Ratio Selector */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">{t('editor:crop.aspectRatio')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAspectRatioChange('free')}
              className={`min-h-[44px] min-w-[44px] px-4 py-3 rounded-lg text-sm transition touch-target ${
                aspectRatio === 'free'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              {t('editor:crop.free')}
            </button>
            <button
              onClick={() => handleAspectRatioChange('1:1')}
              className={`min-h-[44px] min-w-[44px] px-4 py-3 rounded-lg text-sm transition touch-target ${
                aspectRatio === '1:1'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              1:1
            </button>
            <button
              onClick={() => handleAspectRatioChange('4:3')}
              className={`min-h-[44px] min-w-[44px] px-4 py-3 rounded-lg text-sm transition touch-target ${
                aspectRatio === '4:3'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              4:3
            </button>
            <button
              onClick={() => handleAspectRatioChange('16:9')}
              className={`min-h-[44px] min-w-[44px] px-4 py-3 rounded-lg text-sm transition touch-target ${
                aspectRatio === '16:9'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              16:9
            </button>
          </div>
        </div>

        {/* Crop Info */}
        <div className="p-2 bg-gray-700/30 rounded-lg">
          <p className="text-xs text-gray-400">{t('editor:crop.selectedArea')}</p>
          <p className="text-sm font-mono">
            {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApplyCrop}
            className="flex-1 min-h-[44px] px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition flex items-center justify-center gap-2 touch-target"
          >
            <Check className="w-5 h-5" />
            <span>{t('editor:buttons.apply')}</span>
          </button>
          <button
            onClick={onCancel}
            className="flex-1 min-h-[44px] px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2 touch-target"
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

      {/* Hidden crop overlay data - to be used by PhotoEditor */}
      <div style={{ display: 'none' }} data-crop-area={JSON.stringify(cropArea)} />
    </div>
  )
}

export default CropTool
