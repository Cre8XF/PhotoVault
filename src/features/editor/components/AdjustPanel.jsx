import useEditorStore from '../store/editorStore'
import Slider from './Slider'

/**
 * Adjust Panel - Brightness, contrast, saturation, etc.
 */
export default function AdjustPanel() {
  const transform = useEditorStore((state) => state.transform)
  const applyTransform = useEditorStore((state) => state.applyTransform)
  const resetTransform = useEditorStore((state) => state.resetTransform)

  const adjustments = transform.adjustments

  /**
   * Handle adjustment change
   */
  const handleChange = (key, value) => {
    applyTransform('adjustments', {
      ...adjustments,
      [key]: value,
    })
  }

  /**
   * Reset single adjustment
   */
  const handleResetAdjustment = (key) => {
    applyTransform('adjustments', {
      ...adjustments,
      [key]: 0,
    })
  }

  /**
   * Reset all adjustments
   */
  const handleResetAll = () => {
    resetTransform('adjustments')
  }

  // Check if any adjustments are active
  const hasAdjustments = Object.values(adjustments).some((v) => v !== 0)

  return (
    <div className="p-3 md:p-4 bg-[#0a0a0a] overflow-y-auto max-h-[45vh]">
      {/* Header with reset all button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Adjustments</h3>
        {hasAdjustments && (
          <button
            onClick={handleResetAll}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Sliders */}
      <Slider
        label="Brightness"
        value={adjustments.brightness}
        min={-100}
        max={100}
        onChange={(v) => handleChange('brightness', v)}
        onReset={() => handleResetAdjustment('brightness')}
      />

      <Slider
        label="Contrast"
        value={adjustments.contrast}
        min={-100}
        max={100}
        onChange={(v) => handleChange('contrast', v)}
        onReset={() => handleResetAdjustment('contrast')}
      />

      <Slider
        label="Saturation"
        value={adjustments.saturation}
        min={-100}
        max={100}
        onChange={(v) => handleChange('saturation', v)}
        onReset={() => handleResetAdjustment('saturation')}
      />

      <Slider
        label="Temperature"
        value={adjustments.temperature}
        min={-100}
        max={100}
        onChange={(v) => handleChange('temperature', v)}
        onReset={() => handleResetAdjustment('temperature')}
      />

      <Slider
        label="Tint"
        value={adjustments.tint}
        min={-100}
        max={100}
        onChange={(v) => handleChange('tint', v)}
        onReset={() => handleResetAdjustment('tint')}
      />

      <Slider
        label="Highlights"
        value={adjustments.highlights}
        min={-100}
        max={100}
        onChange={(v) => handleChange('highlights', v)}
        onReset={() => handleResetAdjustment('highlights')}
      />

      <Slider
        label="Shadows"
        value={adjustments.shadows}
        min={-100}
        max={100}
        onChange={(v) => handleChange('shadows', v)}
        onReset={() => handleResetAdjustment('shadows')}
      />

      <Slider
        label="Sharpness"
        value={adjustments.sharpness}
        min={0}
        max={100}
        onChange={(v) => handleChange('sharpness', v)}
        onReset={() => handleResetAdjustment('sharpness')}
      />

      <Slider
        label="Vignette"
        value={adjustments.vignette}
        min={0}
        max={100}
        onChange={(v) => handleChange('vignette', v)}
        onReset={() => handleResetAdjustment('vignette')}
      />
    </div>
  )
}
