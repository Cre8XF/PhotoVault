import { useCanvas } from '../hooks/useCanvas'
import useEditorStore from '../store/editorStore'
import CropOverlay from '../componentsV4/CropOverlayV4'

/**
 * EditorViewportV4 - Fullscreen canvas viewport
 *
 * SAME canvas rendering logic as V3
 * DIFFERENT layout - fills entire screen (no padding)
 */
export default function EditorViewportV4({ imageUrl }) {
  // Get state from store
  const adjustments = useEditorStore((state) => state.transform.adjustments)
  const filter = useEditorStore((state) => state.transform.filter)
  const crop = useEditorStore((state) => state.transform.crop)
  const rotation = useEditorStore((state) => state.transform.rotation)
  const flipH = useEditorStore((state) => state.transform.flipH)
  const flipV = useEditorStore((state) => state.transform.flipV)
  const activeTool = useEditorStore((state) => state.activeTool)
  const applyTransform = useEditorStore((state) => state.applyTransform)

  // Canvas hook with all transformations (SAME as V3)
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
      <div className="editor-v4-viewport">
        <div className="flex items-center justify-center text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="editor-v4-viewport">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading canvas...</div>
        </div>
      )}

      {/* Wrapper to constrain overlay to canvas size */}
      <div className="editor-v4-canvas-wrapper">
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
