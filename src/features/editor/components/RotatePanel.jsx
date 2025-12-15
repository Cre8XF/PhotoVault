import useEditorStore from '../store/editorStore'

/**
 * Rotate Panel - Rotation and flip controls
 */
export default function RotatePanel() {
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
    <div className="p-4 bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Rotate & Flip</h3>
        {hasChanges && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Quick Rotate Buttons */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Quick Rotate</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRotateCCW}
            className="py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <span className="text-xl">↶</span>
            <span>90° Left</span>
          </button>
          <button
            onClick={handleRotateCW}
            className="py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <span className="text-xl">↷</span>
            <span>90° Right</span>
          </button>
        </div>
      </div>

      {/* Free Rotation Slider */}
      <div className="mb-6">
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
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
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
          className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer
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

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-180°</span>
          <span>0°</span>
          <span>+180°</span>
        </div>
      </div>

      {/* Flip Buttons */}
      <div>
        <p className="text-sm text-gray-400 mb-3">Flip</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleFlipH}
            className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation ${
              flipH
                ? 'bg-blue-600 text-white'
                : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
            }`}
          >
            <span className="text-xl">↔</span>
            <span>Horizontal</span>
          </button>
          <button
            onClick={handleFlipV}
            className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation ${
              flipV
                ? 'bg-blue-600 text-white'
                : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
            }`}
          >
            <span className="text-xl">↕</span>
            <span>Vertical</span>
          </button>
        </div>
      </div>

      {/* Current Transform - Compact */}
      {hasChanges && (
        <div className="mt-3 px-3 py-2 bg-[#1a1a1a] rounded-lg text-xs text-gray-400">
          {rotation !== 0 && `${rotation}° `}
          {flipH && `↔ `}
          {flipV && `↕`}
        </div>
      )}
    </div>
  )
}
