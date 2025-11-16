// ============================================================================
// COMPONENT: CollageBuilder.jsx - Main Collage Builder V3
// Complete refactor using ImagePickerV3, LayoutSelector, CollagePreview, etc.
// ============================================================================
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import useStore from '../../../state/store'
import { usePhotoData } from '../../../hooks/usePhotoData'

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
 */
const CollageBuilder = () => {
  const { t } = useTranslation(['collage'])
  const { photos } = usePhotoData()
  const setCurrentPage = useStore((state) => state.setCurrentPage)

  // Workflow state
  const [step, setStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])

  // Data state
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [transforms, setTransforms] = useState({})

  // UI state
  const [repositionTarget, setRepositionTarget] = useState(null)

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
  const handleCollageComplete = (collageId) => {
    console.log('✅ Collage saved with ID:', collageId)
    handleStepComplete(4)

    // Navigate back to albums page after short delay
    setTimeout(() => {
      setCurrentPage('albums')
    }, 1000)
  }

  // Handle close
  const handleClose = () => {
    setCurrentPage('albums')
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
          {t('collage:title')}
        </h1>

        <button
          onClick={handleClose}
          className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
          title="Close"
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
            photos={photos}
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
            onComplete={handleCollageComplete}
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
