// ============================================================================
// COMPONENT: ConfirmModal.jsx - Confirmation dialog using unified Modal
// ============================================================================
import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnEscape={true}
      closeOnOutsideClick={false} // Prevent accidental close on delete
      showCloseButton={false} // No X button for critical actions
    >
      {/* Header with Icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {finalTitle}
        </h2>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
        {finalMessage}
      </p>

      {/* Action Buttons */}
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
    </Modal>
  )
}

export default ConfirmModal
