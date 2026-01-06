import useEditorStore from '../store/editorStore'
import { useTranslation } from 'react-i18next'

/**
 * Rotate Panel - Rotation and flip controls
 */
export default function RotatePanel() {
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
    <div className="p-4 editor-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="editor-text-primary font-semibold">{t('editor:rotateAndFlip')}</h3>
        {hasChanges && (
          <button
            onClick={handleReset}
            className="text-xs editor-text-muted hover:editor-text-secondary transition-colors"
          >
            {t('common:reset')}
          </button>
        )}
      </div>

      {/* Quick Rotate Buttons */}
      <div className="mb-3">
        <p className="text-sm editor-text-muted mb-3">{t('editor:quickRotate')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRotateCCW}
            className="py-1.5 editor-bg-tertiary editor-bg-tertiary-hover editor-text-primary rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <span className="text-lg">↶</span>
            <span>90° Left</span>
          </button>
          <button
            onClick={handleRotateCW}
            className="py-1.5 editor-bg-tertiary editor-bg-tertiary-hover editor-text-primary rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <span className="text-lg">↷</span>
            <span>90° Right</span>
          </button>
        </div>
      </div>

      {/* Free Rotation Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm editor-text-secondary font-medium">
            Free Rotation
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono editor-text-muted min-w-[3rem] text-right">
              {rotation}°
            </span>
            {rotation !== 0 && (
              <button
                onClick={() => handleFreeRotation(0)}
                className="text-xs editor-text-muted hover:editor-text-secondary transition-colors"
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
          className="w-full max-w-xs h-1 editor-bg-tertiary rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-blue-400
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:bg-blue-400
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
        />

        <div className="flex justify-between text-xs editor-text-muted mt-1">
          <span>-180°</span>
          <span>0°</span>
          <span>+180°</span>
        </div>
      </div>

      {/* Flip Buttons */}
      <div>
        <p className="text-sm editor-text-muted mb-3">Flip</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleFlipH}
            className={`py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation ${
              flipH
                ? 'bg-blue-600 editor-text-primary'
                : 'editor-bg-tertiary editor-text-primary editor-bg-tertiary-hover'
            }`}
          >
            <span className="text-lg">↔</span>
            <span>Horizontal</span>
          </button>
          <button
            onClick={handleFlipV}
            className={`py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation ${
              flipV
                ? 'bg-blue-600 editor-text-primary'
                : 'editor-bg-tertiary editor-text-primary editor-bg-tertiary-hover'
            }`}
          >
            <span className="text-lg">↕</span>
            <span>Vertical</span>
          </button>
        </div>
      </div>

      {/* Current Transform - Compact */}
      {hasChanges && (
        <div className="mt-3 px-3 py-1.5 editor-bg-secondary rounded-lg text-xs editor-text-muted">
          {rotation !== 0 && `${rotation}° `}
          {flipH && `↔ `}
          {flipV && `↕`}
        </div>
      )}
    </div>
  )
}
