// ============================================================================
// MINIMAL TEST VERSION - AlbumModal (stripped down to find focus issue)
// ============================================================================
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FolderPlus } from 'lucide-react'

const AlbumModal = ({ onClose, onSave, editingAlbum }) => {
  const { t } = useTranslation(['albums'])
  const [name, setName] = useState(editingAlbum?.name || '')
  const [description, setDescription] = useState(editingAlbum?.description || '')
  const [cover, setCover] = useState(editingAlbum?.cover || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      description: description.trim(),
      cover: cover.trim()
    }, editingAlbum)

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          backgroundColor: '#1f2937',
          padding: '32px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: 'white'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
            {editingAlbum ? t('albums:editAlbum') : t('albums:newAlbum')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name Input */}
          <div>
            <label
              htmlFor="album-name-input"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}
            >
              {t('albums:name')} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="album-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('albums:namePlaceholder') || 'Album name...'}
              maxLength={50}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                backgroundColor: '#374151',
                color: 'white',
                outline: 'none'
              }}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {name.length}/50 {t('albums:characters')}
            </p>
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="album-description-input"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}
            >
              {t('albums:description')}
            </label>
            <textarea
              id="album-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('albums:descriptionPlaceholder') || 'Description...'}
              maxLength={200}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                backgroundColor: '#374151',
                color: 'white',
                outline: 'none',
                resize: 'none'
              }}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {description.length}/200 {t('albums:characters')}
            </p>
          </div>

          {/* Cover URL Input */}
          <div>
            <label
              htmlFor="album-cover-input"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}
            >
              {t('albums:coverImage')} (optional)
            </label>
            <input
              id="album-cover-input"
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                backgroundColor: '#374151',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                backgroundColor: '#374151',
                color: '#d1d5db',
                cursor: 'pointer'
              }}
            >
              {t('albums:cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: name.trim()
                  ? 'linear-gradient(to right, #a855f7, #ec4899)'
                  : '#4b5563',
                color: 'white',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: name.trim() ? 1 : 0.5
              }}
            >
              {editingAlbum ? t('albums:saveChanges') : t('albums:createAlbum')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AlbumModal
