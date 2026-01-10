import { useCanvas } from '../hooks/useCanvas'
import useEditorStore from '../store/editorStore'
import CropOverlay from './CropOverlay'

/**
 * Canvas component for editor
 * NOW WITH FILTER PRESETS
 *
 * @param {string} imageUrl - URL of image to display
 */
export default function EditorCanvas({ imageUrl }) {
  // Get state from store
  const adjustments = useEditorStore((state) => state.transform.adjustments)
  const filter = useEditorStore((state) => state.transform.filter)
  const crop = useEditorStore((state) => state.transform.crop)
  const rotation = useEditorStore((state) => state.transform.rotation)
  const flipH = useEditorStore((state) => state.transform.flipH)
  const flipV = useEditorStore((state) => state.transform.flipV)
  const activeTool = useEditorStore((state) => state.activeTool)
  const applyTransform = useEditorStore((state) => state.applyTransform)

  // Canvas hook with all transformations
  const { canvasRef, containerRef, isLoading, error, dimensions } = useCanvas(
    imageUrl,
    adjustments,
    filter,
    rotation,
    flipH,
    flipV
  )

  /**
   * Handle crop changes from overlay
   */
  const handleCropChange = (newCrop) => {
    applyTransform('crop', newCrop)
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="editor-viewport">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading canvas...</div>
        </div>
      )}

      {/* Wrapper to constrain overlay to canvas size */}
      <div className="relative" style={{ display: 'inline-block' }}>
        <canvas ref={canvasRef} />

        {/* Crop overlay when crop tool is active */}
        {activeTool === 'crop' && crop && (
          <CropOverlay
            crop={crop}
            onChange={handleCropChange}
            containerDimensions={dimensions}
          />
        )}
      </div>
    </div>
  )
}
