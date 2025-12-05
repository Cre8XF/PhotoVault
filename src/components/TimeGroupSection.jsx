import React from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import LazyImage from './LazyImage'

const TimeGroupSection = ({ group, onPhotoClick, onHeaderClick }) => {
  const { t, i18n } = useTranslation(['home'])

  // Use correct label based on current language
  const label = i18n.language === 'en' ? group.labelEN : group.label

  // Show max 20 photos per group
  const displayPhotos = group.photos.slice(0, 20)

  return (
    <div className="time-group-section">
      {/* Header with timeline dot */}
      <div
        className="time-group-header"
        onClick={() => onHeaderClick && onHeaderClick(group)}
      >
        <div className="timeline-dot" />
        <h3 className="time-group-title">
          {label}
        </h3>
        <span className="time-group-count">
          ({group.photos.length})
        </span>
        {onHeaderClick && (
          <ChevronRight className="time-group-arrow" />
        )}
      </div>

      {/* Horizontal scroll grid */}
      <div className="time-group-grid">
        {displayPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="time-group-photo"
            onClick={() => onPhotoClick && onPhotoClick(photo, group.photos)}
            style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
          >
            <LazyImage
              src={photo.thumbnailUrl || photo.url}
              alt={photo.filename || 'Photo'}
              className="time-group-photo-img"
            />
            {/* Video indicator if video */}
            {photo.type === 'video' && (
              <div className="video-indicator">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimeGroupSection
