import useEditorStore from '../store/editorStore'
import { useTranslation } from 'react-i18next'

/**
 * CropOverlayV4 - Crop aspect ratio controls
 *
 * SAME functionality as V3 CropPanel
 * DIFFERENT styling - overlay style
 */
export default function CropOverlayV4() {
  const { t } = useTranslation(['common', 'editor'])
  const transform = useEditorStore((state) => state.transform)
  const applyTransform = useEditorStore((state) => state.applyTransform)
  const resetTransform = useEditorStore((state) => state.resetTransform)

  const crop = transform.crop

  /**
   * Initialize crop if not set
   */
  const initializeCrop = () => {
    if (!crop) {
      // Default: 80% centered crop
      applyTransform('crop', {
        x1: 0.1,
        y1: 0.1,
        x2: 0.9,
        y2: 0.9,
        aspectRatio: null,
      })
    }
  }

  /**
   * Apply aspect ratio preset
   */
  const applyAspectRatio = (ratio, label) => {
    const currentCrop = crop || { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.9 }

    if (ratio === null) {
      // Free crop
      applyTransform('crop', {
        ...currentCrop,
        aspectRatio: null,
      })
      return
    }

    // Calculate new crop with aspect ratio, centered
    const centerX = (currentCrop.x1 + currentCrop.x2) / 2
    const centerY = (currentCrop.y1 + currentCrop.y2) / 2

    let width = currentCrop.x2 - currentCrop.x1
    let height = width / ratio

    // If height exceeds bounds, constrain by height instead
    if (height > 0.8) {
      height = 0.8
      width = height * ratio
    }

    // Center the crop
    let x1 = centerX - width / 2
    let y1 = centerY - height / 2
    let x2 = centerX + width / 2
    let y2 = centerY + height / 2

    // Clamp to bounds
    if (x1 < 0) {
      x1 = 0
      x2 = width
    }
    if (x2 > 1) {
      x2 = 1
      x1 = 1 - width
    }
    if (y1 < 0) {
      y1 = 0
      y2 = height
    }
    if (y2 > 1) {
      y2 = 1
      y1 = 1 - height
    }

    applyTransform('crop', {
      x1,
      y1,
      x2,
      y2,
      aspectRatio: ratio,
    })
  }

  /**
   * Reset crop
   */
  const handleReset = () => {
    resetTransform('crop')
  }

  // Aspect ratio presets
  const aspectRatios = [
    { label: 'Free', ratio: null },
    { label: '1:1', ratio: 1 },
    { label: '4:3', ratio: 4 / 3 },
    { label: '3:4', ratio: 3 / 4 },
    { label: '16:9', ratio: 16 / 9 },
    { label: '9:16', ratio: 9 / 16 },
  ]

  return (
    <div className="editor-v4-overlay">
      {/* Header */}
      <div className="editor-v4-overlay-header">
        <h3>Crop</h3>
        {crop && (
          <button onClick={handleReset}>{t('common:reset')}</button>
        )}
      </div>

      {/* Initialize crop button if not active */}
      {!crop && (
        <button
          onClick={initializeCrop}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-3"
          style={{ fontSize: '16px' }}
        >
          Start Cropping
        </button>
      )}

      {/* Aspect ratio presets */}
      {crop && (
        <>
          <p className="text-sm text-gray-400 mb-3">Aspect Ratio</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {aspectRatios.map((preset) => {
              const isActive = crop.aspectRatio === preset.ratio

              return (
                <button
                  key={preset.label}
                  onClick={() => applyAspectRatio(preset.ratio, preset.label)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  style={{ fontSize: '15px' }}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-400 space-y-1 mt-3 bg-gray-800/50 p-3 rounded-lg">
            <p>• Drag corners to resize crop area</p>
            <p>• Drag center to reposition</p>
            <p>• Select aspect ratio for constrained crop</p>
          </div>
        </>
      )}
    </div>
  )
}
