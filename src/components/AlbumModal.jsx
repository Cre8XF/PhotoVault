// ============================================================================
// MINIMAL TEST VERSION - AlbumModal (stripped down to find focus issue)
// ============================================================================
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FolderPlus } from 'lucide-react'
import Button from './Button'
import './AlbumModal.css'

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
      className="album-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="album-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="album-modal-header">
          <h2 className="album-modal-title">
            <FolderPlus className="album-modal-icon" />
            {editingAlbum ? t('albums:editAlbum') : t('albums:newAlbum')}
          </h2>
          <button
            onClick={onClose}
            className="album-modal-close"
          >
            <X className="album-modal-close-icon" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="album-modal-form">
          {/* Name Input */}
          <div className="album-modal-field">
            <label
              htmlFor="album-name-input"
              className="album-modal-label"
            >
              {t('albums:name')} <span className="album-modal-required">*</span>
            </label>
            <input
              id="album-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('albums:namePlaceholder') || 'Album name...'}
              maxLength={50}
              className="album-modal-input"
            />
            <p className="album-modal-hint">
              {name.length}/50 {t('albums:characters')}
            </p>
          </div>

          {/* Description Input */}
          <div className="album-modal-field">
            <label
              htmlFor="album-description-input"
              className="album-modal-label"
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
              className="album-modal-textarea"
            />
            <p className="album-modal-hint">
              {description.length}/200 {t('albums:characters')}
            </p>
          </div>

          {/* Cover URL Input */}
          <div className="album-modal-field">
            <label
              htmlFor="album-cover-input"
              className="album-modal-label"
            >
              {t('albums:coverImage')} (optional)
            </label>
            <input
              id="album-cover-input"
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://..."
              className="album-modal-input"
            />
          </div>

          {/* Buttons */}
          <div className="album-modal-actions">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
            >
              {t('albums:cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              variant="primary"
              size="md"
            >
              {editingAlbum ? t('albums:saveChanges') : t('albums:createAlbum')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AlbumModal
