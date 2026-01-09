import useEditorStore from '../store/editorStore'
import { useTranslation } from 'react-i18next'

/**
 * RotateOverlay - Rotation and flip controls
 *
 * SAME functionality as V3 RotatePanel
 * DIFFERENT styling - overlay style
 */
export default function RotateOverlay() {
  const { t } = useTranslation(['common', 'editor'])
  const transform = useEditorStore((state) => state.transform)
  const applyTransform = useEditorStore((state) => state.applyTransform)

  const rotation = transform.rotation || 0
  const flipH = transform.flipH || false
  const flipV = transform.flipV || false

  /**
   * Rotate 90° clockwise
   */
  const handleRotateCW = () => {
    const newRotation = (rotation + 90) % 360
    applyTransform('rotation', newRotation)
  }

  /**
   * Rotate 90° counterclockwise
   */
  const handleRotateCCW = () => {
    const newRotation = (rotation - 90 + 360) % 360
    applyTransform('rotation', newRotation)
  }

  /**
   * Free rotation slider
   */
  const handleFreeRotation = (value) => {
    applyTransform('rotation', value)
  }

  /**
   * Toggle flip horizontal
   */
  const handleFlipH = () => {
    applyTransform('flipH', !flipH)
  }

  /**
   * Toggle flip vertical
   */
  const handleFlipV = () => {
    applyTransform('flipV', !flipV)
  }

  /**
   * Reset all rotation and flip
   */
  const handleReset = () => {
    applyTransform('rotation', 0)
    applyTransform('flipH', false)
    applyTransform('flipV', false)
  }

  // Check if any rotation/flip is active
  const hasChanges = rotation !== 0 || flipH || flipV

  return (
    <div className="editor-v4-overlay">
      {/* Header */}
      <div className="editor-v4-overlay-header">
        <h3>{t('editor:rotateAndFlip')}</h3>
        {hasChanges && (
          <button onClick={handleReset}>{t('common:reset')}</button>
        )}
      </div>

      {/* Quick Rotate Buttons */}
      <div className="mb-3">
        <p className="text-sm text-gray-400 mb-2">{t('editor:quickRotate')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRotateCCW}
            className="py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{ fontSize: '15px' }}
          >
            <span className="text-lg">↶</span>
            <span>90° Left</span>
          </button>
          <button
            onClick={handleRotateCW}
            className="py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{ fontSize: '15px' }}
          >
            <span className="text-lg">↷</span>
            <span>90° Right</span>
          </button>
        </div>
      </div>

      {/* Free Rotation Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-300 font-medium">
            Free Rotation
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-400 min-w-[3rem] text-right">
              {rotation}°
            </span>
            {rotation !== 0 && (
              <button
                onClick={() => handleFreeRotation(0)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
                title="Reset to 0"
              >
                ↺
              </button>
            )}
          </div>
        </div>

        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation}
          onChange={(e) => handleFreeRotation(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:bg-blue-400
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:bg-blue-400
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
        />

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-180°</span>
          <span>0°</span>
          <span>+180°</span>
        </div>
      </div>

      {/* Flip Buttons */}
      <div className="mb-2">
        <p className="text-sm text-gray-400 mb-2">Flip</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleFlipH}
            className={`py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              flipH
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            style={{ fontSize: '15px' }}
          >
            <span className="text-lg">↔</span>
            <span>Horizontal</span>
          </button>
          <button
            onClick={handleFlipV}
            className={`py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              flipV
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            style={{ fontSize: '15px' }}
          >
            <span className="text-lg">↕</span>
            <span>Vertical</span>
          </button>
        </div>
      </div>

      {/* Current Transform - Compact */}
      {hasChanges && (
        <div className="mt-3 px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-400">
          {rotation !== 0 && `${rotation}° `}
          {flipH && `↔ `}
          {flipV && `↕`}
        </div>
      )}
    </div>
  )
}
