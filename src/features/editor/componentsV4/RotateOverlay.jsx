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
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{t('editor:quickRotate')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRotateCCW}
            className="py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            style={{
              fontSize: '15px',
              backgroundColor: 'var(--bg-editor-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-editor-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-editor-elevated)'}
          >
            <span className="text-lg">↶</span>
            <span>90° Left</span>
          </button>
          <button
            onClick={handleRotateCW}
            className="py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            style={{
              fontSize: '15px',
              backgroundColor: 'var(--bg-editor-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-editor-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-editor-elevated)'}
          >
            <span className="text-lg">↷</span>
            <span>90° Right</span>
          </button>
        </div>
      </div>

      {/* Free Rotation Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Free Rotation
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono min-w-[3rem] text-right" style={{ color: 'var(--text-muted)' }}>
              {rotation}°
            </span>
            {rotation !== 0 && (
              <button
                onClick={() => handleFreeRotation(0)}
                className="text-xs transition-colors"
                style={{ color: 'var(--text-muted)', minHeight: '44px' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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
          style={{
            width: '100%',
            height: '8px',
            background: 'var(--bg-editor-elevated)',
            borderRadius: '8px',
            appearance: 'none',
            cursor: 'pointer'
          }}
        />

        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          <span>-180°</span>
          <span>0°</span>
          <span>+180°</span>
        </div>
      </div>

      {/* Flip Buttons */}
      <div className="mb-2">
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Flip</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleFlipH}
            className="py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            style={{
              fontSize: '15px',
              backgroundColor: flipH ? 'var(--color-primary-500)' : 'var(--bg-editor-elevated)',
              color: 'var(--text-primary)',
              border: `1px solid ${flipH ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              if (!flipH) e.currentTarget.style.backgroundColor = 'var(--bg-editor-hover)'
            }}
            onMouseLeave={(e) => {
              if (!flipH) e.currentTarget.style.backgroundColor = 'var(--bg-editor-elevated)'
            }}
          >
            <span className="text-lg">↔</span>
            <span>Horizontal</span>
          </button>
          <button
            onClick={handleFlipV}
            className="py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            style={{
              fontSize: '15px',
              backgroundColor: flipV ? 'var(--color-primary-500)' : 'var(--bg-editor-elevated)',
              color: 'var(--text-primary)',
              border: `1px solid ${flipV ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              if (!flipV) e.currentTarget.style.backgroundColor = 'var(--bg-editor-hover)'
            }}
            onMouseLeave={(e) => {
              if (!flipV) e.currentTarget.style.backgroundColor = 'var(--bg-editor-elevated)'
            }}
          >
            <span className="text-lg">↕</span>
            <span>Vertical</span>
          </button>
        </div>
      </div>

      {/* Current Transform - Compact */}
      {hasChanges && (
        <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{
          backgroundColor: 'var(--bg-editor-elevated)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)'
        }}>
          {rotation !== 0 && `${rotation}° `}
          {flipH && `↔ `}
          {flipV && `↕`}
        </div>
      )}
    </div>
  )
}
