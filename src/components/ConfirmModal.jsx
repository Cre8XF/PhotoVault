// ============================================================================
// COMPONENT: ConfirmModal.jsx – med "Deleting..." animasjon og auto-close
// ============================================================================
import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState(false)

  const finalTitle = title || t('confirmAction')
  const finalMessage = message || t('areYouSure')
  const finalConfirmLabel = confirmLabel || t('confirm')
  const finalCancelLabel = cancelLabel || t('cancel')

  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm() // Wait for async operation
    } catch (err) {
      console.error('Confirm action failed:', err)
      // Error already shown by caller's toast
    } finally {
      setLoading(false)
      onClose() // ALWAYS close modal
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass card-premium relative w-full max-w-sm p-6 rounded-2xl shadow-2xl text-gray-100 animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold">{finalTitle}</h2>
        </div>

        {/* Body */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {finalMessage}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="ripple-effect px-5 py-2 rounded-xl bg-gray-700/70 hover:bg-gray-600/80
                       text-gray-200 text-sm font-semibold transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {finalCancelLabel}
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="ripple-effect px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700
                       text-white text-sm font-semibold shadow-sm transition-all duration-150
                       flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Deleting...
              </>
            ) : (
              finalConfirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
