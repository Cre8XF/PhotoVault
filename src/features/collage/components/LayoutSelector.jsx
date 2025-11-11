import React from 'react'
import { Grid, Image } from 'lucide-react'

/**
 * Layout selector component - displays grid of available layouts
 */
const LayoutSelector = ({ layouts, selectedLayout, onSelect }) => {
  return (
    <div className="layout-selector">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Grid className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold">Velg layout</h3>
        </div>
        <p className="text-sm opacity-70">
          Velg hvordan du vil arrangere bildene dine
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout)}
            className={`
              relative group overflow-hidden rounded-xl p-4 transition-all
              ${
                selectedLayout?.id === layout.id
                  ? 'bg-purple-600/30 border-2 border-purple-400'
                  : 'glass-card border border-white/10 hover:border-purple-400/50'
              }
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-left">
                <h4 className="font-medium">{layout.name}</h4>
                <p className="text-xs opacity-70">{layout.slots} bilder</p>
              </div>
              {selectedLayout?.id === layout.id && (
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Layout preview */}
            <div className="relative bg-gray-800/50 rounded-lg overflow-hidden" style={{ aspectRatio: '2/1' }}>
              <LayoutThumbnail layout={layout} />
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Mini canvas preview of layout structure
 */
const LayoutThumbnail = ({ layout }) => {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas size
    const scale = 0.15 // Scale down for thumbnail
    canvas.width = layout.canvas.width * scale
    canvas.height = layout.canvas.height * scale

    // Clear background
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw layout slots
    layout.positions.forEach((pos, index) => {
      const x = pos.x * scale
      const y = pos.y * scale
      const w = pos.w * scale
      const h = pos.h * scale

      // Slot background
      ctx.fillStyle = '#374151'
      ctx.fillRect(x, y, w, h)

      // Slot border
      ctx.strokeStyle = '#4b5563'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, w, h)

      // Slot number
      ctx.fillStyle = '#9ca3af'
      ctx.font = `${Math.min(w, h) / 3}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${index + 1}`, x + w / 2, y + h / 2)
    })
  }, [layout])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
    />
  )
}

export default LayoutSelector
