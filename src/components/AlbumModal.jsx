// ============================================================================
// MINIMAL TEST VERSION - AlbumModal (stripped down to find focus issue)
// ============================================================================
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FolderPlus } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { getValidationError, ERROR_MESSAGES } from '../utils/errorMessages'
import './AlbumModal.css'

const AlbumModal = ({ onClose, onSave, editingAlbum }) => {
  const { t } = useTranslation(['albums'])
  const [name, setName] = useState(editingAlbum?.name || '')
  const [description, setDescription] = useState(editingAlbum?.description || '')
  const [cover, setCover] = useState(editingAlbum?.cover || '')
  const [touched, setTouched] = useState({ name: false, description: false, cover: false })

  // Validation errors
  const nameError = touched.name ? getValidationError('name', name, { required: true, maxLength: 50 }) : null
  const descriptionError = touched.description ? getValidationError('description', description, { maxLength: 200 }) : null
  const coverError = touched.cover && cover.trim() ? getValidationError('url', cover) : null

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
          <Input
            id="album-name-input"
            label={t('albums:name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched({ ...touched, name: true })}
            placeholder={t('albums:namePlaceholder') || 'Album name...'}
            maxLength={50}
            showCharacterCount
            required
            error={nameError}
          />

          {/* Description Input */}
          <Input
            id="album-description-input"
            label={t('albums:description')}
            as="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouched({ ...touched, description: true })}
            placeholder={t('albums:descriptionPlaceholder') || 'Description...'}
            maxLength={200}
            rows={3}
            showCharacterCount
            error={descriptionError}
          />

          {/* Cover URL Input */}
          <Input
            id="album-cover-input"
            label={`${t('albums:coverImage')} (optional)`}
            type="url"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            onBlur={() => setTouched({ ...touched, cover: true })}
            placeholder="https://..."
            error={coverError}
          />

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
