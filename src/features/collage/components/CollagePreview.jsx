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
    return {
      display: 'grid',
      gridTemplateColumns: layout?.grid?.desktop || 'repeat(2, 1fr)',
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
      {previewPhotos.map((photo, index) => (
        <div
          key={photo.id || index}
          className="collage-preview-slot"
          style={{
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
      ))}
    </div>
  )
}
