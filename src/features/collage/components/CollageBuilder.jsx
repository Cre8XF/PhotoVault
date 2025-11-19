// ============================================================================
// COMPONENT: CollageBuilder.jsx - Main Collage Builder V3
// Complete refactor using ImagePickerV3, LayoutSelector, CollagePreview, etc.
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import useStore from '../../../state/store'
import { usePhotoData } from '../../../hooks/usePhotoData'
import { useCollageData } from '../../../hooks/useCollageData'
import { LAYOUTS_V3 } from '../layouts/layouts_v3'
import { normalizePhotosArray } from '../../../utils/photoHelpers'

// V3 Components
import StepIndicator from './StepIndicator'
import ImagePickerV3 from './ImagePickerV3'
import LayoutSelector from './LayoutSelector'
import CollagePreview from './CollagePreview'
import RepositionModal from './RepositionModal'
import SaveCollageForm from './SaveCollageForm'

/**
 * CollageBuilder V3
 * Main component orchestrating the 4-step collage creation workflow
 *
 * Steps:
 * 1. Select Photos (ImagePickerV3)
 * 2. Choose Layout (LayoutSelector)
 * 3. Customize (CollagePreview + RepositionModal)
 * 4. Save (SaveCollageForm)
 *
 * Edit Mode: When /collage/edit/:id is accessed, loads existing collage
 * and starts at step 3 (customize) with pre-filled data
 */
const CollageBuilder = () => {
  const { id: collageId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation(['collage'])
  const { photos } = usePhotoData()
  const { getCollage } = useCollageData()
  const setCurrentPage = useStore((state) => state.setCurrentPage)

  // Normalize photos for consistent field access across all collage components
  const normalizedPhotos = useMemo(() => normalizePhotosArray(photos), [photos])

  // Determine if editing
  const isEditMode = Boolean(collageId)

  // Workflow state
  const [step, setStep] = useState(isEditMode ? 3 : 1)
  const [completedSteps, setCompletedSteps] = useState(isEditMode ? [1, 2, 3] : [])

  // Data state
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [transforms, setTransforms] = useState({})
  const [collageTitle, setCollageTitle] = useState('')

  // UI state
  const [repositionTarget, setRepositionTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditMode)

  // Load existing collage data if editing
  useEffect(() => {
    if (!isEditMode || !collageId) return

    const loadCollageData = async () => {
      setIsLoading(true)
      try {
        // Load collage data
        const collageData = await getCollage(collageId)
        console.log('🧩 Loaded collage in editor:', collageData)

        if (!collageData) {
          console.error('Collage not found')
          navigate('/albums')
          return
        }

        // Find matching photos (use normalized photos)
        const collagePhotos = collageData.photoIds
          .map(photoId => normalizedPhotos.find(p => p.id === photoId))
          .filter(Boolean)

        console.log('🖼️ Loaded collage photos:', collagePhotos)
        console.log('📊 Photo IDs from collage:', collageData.photoIds)
        console.log('📚 Available photos:', normalizedPhotos.length)

        if (collagePhotos.length === 0) {
          console.error('No photos found for collage')
          navigate('/albums')
          return
        }

        // Find layout
        const layout = Object.values(LAYOUTS_V3).find(l => l.id === collageData.layoutId)
        if (!layout) {
          console.error('Layout not found')
          navigate('/albums')
          return
        }

        // Set state
        setSelectedPhotos(collagePhotos)
        setSelectedLayout(layout)
        setTransforms(collageData.transforms || {})
        setCollageTitle(collageData.title || '')

        console.log('✅ Loaded collage for editing - Photos:', collagePhotos.length, 'Layout:', layout.name)
      } catch (error) {
        console.error('Failed to load collage:', error)
        navigate('/albums')
      } finally {
        setIsLoading(false)
      }
    }

    loadCollageData()
  }, [isEditMode, collageId, getCollage, normalizedPhotos, navigate])

  // Handle step completion
  const handleStepComplete = (stepNumber) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber])
    }
  }

  // Handle photo selection (Step 1)
  const handlePhotoSelection = (photos) => {
    setSelectedPhotos(photos)
    handleStepComplete(1)
    setStep(2)
  }

  // Handle layout selection (Step 2)
  const handleLayoutSelection = (layout) => {
    setSelectedLayout(layout)
    handleStepComplete(2)
    setStep(3)
  }

  // Handle reposition save
  const handleRepositionSave = (photoId, transform) => {
    setTransforms({
      ...transforms,
      [photoId]: transform
    })
    setRepositionTarget(null)
  }

  // Handle collage completion
  const handleCollageComplete = (savedCollageId) => {
    console.log('✅ Collage saved with ID:', savedCollageId)
    handleStepComplete(4)
    // No navigation here - handled in onComplete callback
  }


  // Show loading state when loading collage data
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-60">{t('collage:loading.collage')}</p>
        </div>
      </div>
    )
  }

  // Navigate to step (only if step is completed or current)
  const handleStepClick = (stepNumber) => {
    if (completedSteps.includes(stepNumber) || stepNumber === step) {
      setStep(stepNumber)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <h1 className="text-xl font-bold">
          {isEditMode ? t('collage:editTitle') : t('collage:title')}
        </h1>

        <button
          onClick={() => setCurrentPage('albums')}
          className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
          title={t('collage:buttons.close')}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        allowNavigation={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Step 1: Photo Selection */}
        {step === 1 && (
          <ImagePickerV3
            photos={normalizedPhotos}
            onSelect={handlePhotoSelection}
            maxPhotos={6}
            initialSelection={selectedPhotos}
            showBack={false}
          />
        )}

        {/* Step 2: Layout Selection */}
        {step === 2 && (
          <LayoutSelector
            photoCount={selectedPhotos.length}
            selectedLayout={selectedLayout}
            onSelect={handleLayoutSelection}
            showBack={true}
            onBack={() => setStep(1)}
          />
        )}

        {/* Step 3: Customization */}
        {step === 3 && (
          <div className="flex flex-col h-full">
            {/* Preview header */}
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h2 className="text-lg font-semibold mb-1">
                {t('collage:preview.title')}
              </h2>
              <p className="text-sm opacity-60">
                {t('collage:preview.clickToAdjust')}
              </p>
            </div>

            {/* Collage Preview */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <CollagePreview
                  photos={selectedPhotos}
                  layout={selectedLayout}
                  transforms={transforms}
                  onImageClick={(photoId) => setRepositionTarget(photoId)}
                  isLoading={false}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 hover:bg-white/5 rounded-xl transition"
              >
                {t('collage:selector.back')}
              </button>

              <button
                onClick={() => {
                  handleStepComplete(3)
                  setStep(4)
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition"
              >
                {t('collage:steps.save')}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Save */}
        {step === 4 && (
          <SaveCollageForm
            photos={selectedPhotos}
            layout={selectedLayout}
            transforms={transforms}
            collageId={isEditMode ? collageId : null}
            initialTitle={collageTitle}
            onComplete={(savedCollageId) => {
              console.log('✅ Collage saved/updated:', savedCollageId)
              handleStepComplete(4)
              // Navigate to collage view page
              navigate(`/collage/${savedCollageId}`)
            }}
            onBack={() => setStep(3)}
          />
        )}
      </div>

      {/* Reposition Modal (Overlay) */}
      {repositionTarget && (
        <RepositionModal
          photo={selectedPhotos.find(p => p.id === repositionTarget)}
          currentTransform={transforms[repositionTarget] || { scale: 1, translateX: 0, translateY: 0 }}
          onSave={(transform) => handleRepositionSave(repositionTarget, transform)}
          onClose={() => setRepositionTarget(null)}
        />
      )}
    </div>
  )
}

export default CollageBuilder
