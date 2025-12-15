import { useCanvas } from '../hooks/useCanvas'

/**
 * Canvas component for editor
 * Handles image rendering with proper sizing and scaling
 *
 * @param {string} imageUrl - URL of image to display
 */
export default function EditorCanvas({ imageUrl }) {
  const { canvasRef, containerRef, isLoading, error } = useCanvas(imageUrl)

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
    </div>
  )
}
