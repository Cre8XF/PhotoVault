// ============================================================================
// COMPONENT: AlbumCard.jsx – Twilight Theme med 3D Tilt Effect og cover-støtte
// Phase 2: Optimized with React.memo
// Phase 3: i18n support added
// Phase 4: XSS Protection added
// ============================================================================
import React, { useState, memo } from 'react'
import { Edit3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sanitizeImageUrl, PLACEHOLDER_ALBUM } from '../utils/security'

const AlbumCard = memo(
  ({ album, photos = [], onOpen, onEdit }) => {
    const { t } = useTranslation(['common'])
    const [tilt, setTilt] = useState({ x: 0, y: 0 })

    // Prioriter album.cover, ellers bruk første bilde i albumet (handle video thumbnails)
    const safePhotos = Array.isArray(photos) ? photos : [];
    const firstPhoto = safePhotos.find((p) => p.albumId === album.id)
    const fallbackUrl = firstPhoto?.type === 'video'
      ? (firstPhoto.thumbnailUrl || firstPhoto.url)
      : firstPhoto?.url
    const coverUrl = album.cover || fallbackUrl || ''

    const count = safePhotos.filter((p) => p.albumId === album.id).length

    let updatedStr = ''
    const updatedAt = album.updatedAt || album.createdAt
    if (updatedAt) {
      const d = new Date(updatedAt)
      if (!isNaN(d.getTime())) {
        updatedStr = d.toLocaleDateString('no-NO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      }
    }

    // 3D Tilt effect on mouse move
    const handleMouseMove = (e) => {
      const card = e.currentTarget
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -10
      const rotateY = ((x - centerX) / centerX) * 10

      setTilt({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 })
    }

    return (
      <div
        className="relative ripple-effect card-press album-card glass cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded-xl"
        onClick={() => onOpen && onOpen(album)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen && onOpen(album)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open ${album.name || 'album'} - ${count} ${count === 1 ? 'photo' : 'photos'}`}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition:
            tilt.x === 0
              ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'none',
        }}
      >
        {coverUrl ? (
          <div className="photo-container-enhanced relative aspect-[16/9] w-full flex items-center justify-center">
            <img
              src={sanitizeImageUrl(coverUrl, PLACEHOLDER_ALBUM)}
              alt={album.name || 'Album'}
              onError={(e) => {
                console.error('❌ Failed to load album cover:', coverUrl)
                e.target.src = PLACEHOLDER_ALBUM
              }}
              className="max-h-full max-w-full object-contain rounded-xl"
              loading="lazy"
            />

            {/* 🔹 Redigeringsknapp (vises ved hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onEdit) onEdit(album)
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-2 bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95 rounded-lg transition-all duration-150 ripple-effect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
              title={t('common:albumCard.editAlbum')}
              aria-label={`Edit ${album.name || 'album'}`}
            >
              <Edit3 size={16} />
            </button>
          </div>
        ) : (
          <div className="album-thumb flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-900 to-indigo-900 aspect-[16/9] rounded-xl">
            <svg
              className="w-16 h-16 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <div className="album-meta mt-2 px-1">
          <div className="album-title font-semibold truncate">
            {typeof album.name === 'object'
              ? album.name.name || JSON.stringify(album.name)
              : album.name || t('common:noName')}
          </div>

          <div
            className="album-sub text-sm text-gray-300 opacity-80 truncate px-1 pb-1 rounded-b-xl"
            style={{ lineHeight: '1.3' }}
          >
            {t('common:photoCount', { count })}
            {updatedStr ? ' · ' + updatedStr : ''}
          </div>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.album.id === nextProps.album.id &&
      prevProps.album.name === nextProps.album.name &&
      prevProps.album.cover === nextProps.album.cover &&
      prevProps.album.updatedAt === nextProps.album.updatedAt &&
      prevProps.photos.length === nextProps.photos.length
    )
  }
)

AlbumCard.displayName = 'AlbumCard'
export default AlbumCard
