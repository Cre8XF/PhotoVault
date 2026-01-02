import { useState, useEffect, useMemo } from 'react'

/**
 * CollagePreview
 * Renders preview of a collage based on resolved photos + layout
 */
export default function CollagePreview({
  photos = [],
  layout,
  aspectRatio = '1 / 1',
}) {
  const [previewPhotos, setPreviewPhotos] = useState([])

  /**
   * Prepare preview photos when photos change
   */
  useEffect(() => {
    if (!photos || photos.length === 0) {
      setPreviewPhotos([])
      return
    }

    // Ensure stable order and max slots
    const prepared = photos.slice(0, layout?.slots?.length || photos.length)
    setPreviewPhotos(prepared)
  }, [photos, layout?.slots?.length])

  /**
   * Memoized grid style (MUST be top-level)
   */
  const gridStyle = useMemo(() => {
    // Parse grid template (format: "repeat(N, 1fr) / repeat(M, 1fr)")
    const gridTemplate = layout?.grid?.desktop || 'repeat(2, 1fr) / repeat(2, 1fr)'
    const gridParts = gridTemplate.split(' / ')
    const rows = gridParts[0] || 'repeat(2, 1fr)'
    const cols = gridParts[1] || gridParts[0] || 'repeat(2, 1fr)'

    return {
      display: 'grid',
      gridTemplateRows: rows,
      gridTemplateColumns: cols,
      gap: `${layout?.gap ?? 8}px`,
      aspectRatio,
      width: '100%',
      height: '100%',
    }
  }, [layout?.grid?.desktop, layout?.gap, aspectRatio])

  if (!previewPhotos || previewPhotos.length === 0) {
    return null
  }

  return (
    <div className="collage-preview" style={gridStyle}>
      {previewPhotos.map((photo, index) => {
        // Get slot data for grid positioning (slots use 1-based indexing, same as CSS Grid)
        const slot = layout?.slots?.[index]

        return (
          <div
            key={photo.id || index}
            className="collage-preview-slot"
            style={{
              // Grid positioning - slots use 1-based indexing matching CSS Grid
              gridColumn: slot ? `${slot.col} / span ${slot.colSpan}` : 'auto',
              gridRow: slot ? `${slot.row} / span ${slot.rowSpan}` : 'auto',
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              borderRadius: '12px',
              background: '#000',
            }}
          >
            <img
              src={photo.url || photo.previewUrl}
              alt=""
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // ← trygg default
                objectPosition: 'center',
                display: 'block',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
