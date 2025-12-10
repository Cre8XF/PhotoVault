// ============================================================================
// COMPONENT: AlbumModal.jsx – v2.1 med i18n
// ============================================================================
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FolderPlus, Image as ImageIcon } from 'lucide-react'

const AlbumModal = ({ onClose, onSave, editingAlbum }) => {
  const { t } = useTranslation(['albums'])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cover, setCover] = useState('')

  // New state for UX
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingAlbum) {
      setName(editingAlbum.name || '')
      setDescription(editingAlbum.description || '')
      setCover(editingAlbum.cover || '')
    }
  }, [editingAlbum])

  // Prevent body scroll when modal is open (mobile-friendly approach)
  useEffect(() => {
    console.log('📱 AlbumModal: Locking body scroll (mobile-friendly)')

    // Store current scroll position
    const scrollY = window.scrollY

    // Lock body scroll (better for mobile)
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'

    return () => {
      console.log('📱 AlbumModal: Unlocking body scroll')

      // Restore scroll
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose, loading])

  // Validation helper
  const validateForm = () => {
    // Clear previous errors
    setError('')

    // Validate name
    if (!name.trim()) {
      setError(t('albums:needsAlbumName'))
      return false
    }

    if (name.length > 50) {
      setError(t('albums:errors.nameTooLong'))
      return false
    }

    if (description.length > 200) {
      setError(t('albums:errors.descriptionTooLong'))
      return false
    }

    return true
  }

  // Mobile debug logging helper
  const handleMobileInputDebug = (fieldName, eventType) => {
    console.log('═══════════════════════════════════════')
    console.log('📱 MOBILE INPUT DEBUG - AlbumModal')
    console.log('═══════════════════════════════════════')
    console.log('Field:', fieldName)
    console.log('Event:', eventType)
    console.log('Is mobile:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    console.log('Touch support:', 'ontouchstart' in window)
    console.log('Viewport width:', window.innerWidth)
    console.log('Input disabled:', loading)
    console.log('Modal mode:', editingAlbum ? 'edit' : 'create')
    console.log('═══════════════════════════════════════')
  }

  // Enhanced submit handler
  const handleSave = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const albumData = {
        name: name.trim(),
        description: description.trim(),
        cover: cover.trim(),
      }

      // Let parent handle both create and update
      await onSave(albumData, editingAlbum)

      // Close modal on success
      onClose()
    } catch (err) {
      console.error('Error saving album:', err)
      setError(err.message || t('albums:errors.couldNotCreateAlbum'))

      if (window.showToast) {
        window.showToast(t('albums:errors.albumCreationError'), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        className="glass card-premium w-full max-w-md rounded-2xl shadow-2xl p-6"
        style={{
          marginBottom: 'env(safe-area-inset-bottom, 20px)'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            {editingAlbum ? t('albums:editAlbum') : t('albums:newAlbum')}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="ripple-effect text-gray-400 hover:text-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {t('albums:name')} <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                console.log('📱 Album name changed:', e.target.value)
                setName(e.target.value)
                setError('') // Clear error on change
              }}
              onFocus={() => handleMobileInputDebug('album-name', 'focus')}
              onBlur={() => console.log('📱 Album name input blurred')}
              onTouchStart={() => handleMobileInputDebug('album-name', 'touchstart')}
              placeholder={
                t('albums:namePlaceholder') ||
                'Enter album name (max 50 characters)'
              }
              maxLength={50}
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
              inputMode="text"
              enterKeyHint="next"
              className="input-premium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontSize: '16px', // Prevent iOS zoom
                WebkitUserSelect: 'text',
                WebkitTouchCallout: 'default',
                touchAction: 'manipulation'
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/50 {t('albums:characters')}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {t('albums:description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                console.log('📱 Album description changed:', e.target.value)
                setDescription(e.target.value)
              }}
              onFocus={() => handleMobileInputDebug('album-description', 'focus')}
              onBlur={() => console.log('📱 Description input blurred')}
              onTouchStart={() => handleMobileInputDebug('album-description', 'touchstart')}
              placeholder={
                t('albums:descriptionPlaceholder') ||
                'Add a description (optional, max 200 characters)'
              }
              maxLength={200}
              rows="3"
              disabled={loading}
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
              inputMode="text"
              enterKeyHint="done"
              className="input-premium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontSize: '16px', // Prevent iOS zoom
                WebkitUserSelect: 'text',
                WebkitTouchCallout: 'default',
                touchAction: 'manipulation',
                resize: 'none' // Prevent resizing on mobile
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/200 {t('albums:characters')}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              {t('albums:coverImage')}
            </label>
            <input
              type="url"
              value={cover}
              onChange={(e) => {
                console.log('📱 Cover URL changed:', e.target.value)
                setCover(e.target.value)
              }}
              onFocus={() => handleMobileInputDebug('cover-url', 'focus')}
              onBlur={() => console.log('📱 Cover URL input blurred')}
              onTouchStart={() => handleMobileInputDebug('cover-url', 'touchstart')}
              placeholder="https://..."
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              inputMode="url"
              enterKeyHint="done"
              className="input-premium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontSize: '16px', // Prevent iOS zoom
                WebkitUserSelect: 'text',
                WebkitTouchCallout: 'default',
                touchAction: 'manipulation'
              }}
            />
            {cover && (
              <img
                src={cover}
                alt={t('albums:coverPreview')}
                className="w-full h-40 object-cover rounded-xl mt-2 border border-gray-700"
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="ripple-effect px-5 py-2 rounded-xl bg-gray-700/60 hover:bg-gray-600/70
                         text-gray-200 text-sm font-semibold transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('albums:cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="ripple-effect px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                         hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {editingAlbum ? t('albums:updating') : t('albums:creating')}
                </>
              ) : editingAlbum ? (
                t('albums:saveChanges')
              ) : (
                t('albums:createAlbum')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AlbumModal
