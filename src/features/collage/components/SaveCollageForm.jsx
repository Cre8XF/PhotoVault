// ============================================================================
// COMPONENT: SaveCollageForm.jsx - Final step to save collage
// Allows user to name collage and save to Firestore
// ============================================================================
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, Loader } from 'lucide-react'
import { useCollageData } from '../../../hooks/useCollageData'

/**
 * SaveCollageForm Component
 * Final step in collage creation/editing - save to Firestore
 *
 * @param {Array} photos - Selected photos array
 * @param {Object} layout - Selected layout from layouts_v3.js
 * @param {Object} transforms - Transform data { [photoId]: { scale, translateX, translateY } }
 * @param {Function} onComplete - Completion handler (collageId) => void
 * @param {Function} onBack - Back button handler
 * @param {string} collageId - (Optional) Collage ID for editing existing collage
 * @param {string} initialTitle - (Optional) Initial title for edit mode
 */
const SaveCollageForm = ({
  photos,
  layout,
  transforms,
  onComplete,
  onBack,
  collageId = null,
  initialTitle = ''
}) => {
  const { t } = useTranslation(['collage'])
  const { createCollage, updateCollage, isSaving } = useCollageData()

  const isEditMode = Boolean(collageId)
  const [title, setTitle] = useState(initialTitle)

  const handleSave = async () => {
    if (!photos || photos.length === 0 || !layout) {
      console.error('❌ Missing photos or layout')
      return
    }

    try {
      const photoIds = photos.map(p => p.id)
      const collageTitle = title || t('collage:save.titlePlaceholder')

      if (isEditMode) {
        // Update existing collage
        const success = await updateCollage(collageId, {
          title: collageTitle,
          photoIds,
          layoutId: layout.id,
          transforms
        })

        if (success) {
          console.log('✅ Collage updated:', collageId)
          onComplete(collageId)
        }
      } else {
        // Create new collage
        const newCollageId = await createCollage({
          title: collageTitle,
          photoIds,
          layoutId: layout.id,
          transforms,
          photos, // Pass photos for thumbnail generation
          layout  // Pass layout for thumbnail generation
        })

        if (newCollageId) {
          console.log('✅ Collage saved:', newCollageId)
          onComplete(newCollageId)
        }
      }
    } catch (error) {
      console.error('❌ Failed to save collage:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="ripple-effect px-3 py-2 hover:bg-white/10 rounded-lg transition"
              disabled={isSaving}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <h2 className="text-lg font-semibold">
              {t('collage:save.title')}
            </h2>
            <p className="text-sm opacity-60">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} • {layout.name} layout
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          {/* Preview info */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm opacity-70 mb-2">
              Your collage is ready to save!
            </p>
            <div className="flex items-center gap-4 text-xs opacity-60">
              <span>{photos.length} photos</span>
              <span>•</span>
              <span>{t(`collage:layouts.${layout.id}`)}</span>
              <span>•</span>
              <span>{Object.keys(transforms).length} adjusted</span>
            </div>
          </div>

          {/* Title input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t('collage:save.titleLabel')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('collage:save.titlePlaceholder')}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
              maxLength={100}
            />
            {title && (
              <p className="text-xs opacity-50 mt-1">
                {title.length}/100 characters
              </p>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {t('collage:save.savingButton')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('collage:save.saveButton')}
              </>
            )}
          </button>

          {/* Cancel button */}
          {onBack && (
            <button
              onClick={onBack}
              disabled={isSaving}
              className="w-full mt-3 px-6 py-3 hover:bg-white/5 rounded-xl transition disabled:opacity-50"
            >
              {t('collage:save.cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

SaveCollageForm.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })
  ).isRequired,
  layout: PropTypes.object.isRequired,
  transforms: PropTypes.object,
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  collageId: PropTypes.string,
  initialTitle: PropTypes.string
}

SaveCollageForm.defaultProps = {
  transforms: {},
  onBack: null,
  collageId: null,
  initialTitle: ''
}

export default SaveCollageForm
