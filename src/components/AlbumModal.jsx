// ============================================================================
// COMPONENT: AlbumModal.jsx – v2.2 med i18n + XSS Protection
// ============================================================================
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FolderPlus, Image as ImageIcon } from 'lucide-react'
import { sanitizeImageUrl, PLACEHOLDER_ALBUM } from '../utils/security'

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
  // ⚠️ CRITICAL: NO position: fixed! It breaks iOS keyboard when switching inputs
  // iOS needs to adjust viewport when keyboard appears - position:fixed blocks this
  useEffect(() => {
    console.log('═══════════════════════════════════════')
    console.log('📱 SCROLL LOCK: Applying mobile-safe overflow lock')
    console.log('═══════════════════════════════════════')

    // Store original values
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyPosition = document.body.style.position

    console.log('BEFORE lock:')
    console.log('  body.style.overflow:', originalBodyOverflow || '(empty)')
    console.log('  body.style.position:', originalBodyPosition || '(empty)')
    console.log('  html.style.overflow:', originalHtmlOverflow || '(empty)')

    // Apply iOS-safe scroll lock (overflow only, NO position)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    console.log('AFTER lock:')
    console.log('  body.style.overflow:', document.body.style.overflow)
    console.log('  html.style.overflow:', document.documentElement.style.overflow)
    console.log('  body.style.position:', document.body.style.position || '(none - CORRECT!)')
    console.log('═══════════════════════════════════════')

    return () => {
      console.log('📱 SCROLL LOCK: Restoring original overflow')
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow

      // Safety check: ensure position:fixed was never applied
      if (document.body.style.position === 'fixed') {
        console.warn('⚠️ WARNING: body.style.position was "fixed" - removing it!')
        document.body.style.position = originalBodyPosition
      }
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
    const inputElement = document.getElementById(`${fieldName}-input`)

    console.log('═══════════════════════════════════════')
    console.log('📱 MOBILE INPUT DEBUG - AlbumModal v2')
    console.log('═══════════════════════════════════════')
    console.log('Field:', fieldName)
    console.log('Event:', eventType)
    console.log('Timestamp:', new Date().toISOString())
    console.log('─────────────────────────────────────')
    console.log('Device Info:')
    console.log('  • User Agent:', navigator.userAgent)
    console.log('  • Is mobile:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    console.log('  • Touch support:', 'ontouchstart' in window)
    console.log('  • Viewport width:', window.innerWidth)
    console.log('  • Viewport height:', window.innerHeight)
    console.log('─────────────────────────────────────')
    console.log('Input State:')
    console.log('  • Loading state:', loading)
    console.log('  • Modal mode:', editingAlbum ? 'edit' : 'create')

    if (inputElement) {
      const computedStyle = window.getComputedStyle(inputElement)
      console.log('─────────────────────────────────────')
      console.log('Input Element Properties:')
      console.log('  • Disabled:', inputElement.disabled)
      console.log('  • ReadOnly:', inputElement.readOnly)
      console.log('  • Display:', computedStyle.display)
      console.log('  • Visibility:', computedStyle.visibility)
      console.log('  • Pointer Events:', computedStyle.pointerEvents)
      console.log('  • Touch Action:', computedStyle.touchAction)
      console.log('  • User Select:', computedStyle.userSelect)
      console.log('  • Z-index:', computedStyle.zIndex)
      console.log('  • Position:', computedStyle.position)
      console.log('  • Is focused:', document.activeElement === inputElement)
      console.log('  • Can focus:', inputElement.tabIndex >= -1)
    } else {
      console.log('⚠️ Input element not found:', `${fieldName}-input`)
    }
    console.log('═══════════════════════════════════════')
  }

  // Enhanced component mount debugging + viewport monitoring
  useEffect(() => {
    console.log('═══════════════════════════════════════')
    console.log('🚀 ALBUM MODAL MOUNTED')
    console.log('═══════════════════════════════════════')
    console.log('Mode:', editingAlbum ? 'EDIT' : 'CREATE')
    console.log('Device:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP')
    console.log('Touch support:', 'ontouchstart' in window ? 'YES' : 'NO')
    console.log('Screen size:', `${window.innerWidth}x${window.innerHeight}`)
    console.log('Visual viewport:', window.visualViewport ? `${window.visualViewport.width}x${window.visualViewport.height}` : 'NOT SUPPORTED')
    console.log('Viewport meta:', document.querySelector('meta[name="viewport"]')?.content || 'NOT FOUND')
    console.log('Body overflow:', document.body.style.overflow)
    console.log('Body position:', document.body.style.position || '(none)')
    console.log('HTML overflow:', document.documentElement.style.overflow || '(none)')

    // Monitor viewport changes (keyboard appearing/disappearing)
    const handleViewportChange = () => {
      console.log('📐 VIEWPORT CHANGED:')
      console.log('  • Window height:', window.innerHeight)
      console.log('  • Visual viewport height:', window.visualViewport?.height || 'N/A')
      console.log('  • Active element:', document.activeElement?.id || 'none')
      console.log('  • Body position:', document.body.style.position || '(none)')
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      window.visualViewport.addEventListener('scroll', handleViewportChange)
    }

    // Test input accessibility after a short delay
    setTimeout(() => {
      const nameInput = document.getElementById('album-name-input')
      if (nameInput) {
        console.log('─────────────────────────────────────')
        console.log('🔍 Testing name input accessibility:')
        console.log('  • Element found:', !!nameInput)
        console.log('  • Disabled:', nameInput.disabled)
        console.log('  • ReadOnly:', nameInput.readOnly)
        const style = window.getComputedStyle(nameInput)
        console.log('  • Pointer events:', style.pointerEvents)
        console.log('  • Touch action:', style.touchAction)
        console.log('  • Display:', style.display)
        console.log('  • Visibility:', style.visibility)
        console.log('  • User-select:', style.userSelect)
        console.log('─────────────────────────────────────')
        console.log('🎯 Attempting programmatic focus...')
        nameInput.focus()
        setTimeout(() => {
          console.log('✓ Focus result:', document.activeElement === nameInput ? 'SUCCESS' : 'FAILED')
          console.log('  • Active element:', document.activeElement?.id || 'unknown')
        }, 100)
      } else {
        console.log('❌ Name input not found in DOM')
      }
      console.log('═══════════════════════════════════════')
    }, 200)

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange)
        window.visualViewport.removeEventListener('scroll', handleViewportChange)
      }
    }
  }, [])

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
        WebkitOverflowScrolling: 'touch',
        // ✅ CRITICAL: Allow pointer events on overlay
        pointerEvents: 'auto',
        touchAction: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="glass card-premium w-full max-w-md rounded-2xl shadow-2xl p-6"
        style={{
          marginTop: 'auto',
          marginBottom: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto',
          // ✅ CRITICAL: Allow pointer events and touch on modal content
          pointerEvents: 'auto',
          touchAction: 'auto',
          WebkitOverflowScrolling: 'touch'
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
              id="album-name-input"
              name="album-name"
              type="text"
              value={name}
              onChange={(e) => {
                console.log('📱 Album name changed:', e.target.value)
                setName(e.target.value)
                setError('') // Clear error on change
              }}
              onFocus={(e) => {
                const timestamp = new Date().toISOString()
                console.log(`[FOCUS] album-name @ ${timestamp}`)
                console.log('  • activeElement:', document.activeElement?.id || '(none)')
                console.log('  • body.position:', getComputedStyle(document.body).position)
                console.log('  • body.overflow:', getComputedStyle(document.body).overflow)
                if (window.visualViewport) {
                  console.log('  • visualViewport.height:', window.visualViewport.height)
                }
                handleMobileInputDebug('album-name', 'focus')
              }}
              onBlur={(e) => {
                const timestamp = new Date().toISOString()
                console.log(`[BLUR] album-name @ ${timestamp}`)
                console.log('  • activeElement:', document.activeElement?.id || '(none)')
                console.log('  • relatedTarget:', e.relatedTarget?.id || '(none)')
              }}
              onTouchStart={(e) => {
                console.log('[TOUCH] album-name')
                // Don't force focus - let natural focus happen
              }}
              onClick={(e) => {
                console.log('[CLICK] album-name')
                console.log('  • target:', e.target.id)
                console.log('  • currentTarget:', e.currentTarget.id)
              }}
              placeholder={
                t('albums:namePlaceholder') ||
                'Enter album name (max 50 characters)'
              }
              maxLength={50}
              disabled={false}
              readOnly={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
              inputMode="text"
              enterKeyHint="next"
              className="input-premium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontSize: '16px', // Prevent iOS zoom
                minHeight: '44px', // Apple's minimum tap target
                padding: '12px 16px',
                WebkitUserSelect: 'text',
                WebkitTouchCallout: 'default',
                userSelect: 'text',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
                WebkitAppearance: 'none',
                appearance: 'none'
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
              id="album-description-input"
              name="album-description"
              value={description}
              onChange={(e) => {
                console.log('📱 Album description changed:', e.target.value)
                setDescription(e.target.value)
              }}
              onFocus={(e) => {
                const timestamp = new Date().toISOString()
                console.log(`[FOCUS] album-description @ ${timestamp}`)
                console.log('  • activeElement:', document.activeElement?.id || '(none)')
                console.log('  • body.position:', getComputedStyle(document.body).position)
                console.log('  • body.overflow:', getComputedStyle(document.body).overflow)
                if (window.visualViewport) {
                  console.log('  • visualViewport.height:', window.visualViewport.height)
                }
                handleMobileInputDebug('album-description', 'focus')
              }}
              onBlur={(e) => {
                const timestamp = new Date().toISOString()
                console.log(`[BLUR] album-description @ ${timestamp}`)
                console.log('  • activeElement:', document.activeElement?.id || '(none)')
                console.log('  • relatedTarget:', e.relatedTarget?.id || '(none)')
              }}
              onTouchStart={(e) => {
                console.log('[TOUCH] album-description')
                // Don't force focus - let natural focus happen
              }}
              onClick={(e) => {
                console.log('[CLICK] album-description')
                console.log('  • target:', e.target.id)
                console.log('  • currentTarget:', e.currentTarget.id)
              }}
              placeholder={
                t('albums:descriptionPlaceholder') ||
                'Add a description (optional, max 200 characters)'
              }
              maxLength={200}
              rows="3"
              disabled={false}
              readOnly={loading}
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
              inputMode="text"
              enterKeyHint="done"
              className="input-premium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontSize: '16px', // Prevent iOS zoom
                minHeight: '44px', // Apple's minimum tap target
                padding: '12px 16px',
                WebkitUserSelect: 'text',
                WebkitTouchCallout: 'default',
                userSelect: 'text',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
                resize: 'none', // Prevent resizing on mobile
                WebkitAppearance: 'none',
                appearance: 'none'
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
              id="album-cover-input"
              name="album-cover"
              type="url"
              value={cover}
              onChange={(e) => {
                console.log('📱 Cover URL changed:', e.target.value)
                setCover(e.target.value)
              }}
              onFocus={(e) => {
                const timestamp = new Date().toISOString()
                console.log(`[FOCUS] album-cover @ ${timestamp}`)
                console.log('  • activeElement:', document.activeElement?.id || '(none)')
                console.log('  • body.position:', getComputedStyle(document.body).position)
                console.log('  • body.overflow:', getComputedStyle(document.body).overflow)
                if (window.visualViewport) {
                  console.log('  • visualViewport.height:', window.visualViewport.height)
                }
                handleMobileInputDebug('cover-url', 'focus')
              }}
              onBlur={(e) => {
                const timestamp = new Date().toISOString()
                console.log(`[BLUR] album-cover @ ${timestamp}`)
                console.log('  • activeElement:', document.activeElement?.id || '(none)')
                console.log('  • relatedTarget:', e.relatedTarget?.id || '(none)')
              }}
              onTouchStart={(e) => {
                console.log('[TOUCH] album-cover')
                // Don't force focus - let natural focus happen
              }}
              onClick={(e) => {
                console.log('[CLICK] album-cover')
                console.log('  • target:', e.target.id)
                console.log('  • currentTarget:', e.currentTarget.id)
              }}
              placeholder="https://..."
              disabled={false}
              readOnly={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              inputMode="url"
              enterKeyHint="done"
              className="input-premium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontSize: '16px', // Prevent iOS zoom
                minHeight: '44px', // Apple's minimum tap target
                padding: '12px 16px',
                WebkitUserSelect: 'text',
                WebkitTouchCallout: 'default',
                userSelect: 'text',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
            {cover && (
              <img
                src={sanitizeImageUrl(cover, PLACEHOLDER_ALBUM)}
                alt={t('albums:coverPreview')}
                onError={(e) => {
                  console.error('❌ Failed to load album cover:', cover)
                  e.target.src = PLACEHOLDER_ALBUM
                }}
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
