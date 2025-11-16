// ============================================================================
// COMPONENT: StepIndicator.jsx - Progress indicator for multi-step workflow
// Shows numbered steps with connection lines
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { ImageIcon, Grid, ImagePlus, Save } from 'lucide-react'

/**
 * StepIndicator Component
 * Displays progress through multi-step collage creation workflow
 *
 * @param {number} currentStep - Current step (1-4)
 * @param {Array} completedSteps - Array of completed step numbers
 * @param {Function} onStepClick - Click handler (stepNumber) => void (optional)
 * @param {boolean} allowNavigation - Allow clicking to navigate to steps
 */
const StepIndicator = ({
  currentStep = 1,
  completedSteps = [],
  onStepClick = null,
  allowNavigation = false
}) => {
  const { t } = useTranslation(['collage'])

  // Step definitions
  const steps = [
    {
      number: 1,
      label: t('collage:steps.selectPhotos'),
      icon: ImageIcon
    },
    {
      number: 2,
      label: t('collage:steps.chooseLayout'),
      icon: Grid
    },
    {
      number: 3,
      label: t('collage:steps.customize'),
      icon: ImagePlus
    },
    {
      number: 4,
      label: t('collage:steps.save'),
      icon: Save
    }
  ]

  // Check if step is clickable
  const isClickable = (stepNumber) => {
    if (!allowNavigation || !onStepClick) return false
    // Can click on completed steps or current step
    return completedSteps.includes(stepNumber) || stepNumber === currentStep
  }

  // Handle step click
  const handleStepClick = (stepNumber) => {
    if (isClickable(stepNumber)) {
      onStepClick(stepNumber)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-6 bg-white/5">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number
        const isCompleted = completedSteps.includes(step.number)
        const clickable = isClickable(step.number)
        const Icon = step.icon

        return (
          <React.Fragment key={step.number}>
            {/* Step circle */}
            <div
              onClick={() => handleStepClick(step.number)}
              className={`
                flex flex-col items-center gap-2
                ${clickable ? 'cursor-pointer' : 'cursor-default'}
              `}
              title={step.label}
            >
              {/* Circle */}
              <div
                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full
                  flex items-center justify-center
                  transition-all duration-300
                  ${isActive
                    ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/50'
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-white/50'
                  }
                  ${clickable && !isActive ? 'hover:scale-105 hover:bg-white/20' : ''}
                `}
              >
                {isCompleted && !isActive ? (
                  // Checkmark for completed steps
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  // Step number or icon
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>

              {/* Label (hidden on mobile) */}
              <span
                className={`
                  hidden md:block text-xs font-medium transition-opacity
                  ${isActive ? 'opacity-100' : 'opacity-60'}
                `}
              >
                {step.label}
              </span>

              {/* Mobile label (only for active step) */}
              <span className="md:hidden text-xs font-medium opacity-100">
                {isActive && step.label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  hidden sm:block w-8 md:w-16 h-0.5
                  transition-all duration-300
                  ${isCompleted && completedSteps.includes(step.number + 1)
                    ? 'bg-green-500'
                    : isCompleted || isActive
                      ? 'bg-blue-500/50'
                      : 'bg-white/20'
                  }
                `}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

StepIndicator.propTypes = {
  currentStep: PropTypes.number,
  completedSteps: PropTypes.arrayOf(PropTypes.number),
  onStepClick: PropTypes.func,
  allowNavigation: PropTypes.bool
}

StepIndicator.defaultProps = {
  currentStep: 1,
  completedSteps: [],
  onStepClick: null,
  allowNavigation: false
}

export default StepIndicator
