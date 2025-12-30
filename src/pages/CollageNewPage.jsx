// ============================================================================
// PAGE: CollageNewPage.jsx - New Collage Builder World (Phase 3B)
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { auth, db } from '../firebase'
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
import { renderCollageToCanvas } from '../utils/renderCollageToCanvas'
import { uploadWithFallback } from '../utils/r2Upload'
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

  // Global store
  const { setIsWorldView, photos, setUpgradeModal } = useStore()

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
  const tier = userProfile?.subscriptionTier || 'GRATIS'

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

    setIsWorldView(true)

    // Load template and initialize collage
    if (templateId) {
      const templateData = getTemplateById(templateId)
      if (templateData) {
        const expandedTemplate = expandTemplate(templateData)
        initializeFromTemplate(expandedTemplate)
      }
    }

    return () => {
      setIsWorldView(false)
      reset()
    }
  }, [setIsWorldView, templateId, initializeFromTemplate, reset])

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
      console.log('🏠 Navigating to Home with replace: true')
      console.log('═══════════════════════════════════════')
      // FIX: Navigate to Home (not back!)
      // Using replace: true removes collage builder from history
      navigate('/', { replace: true })
    }
  }, [isDirty, navigate])

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

    // 🆕 FREEMIUM: Block save for GRATIS users
    if (tier === 'GRATIS') {
      setSaveError('💎 Upgrade to LITE to save collages')
      return
    }

    try {
      setIsSaving(true)
      setSaveError(null)

      console.log('═══════════════════════════════════════')
      console.log('💾 COLLAGE SAVE DEBUG')
      console.log('═══════════════════════════════════════')
      console.log('Current path:', window.location.pathname)
      console.log('History length:', window.history.length)

      const collageData = getCollageData()
      const validation = validateCollageData(collageData)

      if (!validation.valid) {
        setSaveError(validation.error)
        return
      }

      const serialized = serializeCollage(collageData)

      // Save to Firestore
      const user = auth.currentUser
      if (!user) {
        throw new Error('Not authenticated')
      }

      const collagesRef = collection(db, 'users', user.uid, 'collages')
      const docRef = await addDoc(collagesRef, {
        ...serialized,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      markAsSaved(docRef.id)

      console.log('✅ Collage saved successfully:', docRef.id)

      // Generate and upload static collage image to R2
      try {
        console.log('🖼️ Generating static collage image...')

        // Render full-size collage (slot-based)
        // DEBUG: se hva som faktisk ligger i slots i runtime
        console.log('[STATIC] slots snapshot:', slots)

        // Build photos array from slots (robust)
        const photosForRender = slots
          .map((s) => s?.photo)
          .filter((p) => p && (p.url || p.imageUrl || p.downloadURL || p.src))
          .map((p) => ({
            id: p.id || p.photoId || p.name || crypto.randomUUID(),
            url: p.url || p.imageUrl || p.downloadURL || p.src,
            name: p.name || '',
            width: p.width ?? null,
            height: p.height ?? null,
            thumbnailUrl: p.thumbnailUrl ?? null,
          }))

        if (!photosForRender.length) {
          throw new Error(
            'No photos with usable URL found in slots (cannot generate static collage).'
          )
        }

        // Build transforms keyed by the same id we use in photosForRender
        const transformsForRender = {}
        slots.forEach((s) => {
          const p = s?.photo
          const pid = p?.id || p?.photoId || p?.name // must match something stable
          if (!pid) return
          transformsForRender[pid] = s.transform || {
            scale: 1,
            rotation: 0,
            offsetX: 0,
            offsetY: 0,
          }
        })

        // Guard: layout/template must exist
        if (!template) {
          throw new Error(
            `Missing layout/template for templateId=${templateId}`
          )
        }

        // Render full-size collage (matches current renderCollageToCanvas contract)
        const collageBlob = await renderCollageToCanvas({
          layout: template, // required
          photos: photosForRender, // required (non-empty)
          transforms: transformsForRender, // expected by current function
          options: {
            quality: 0.9,
            useHighRes: true,
          },
        })

        // Get Firebase token for R2 authentication
        const firebaseToken = await user.getIdToken()

        // Construct storage path for static collage
        const timestamp = Date.now()
        const staticStoragePath = `users/${user.uid}/collages/${timestamp}_${docRef.id}.jpg`

        // Upload to R2
        const { url: staticImageUrl } = await uploadWithFallback(
          collageBlob,
          staticStoragePath,
          'image/jpeg',
          {
            userId: user.uid,
            type: 'collage',
            collageId: docRef.id,
            uploadedAt: new Date().toISOString(),
          },
          null, // No Firebase fallback for static collages
          user.uid,
          firebaseToken
        )

        // Update Firestore document with static image fields
        const collageDocRef = doc(db, 'users', user.uid, 'collages', docRef.id)
        await updateDoc(collageDocRef, {
          staticImageUrl: staticImageUrl,
          staticStoragePath: staticStoragePath,
          staticStorageBackend: 'r2',
          staticGeneratedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        console.log('✅ Static collage uploaded to R2:', staticImageUrl)
      } catch (staticError) {
        console.error('⚠️ Static collage generation failed:', staticError)
        // Continue - virtual collage is already saved
      }

      // Show success message
      console.log('🏠 Navigating to Home with replace: true')
      console.log('═══════════════════════════════════════')

      // FIX: Navigate directly to Home (not back!)
      // Using replace: true removes collage builder from history
      navigate('/', {
        replace: true,
        state: {
          message: 'Kollasj lagret!',
          type: 'success',
        },
      })
    } catch (error) {
      console.error('❌ Failed to save collage:', error)
      setSaveError(t('collage.errors.saveFailed', 'Failed to save collage'))
    } finally {
      setIsSaving(false)
    }
  }, [isReadyToSave, getCollageData, markAsSaved, navigate, t, tier])

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

          {/* 🆕 FREEMIUM: Preview Banner for GRATIS users */}
          {tier === 'GRATIS' && !saveError && (
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
                      '🗑️ User confirmed: Discard changes and go Home'
                    )
                    navigate('/', { replace: true })
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
