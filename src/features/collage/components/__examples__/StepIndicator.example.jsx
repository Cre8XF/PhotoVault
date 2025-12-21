// ============================================================================
// EXAMPLE: StepIndicator Usage Examples
// Demonstrates different use cases for StepIndicator component
// ============================================================================
import React, { useState } from 'react'
import StepIndicator from '../StepIndicator'

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================
export function BasicExample() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Basic StepIndicator</h2>

      <StepIndicator currentStep={currentStep} />

      {/* Step controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <span className="text-sm opacity-70">Step {currentStep} of 4</span>

        <button
          onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
          disabled={currentStep === 4}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: With Completed Steps
// ============================================================================
export function WithCompletedStepsExample() {
  const [currentStep, setCurrentStep] = useState(3)
  const [completedSteps, setCompletedSteps] = useState([1, 2])

  const handleNext = () => {
    if (currentStep < 4) {
      setCompletedSteps([...completedSteps, currentStep])
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">With Completed Steps (Green Checkmarks)</h2>

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg disabled:opacity-50"
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === 4}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
        >
          Complete Step & Next →
        </button>
      </div>

      {/* Status display */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg text-center">
        <p className="text-sm">
          Completed: {completedSteps.length} | Current: {currentStep} | Remaining: {4 - completedSteps.length - 1}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: With Navigation
// ============================================================================
export function WithNavigationExample() {
  const [currentStep, setCurrentStep] = useState(2)
  const [completedSteps, setCompletedSteps] = useState([1])

  const handleStepClick = (stepNumber) => {
    if (import.meta.env.DEV) console.log('Clicked step:', stepNumber)
    setCurrentStep(stepNumber)
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Interactive Navigation (Click Steps)</h2>

      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm">
          You can click on completed steps or the current step to navigate
        </p>
      </div>

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        allowNavigation={true}
      />

      {/* Mark as complete button */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => {
            if (!completedSteps.includes(currentStep)) {
              setCompletedSteps([...completedSteps, currentStep])
            }
            if (currentStep < 4) {
              setCurrentStep(currentStep + 1)
            }
          }}
          disabled={currentStep === 4 && completedSteps.includes(4)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
        >
          Mark Complete & Continue
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Full Workflow Simulation
// ============================================================================
export function FullWorkflowExample() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedLayout, setSelectedLayout] = useState(null)

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with step indicator */}
      <div className="border-b border-white/10">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Select Photos</h2>
              <p className="opacity-70 mb-6">Choose photos for your collage</p>

              {/* Simulated photo count */}
              <div className="mb-6">
                <label className="block text-sm mb-2">Photos selected: {selectedPhotos.length}</label>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={selectedPhotos.length}
                  onChange={(e) => setSelectedPhotos(Array(parseInt(e.target.value)).fill({}))}
                  className="w-full accent-blue-500"
                />
              </div>

              <button
                onClick={handleNext}
                disabled={selectedPhotos.length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                Continue to Layout Selection
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Choose Layout</h2>
              <p className="opacity-70 mb-6">Select a layout for {selectedPhotos.length} photos</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {['Layout A', 'Layout B', 'Layout C'].map(layout => (
                  <button
                    key={layout}
                    onClick={() => setSelectedLayout(layout)}
                    className={`p-6 rounded-lg border-2 ${
                      selectedLayout === layout
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/20'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!selectedLayout}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                Continue to Customization
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Customize</h2>
              <p className="opacity-70 mb-6">Adjust photo positions and zoom</p>

              <div className="p-8 bg-white/5 rounded-lg mb-6">
                <p className="text-sm opacity-70">Interactive preview goes here...</p>
              </div>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Continue to Save
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Save Collage</h2>
              <p className="opacity-70 mb-6">Give your collage a name and save</p>

              <input
                type="text"
                placeholder="My Awesome Collage"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg mb-6"
              />

              <button
                onClick={() => {
                  setCompletedSteps([...completedSteps, 4])
                  alert('Collage saved!')
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Save Collage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Mobile Responsive
// ============================================================================
export function MobileResponsiveExample() {
  const [currentStep, setCurrentStep] = useState(2)
  const [completedSteps] = useState([1])

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Mobile View</h2>

      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-xs">
          On mobile, only the active step label is shown to save space
        </p>
      </div>

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Mobile controls */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          className="flex-1 px-3 py-2 bg-gray-600 rounded-lg text-sm"
        >
          ← Back
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
          className="flex-1 px-3 py-2 bg-blue-600 rounded-lg text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: All Steps Completed
// ============================================================================
export function AllCompletedExample() {
  const [completedSteps] = useState([1, 2, 3, 4])
  const [currentStep] = useState(4)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Steps Completed</h2>

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-2">Collage Complete! 🎉</h3>
        <p className="text-sm opacity-70">All steps have been successfully completed</p>
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================
export default {
  BasicExample,
  WithCompletedStepsExample,
  WithNavigationExample,
  FullWorkflowExample,
  MobileResponsiveExample,
  AllCompletedExample
}
