// ============================================================================
// PAGE: CollageNewPage.jsx - New Collage Builder World (Phase 3B)
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { auth, db, storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import useStore from '../state/store'
import useCollageStore from '../features/collage/collageStore'
import {
  getTemplateById,
  expandTemplate,
} from '../features/collage/templateEngine'
import {
  serializeCollage,
  validateCollageData,
} from '../features/collage/collageUtils'
import { renderCollageToCanvas, renderCollageThumbnail } from '../utils/renderCollageToCanvas'
import { uploadWithFallback } from '../utils/r2Upload'
import { normalizePhotoFields } from '../utils/photoHelpers'
import CollageCanvas from '../features/collage/components/CollageCanvas'
import PhotoPickerPanel from '../features/collage/components/PhotoPickerPanel'
import CollageToolbar from '../features/collage/components/CollageToolbar'
import { PageWrapper } from '../components/layout/PageWrapper'
import useAuth from '../hooks/useAuth'

/**
 * CollageNewPage - New Collage Builder World
 *
 * Full-featured collage builder with:
 * - Template-based grid layout
 * - Photo selection and placement
 * - Slot transformations (rotate, scale, position)
 * - Auto-save warning
 * - Firestore integration
 */
const CollageNewPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  // Extract navigation state (albumId and returnPath from origin)
  const albumId = location.state?.albumId
  const returnPath = location.state?.returnPath || '/albums'

  // Global store
  const { setIsWorldView, photos, setUpgradeModal, setNotification } = useStore()

  // Collage store
  const {
    template,
    slots,
    selectedSlotIndex,
    isPhotoPickerOpen,
    isDirty,
    initializeFromTemplate,
    setSlotPhoto,
    removeSlotPhoto,
    rotateSlotPhoto,
    setSelectedSlot,
    openPhotoPicker,
    closePhotoPicker,
    markAsSaved,
    reset,
    getCollageData,
    isReadyToSave,
  } = useCollageStore()

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showExitWarning, setShowExitWarning] = useState(false)

  // 🆕 FREEMIUM: Get user tier
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'FREE'

  // Get template ID from query params
  const templateId = searchParams.get('template')

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    console.log('═══════════════════════════════════════')
    console.log('📍 COLLAGE BUILDER MOUNTED')
    console.log('═══════════════════════════════════════')
    console.log('Current path:', window.location.pathname)
    console.log('History length:', window.history.length)
    console.log('Template ID:', templateId)
    console.log('Referrer:', document.referrer)
    console.log('═══════════════════════════════════════')

    // Guard: Redirect to template selection if no template specified
    if (!templateId) {
      console.warn('⚠️ No template ID provided - redirecting to template selection')
      navigate('/tools/collage/templates', { replace: true })
      return
    }

    setIsWorldView(true)

    // Load template and initialize collage
    const templateData = getTemplateById(templateId)
    if (templateData) {
      const expandedTemplate = expandTemplate(templateData)
      initializeFromTemplate(expandedTemplate)
    }

    return () => {
      setIsWorldView(false)
      reset()
    }
  }, [setIsWorldView, templateId, initializeFromTemplate, reset, navigate])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = useCallback(() => {
    console.log('═══════════════════════════════════════')
    console.log('⬅️ COLLAGE BACK BUTTON DEBUG')
    console.log('═══════════════════════════════════════')
    console.log('Current path:', window.location.pathname)
    console.log('History length:', window.history.length)
    console.log('Has unsaved changes:', isDirty)

    if (isDirty) {
      console.log('⚠️ Showing exit warning (unsaved changes)')
      setShowExitWarning(true)
    } else {
      console.log('🔙 Navigating to:', returnPath)
      console.log('═══════════════════════════════════════')
      // Navigate back to origin (album, tools, or home)
      navigate(returnPath, { replace: true })
    }
  }, [isDirty, navigate, returnPath])

  const handleSlotClick = useCallback(
    (slotIndex) => {
      setSelectedSlot(slotIndex)
    },
    [setSelectedSlot]
  )

  const handleSlotRotate = useCallback(
    (slotIndex) => {
      rotateSlotPhoto(slotIndex)
    },
    [rotateSlotPhoto]
  )

  const handleSlotRemove = useCallback(
    (slotIndex) => {
      removeSlotPhoto(slotIndex)
    },
    [removeSlotPhoto]
  )

  const handleSlotAddPhoto = useCallback(
    (slotIndex) => {
      openPhotoPicker(slotIndex)
    },
    [openPhotoPicker]
  )

  const handlePhotoSelect = useCallback(
    (photo) => {
      if (selectedSlotIndex !== null) {
        setSlotPhoto(selectedSlotIndex, photo)
        closePhotoPicker()
      }
    },
    [selectedSlotIndex, setSlotPhoto, closePhotoPicker]
  )

  const handleSave = useCallback(async () => {
    if (!isReadyToSave()) {
      setSaveError(
        t('collage.errors.noPhotos', 'Add at least one photo before saving')
      )
      return
    }

    // 🆕 FREEMIUM: Block save for FREE users
    if (tier === 'FREE') {
      setSaveError('💎 Upgrade to LITE to save collages')
      return
    }

    try {
      setIsSaving(true)
      setSaveError(null)

      const user = auth.currentUser
      if (!user) {
        throw new Error('Not authenticated')
      }

      console.log('═══════════════════════════════════════')
      console.log('💾 COLLAGE SAVE AS PHOTO - DEBUG')
      console.log('═══════════════════════════════════════')
      console.log('Album ID:', albumId)
      console.log('Return path:', returnPath)

      // Get collage data with validation
      const collageData = getCollageData()
      const collagePhotos = photos.filter(p =>
        slots.find(s => s.photo?.id === p.id)
      )

      // Step 1: Render full-size collage image
      console.log('🎨 Rendering collage to image...')
      const collageBlob = await renderCollageToCanvas({
        layout: template,
        photos: collagePhotos,
        transforms: collageData.transforms || {},
        options: {
          quality: 0.92,
          useHighRes: true
        }
      })

      // Get actual dimensions (with fallback for older devices)
      let actualWidth, actualHeight
      try {
        const img = await createImageBitmap(collageBlob)
        actualWidth = img.width
        actualHeight = img.height
        img.close() // Free memory
      } catch (bitmapError) {
        console.warn('⚠️ createImageBitmap failed, using template dimensions:', bitmapError)
        actualWidth = template.canvas.width
        actualHeight = template.canvas.height
      }

      // Step 2: Upload full image
      const timestamp = Date.now()
      const collageFileName = `collage_${timestamp}.jpg`
      const storagePath = `users/${user.uid}/${albumId || 'collages'}/${collageFileName}`
      const storageRef = ref(storage, storagePath)

      console.log('☁️ Uploading collage image...')
      await uploadBytes(storageRef, collageBlob, {
        contentType: 'image/jpeg',
        customMetadata: {
          type: 'collage',
          templateId: template.id,
          photoCount: collageData.photoIds.length.toString(),
          createdAt: new Date().toISOString()
        }
      })

      const collageUrl = await getDownloadURL(storageRef)
      console.log('✅ Collage image uploaded:', collageUrl)

      // Step 3: Generate and upload thumbnail
      console.log('🖼️ Generating thumbnail...')
      const thumbnailBlob = await renderCollageThumbnail({
        layout: template,
        photos: collagePhotos,
        transforms: collageData.transforms || {},
        maxWidth: 400
      })

      const thumbnailPath = `users/${user.uid}/thumbnails/collage_${timestamp}_thumb.jpg`
      const thumbnailRef = ref(storage, thumbnailPath)

      await uploadBytes(thumbnailRef, thumbnailBlob, {
        contentType: 'image/jpeg'
      })

      const thumbnailUrl = await getDownloadURL(thumbnailRef)
      console.log('✅ Thumbnail uploaded')

      // Step 4: Build slotPhotos mapping (normalized)
      const slotPhotos = {}
      slots.forEach((slot, index) => {
        if (slot.photo?.id) {
          slotPhotos[index.toString()] = slot.photo.id
        }
      })

      // Step 5: Save as photo document
      const photosRef = collection(db, 'photos')
      const photoDoc = {
        // Standard fields
        userId: user.uid,
        albumId: albumId || null,
        url: collageUrl,
        thumbnailUrl: thumbnailUrl,
        name: `Collage - ${template.name}`,
        width: actualWidth,
        height: actualHeight,
        fileSize: collageBlob.size,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Type identification
        type: 'collage',
        isCollage: true,

        // Lightweight collage metadata
        collageData: {
          templateId: template.id,
          photoIds: collageData.photoIds,
          version: 2
        },

        // Editor data (normalized)
        collageEditorData: {
          slotPhotos: slotPhotos,
          transforms: collageData.transforms || {},
          editorVersion: '2.1'
        },

        // Metadata
        favorite: false,
        tags: ['collage'],
        aiTags: [`collage-${template.id}`, `${collageData.photoIds.length}-photos`]
      }

      const docRef = await addDoc(photosRef, photoDoc)
      console.log('✅ Collage saved as photo:', docRef.id)

      markAsSaved(docRef.id)


      // Show success notification
      setNotification({
        message: t('collage:notifications.collageSaved', 'Collage saved!'),
        type: 'success'
      })

      // Navigate back to origin (album, tools, or home)
      console.log('🔙 Navigating to:', returnPath)
      console.log('═══════════════════════════════════════')
      navigate(returnPath, { replace: true })

    } catch (error) {
      console.error('❌ Failed to save collage:', error)
      setSaveError(t('collage.errors.saveFailed', 'Failed to save collage'))

      setNotification({
        message: t('collage:notifications.saveFailed', 'Failed to save collage'),
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }, [
    isReadyToSave,
    getCollageData,
    markAsSaved,
    navigate,
    t,
    tier,
    template,
    photos,
    slots,
    albumId,
    returnPath,
    setNotification,
  ])

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!template) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2">
              {t('collage.errors.noTemplate', 'No template selected')}
            </h2>
            <p className="text-sm opacity-70 mb-4">
              {t(
                'collage.errors.selectTemplate',
                'Please select a template to create a collage'
              )}
            </p>
            <button
              onClick={() => navigate('/tools/collage/templates')}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              {t('collage.selectTemplate', 'Select Template')}
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const selectedSlot =
    selectedSlotIndex !== null ? slots[selectedSlotIndex] : null
  const hasSelectedPhoto = selectedSlot?.photo !== null

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col pb-20">
        {/* Top Bar */}
        <div className="collage-header fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Left: Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                {t('common:back', 'Back')}
              </span>
            </button>

            {/* Center: Title */}
            <div className="text-center">
              <h1 className="font-bold text-lg">
                {t('collage.new.title', 'New Collage')}
              </h1>
              <p className="text-xs opacity-50">{template.name}</p>
            </div>

            {/* Right: Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !isReadyToSave()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-medium"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">
                {isSaving
                  ? t('common:saving', 'Saving...')
                  : t('common:save', 'Save')}
              </span>
            </button>
          </div>

          {/* Error Banner */}
          {saveError && (
            <div className="bg-red-500/20 border-t border-red-500/30 px-4 py-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{saveError}</span>
            </div>
          )}

          {/* 🆕 FREEMIUM: Preview Banner for FREE users */}
          {tier === 'FREE' && !saveError && (
            <div className="bg-blue-500/20 border-t border-blue-500/30 px-4 py-2">
              <span className="text-sm text-blue-300">
                🎨 Build your collage! Upgrade to LITE to save.
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 pt-24 pb-4 px-4 md:pt-28 md:pb-8 md:px-8">
          <div className="max-w-4xl mx-auto">
            <CollageCanvas
              template={template}
              slots={slots}
              selectedSlotIndex={selectedSlotIndex}
              onSlotClick={handleSlotClick}
              onSlotRotate={handleSlotRotate}
              onSlotRemove={handleSlotRemove}
              onSlotAddPhoto={handleSlotAddPhoto}
            />

            {/* Helper Text */}
            <div className="mt-6 text-center">
              <p className="text-sm opacity-50">
                {t(
                  'collage.builder.helpText',
                  'Tap a slot to add or edit photos'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <CollageToolbar
          selectedSlotIndex={selectedSlotIndex}
          hasPhoto={hasSelectedPhoto}
          onReplace={() => openPhotoPicker(selectedSlotIndex)}
          onRotate={() => handleSlotRotate(selectedSlotIndex)}
          onRemove={() => handleSlotRemove(selectedSlotIndex)}
          canSwap={false} // Future feature
        />

        {/* Photo Picker Panel */}
        <PhotoPickerPanel
          isOpen={isPhotoPickerOpen}
          onClose={closePhotoPicker}
          photos={photos}
          onSelectPhoto={handlePhotoSelect}
          selectedSlotIndex={selectedSlotIndex}
          albumId={albumId}
        />

        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-yellow-500/30 animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">
                  {t('collage.unsavedChanges', 'Unsaved Changes')}
                </h3>
              </div>
              <p className="opacity-70 mb-6">
                {t(
                  'collage.unsavedWarning',
                  'You have unsaved changes. Are you sure you want to leave?'
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition"
                >
                  {t('common:cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => {
                    console.log(
                      '🗑️ User confirmed: Discard changes and navigate to:', returnPath
                    )
                    navigate(returnPath, { replace: true })
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition"
                >
                  {t('collage.discardChanges', 'Discard')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

export default CollageNewPage
