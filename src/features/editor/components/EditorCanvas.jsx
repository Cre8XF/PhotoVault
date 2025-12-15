import { useCanvas } from '../hooks/useCanvas'
import useEditorStore from '../store/editorStore'
import CropOverlay from './CropOverlay'

/**
 * Canvas component for editor
 * NOW CONNECTED TO ADJUSTMENTS AND CROP OVERLAY
 *
 * @param {string} imageUrl - URL of image to display
 */
export default function EditorCanvas({ imageUrl }) {
  // Get adjustments and crop from store
  const adjustments = useEditorStore((state) => state.transform.adjustments)
  const crop = useEditorStore((state) => state.transform.crop)
  const activeTool = useEditorStore((state) => state.activeTool)
  const applyTransform = useEditorStore((state) => state.applyTransform)

  // Pass adjustments to canvas hook
  const { canvasRef, containerRef, isLoading, error, dimensions } = useCanvas(
    imageUrl,
    adjustments
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
    <div ref={containerRef} className="flex-1 relative bg-[#0a0a0a]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading canvas...</div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 m-auto"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />

      {/* Crop overlay when crop tool is active */}
      {activeTool === 'crop' && crop && (
        <CropOverlay
          crop={crop}
          onChange={handleCropChange}
          containerDimensions={dimensions}
        />
      )}
    </div>
  )
}
