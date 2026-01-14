// ============================================================================
// PAGE: TrashPage.jsx – Phase 4B Trash & Restore
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Trash2,
  RotateCcw,
  X,
  AlertTriangle,
  Loader2,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react'
import {
  getDeletedPhotos,
  restorePhoto,
  restorePhotos,
  permanentlyDeletePhoto,
  permanentlyDeletePhotos,
} from '../firebase'
import useStore from '../state/store'
import { devLog } from '../utils/log'
import ConfirmModal from '../components/ConfirmModal'

const TrashPage = () => {
  const { t } = useTranslation(['common'])
  const navigate = useNavigate()

  const user = useStore((state) => state.user)
  const setNotification = useStore((state) => state.setNotification)

  const [deletedPhotos, setDeletedPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(null)

  // Load deleted photos
  useEffect(() => {
    if (!user?.uid) {
      navigate('/login')
      return
    }

    loadDeletedPhotos()
  }, [user])

  const loadDeletedPhotos = async () => {
    try {
      setIsLoading(true)
      const photos = await getDeletedPhotos(user.uid)
      setDeletedPhotos(photos)
      devLog(`📥 Loaded ${photos.length} deleted photos`)
    } catch (error) {
      console.error('❌ Error loading deleted photos:', error)
      setNotification({
        message: 'Failed to load trash',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate days remaining for each photo
  const photosWithDaysRemaining = useMemo(() => {
    return deletedPhotos.map((photo) => {
      if (!photo.deletedAt) {
        return { ...photo, daysRemaining: 7 }
      }

      const deletedDate = new Date(photo.deletedAt)
      const now = new Date()
      const daysSinceDeleted = Math.floor(
        (now - deletedDate) / (1000 * 60 * 60 * 24)
      )
      const daysRemaining = Math.max(0, 7 - daysSinceDeleted)

      return { ...photo, daysRemaining, daysSinceDeleted }
    })
  }, [deletedPhotos])

  // Selection handlers
  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    )
  }

  const selectAll = () => {
    setSelectedPhotos(photosWithDaysRemaining.map((p) => p.id))
  }

  const deselectAll = () => {
    setSelectedPhotos([])
  }

  // Restore handlers
  const handleRestore = async (photoId) => {
    try {
      setIsProcessing(true)
      await restorePhoto(photoId)
      setDeletedPhotos((prev) => prev.filter((p) => p.id !== photoId))
      setNotification({
        message: 'Photo restored successfully',
        type: 'success',
      })
    } catch (error) {
      console.error('❌ Restore error:', error)
      setNotification({
        message: 'Failed to restore photo',
        type: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestoreAll = async () => {
    if (deletedPhotos.length === 0) return

    try {
      setIsProcessing(true)
      const photoIds = deletedPhotos.map((p) => p.id)
      await restorePhotos(photoIds)
      setDeletedPhotos([])
      setSelectedPhotos([])
      setNotification({
        message: `All photos restored successfully`,
        type: 'success',
      })
    } catch (error) {
      console.error('❌ Restore error:', error)
      setNotification({
        message: 'Failed to restore photos',
        type: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestoreSelected = async () => {
    if (selectedPhotos.length === 0) return

    try {
      setIsProcessing(true)
      await restorePhotos(selectedPhotos)
      setDeletedPhotos((prev) =>
        prev.filter((p) => !selectedPhotos.includes(p.id))
      )
      setSelectedPhotos([])
      setNotification({
        message: `${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''} restored`,
        type: 'success',
      })
    } catch (error) {
      console.error('❌ Restore error:', error)
      setNotification({
        message: 'Failed to restore photos',
        type: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Permanent delete handlers
  const handlePermanentDelete = (photoId) => {
    setShowConfirmModal({
      title: 'Delete photos permanently?',
      message:
        'This will permanently delete 1 photo. This action cannot be undone.',
      confirmLabel: 'Delete Permanently',
      onConfirm: async () => {
        try {
          setIsProcessing(true)
          await permanentlyDeletePhoto(photoId)
          setDeletedPhotos((prev) => prev.filter((p) => p.id !== photoId))
          setNotification({
            message: 'Photo permanently deleted',
            type: 'success',
          })
        } catch (error) {
          console.error('❌ Delete error:', error)
          setNotification({
            message: 'Failed to delete photo',
            type: 'error',
          })
        } finally {
          setIsProcessing(false)
          setShowConfirmModal(null)
        }
      },
      onCancel: () => setShowConfirmModal(null),
    })
  }

  const handlePermanentDeleteSelected = () => {
    if (selectedPhotos.length === 0) return

    const count = selectedPhotos.length
    setShowConfirmModal({
      title: 'Delete photos permanently?',
      message: `This will permanently delete ${count} photo${count > 1 ? 's' : ''}. This action cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      onConfirm: async () => {
        try {
          setIsProcessing(true)
          await permanentlyDeletePhotos(selectedPhotos)
          setDeletedPhotos((prev) =>
            prev.filter((p) => !selectedPhotos.includes(p.id))
          )
          setSelectedPhotos([])
          setNotification({
            message: `${count} photo${count > 1 ? 's' : ''} permanently deleted`,
            type: 'success',
          })
        } catch (error) {
          console.error('❌ Delete error:', error)
          setNotification({
            message: 'Failed to delete photos',
            type: 'error',
          })
        } finally {
          setIsProcessing(false)
          setShowConfirmModal(null)
        }
      },
      onCancel: () => setShowConfirmModal(null),
    })
  }

  const handleEmptyTrash = () => {
    if (deletedPhotos.length === 0) return

    const count = deletedPhotos.length
    setShowConfirmModal({
      title: 'Delete photos permanently?',
      message: `This will permanently delete ${count} photo${count > 1 ? 's' : ''}. This action cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      onConfirm: async () => {
        try {
          setIsProcessing(true)
          const photoIds = deletedPhotos.map((p) => p.id)
          await permanentlyDeletePhotos(photoIds)
          setDeletedPhotos([])
          setSelectedPhotos([])
          setNotification({
            message: 'Trash emptied successfully',
            type: 'success',
          })
        } catch (error) {
          console.error('❌ Empty trash error:', error)
          setNotification({
            message: 'Failed to empty trash',
            type: 'error',
          })
        } finally {
          setIsProcessing(false)
          setShowConfirmModal(null)
        }
      },
      onCancel: () => setShowConfirmModal(null),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-8 h-8" />
              Trash
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Photos will be permanently deleted after 7 days
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info Banner */}
        {deletedPhotos.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Photos in Trash are automatically deleted after 7 days. You can restore them anytime before that.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {deletedPhotos.length > 0 && (
        <div className="mb-6 space-y-3">
          {/* Global Actions - Always Visible */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRestoreAll}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              aria-label="Restore all photos from trash"
            >
              <RotateCcw className="w-4 h-4" />
              Restore All
            </button>

            <button
              onClick={handleEmptyTrash}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              aria-label="Permanently delete all photos in trash"
            >
              <Trash2 className="w-4 h-4" />
              Empty Trash
            </button>

            {/* Selection Toggle */}
            <button
              onClick={
                selectedPhotos.length === deletedPhotos.length
                  ? deselectAll
                  : selectAll
              }
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              aria-label={selectedPhotos.length > 0 ? "Deselect all photos" : "Select all photos"}
            >
              {selectedPhotos.length === deletedPhotos.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedPhotos.length > 0
                ? `${selectedPhotos.length} selected`
                : 'Select All'}
            </button>
          </div>

          {/* Selection Actions - Only When Items Selected */}
          {selectedPhotos.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedPhotos.length} photo{selectedPhotos.length > 1 ? 's' : ''} selected
              </span>

              <button
                onClick={handleRestoreSelected}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                aria-label={`Restore ${selectedPhotos.length} selected photo${selectedPhotos.length > 1 ? 's' : ''}`}
              >
                <RotateCcw className="w-4 h-4" />
                Restore Selected
              </button>

              <button
                onClick={handlePermanentDeleteSelected}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                aria-label={`Permanently delete ${selectedPhotos.length} selected photo${selectedPhotos.length > 1 ? 's' : ''}`}
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected Permanently
              </button>

              <button
                onClick={deselectAll}
                className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                aria-label="Clear selection"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : deletedPhotos.length === 0 ? (
        <div className="text-center py-20">
          <Trash2 className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Trash is Empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Deleted photos will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photosWithDaysRemaining.map((photo) => {
            const isSelected = selectedPhotos.includes(photo.id)
            return (
              <div key={photo.id} className="relative group">
                {/* Selection Checkbox */}
                <button
                  onClick={() => togglePhotoSelection(photo.id)}
                  className={`absolute top-2 left-2 z-10 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-opacity ${
                    isSelected || selectedPhotos.length > 0
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                  aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Photo Card */}
                <div className={`relative aspect-[4/5] bg-black/10 rounded-lg overflow-hidden ${
                  isSelected ? 'ring-4 ring-blue-500' : ''
                }`}>
                  <img
                    src={photo.url || photo.thumbnailUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Days Remaining Badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-md">
                    {photo.daysRemaining === 0
                      ? 'Deleting soon'
                      : `${photo.daysRemaining}d left`}
                  </div>

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleRestore(photo.id)}
                      disabled={isProcessing}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-lg"
                      aria-label="Restore this photo"
                      title="Restore"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(photo.id)}
                      disabled={isProcessing}
                      className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-lg"
                      aria-label="Delete this photo permanently"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Photo Info */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {photo.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600">
                    Deleted {photo.daysSinceDeleted}d ago
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <ConfirmModal
          isOpen={true}
          title={showConfirmModal.title}
          message={showConfirmModal.message}
          confirmLabel={showConfirmModal.confirmLabel}
          cancelLabel="Cancel"
          onConfirm={showConfirmModal.onConfirm}
          onClose={showConfirmModal.onCancel}
        />
      )}
    </div>
  )
}

export default TrashPage
