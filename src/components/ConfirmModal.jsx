// ============================================================================
// COMPONENT: ConfirmModal.jsx – med "Deleting..." animasjon og auto-close
// ============================================================================
import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

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
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: 'var(--overlay-bg)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass card-premium relative w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-scale-in"
        style={{ color: 'var(--text-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold">{finalTitle}</h2>
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          {finalMessage}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {finalCancelLabel}
          </Button>

          <Button
            onClick={handleConfirm}
            loading={loading}
            variant="danger"
            size="sm"
          >
            {loading ? t('deleting') : finalConfirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
