// ============================================================================
// COMPONENT: AlbumModal.jsx - Album creation/editing using unified Modal
// ============================================================================
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderPlus } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import { getValidationError } from '../utils/errorMessages'

const AlbumModal = ({ isOpen, onClose, onSave, editingAlbum }) => {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnEscape={true}
      closeOnOutsideClick={true}
      showCloseButton={false} // Using custom header with icon
    >
      {/* Header with Icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20">
          <FolderPlus className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {editingAlbum ? t('albums:editAlbum') : t('albums:newAlbum')}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
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
    </Modal>
  )
}

export default AlbumModal
