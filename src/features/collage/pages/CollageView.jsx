// ============================================================================
// CollageView.jsx - Full collage display page
// View saved collage with options to edit, share, download, and delete
// ============================================================================
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Download,
  Share2,
  Trash2,
  Grid3x3,
  Image as ImageIcon,
  Maximize2,
  Calendar
} from 'lucide-react'

// Hooks and utilities
import useCollageData from '../../../hooks/useCollageData'
import usePhotoData from '../../../hooks/usePhotoData'
import { renderCollageToCanvas, downloadCollageBlob } from '../../../utils/renderCollageToCanvas'
import { LAYOUTS_V3 } from '../layouts/layouts_v3'

// Components
import CollagePreview from '../components/CollagePreview'
import useStore from '../../../state/store'

/**
 * CollageView Component
 * Displays a single collage in full resolution with metadata and action buttons
 */
const CollageView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation(['collage', 'common'])

  // Hooks
  const { getCollage, deleteCollage, isLoading, isDeleting } = useCollageData()
  const { photos: allPhotos } = usePhotoData()

  // Store
  const setCurrentPage = useStore((state) => state.setCurrentPage)
  const setConfirmModal = useStore((state) => state.setConfirmModal)

  // Local state
  const [collage, setCollage] = useState(null)
  const [collagePhotos, setCollagePhotos] = useState([])
  const [layout, setLayout] = useState(null)
  const [showActions, setShowActions] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Fetch collage data
  useEffect(() => {
    const loadCollage = async () => {
      if (!id) return

      try {
        const collageData = await getCollage(id)

        if (!collageData) {
          console.error('Collage not found:', id)
          navigate('/albums')
          return
        }

        setCollage(collageData)

        // Find layout
        const foundLayout = Object.values(LAYOUTS_V3).find(
          (l) => l.id === collageData.layoutId
        )

        if (foundLayout) {
          setLayout(foundLayout)
        } else {
          console.error('Layout not found:', collageData.layoutId)
        }

      } catch (error) {
        console.error('Error loading collage:', error)
        navigate('/albums')
      }
    }

    loadCollage()
  }, [id, getCollage, navigate])

  // Fetch photos for the collage
  useEffect(() => {
    if (!collage || !allPhotos) return

    const photos = collage.photoIds
      .map((photoId) => allPhotos.find((p) => p.id === photoId))
      .filter(Boolean)

    setCollagePhotos(photos)
  }, [collage, allPhotos])

  // Handle back navigation
  const location = useLocation()
  const handleBack = () => {
    // Use context-aware navigation if available, fallback to albums
    if (location.state?.from) {
      navigate(-1)
    } else {
      navigate('/albums')
    }
  }

  // Handle edit collage
  const handleEdit = () => {
    // Navigate to collage builder with edit mode
    setCurrentPage('collage')
    // TODO: Pass collage data to builder for editing
    navigate(`/collage/edit/${id}`)
  }

  // Handle share
  const handleShare = async () => {
    if (!collage || !layout || collagePhotos.length === 0) return

    try {
      // Generate collage image
      const blob = await renderCollageToCanvas({
        layout,
        photos: collagePhotos,
        transforms: collage.transforms || {},
        options: { quality: 0.9, useHighRes: true }
      })

      // Create File object for sharing
      const file = new File([blob], `${collage.title || 'collage'}.jpg`, {
        type: 'image/jpeg'
      })

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: collage.title || 'My Collage',
          text: `Check out my collage: ${collage.title}`,
          files: [file]
        })
      } else {
        // Fallback: Download the file
        downloadCollageBlob(blob, `${collage.title || 'collage'}.jpg`)
      }
    } catch (error) {
      console.error('Error sharing collage:', error)
    }
  }

  // Handle download
  const handleDownload = async () => {
    if (!collage || !layout || collagePhotos.length === 0) return

    setIsDownloading(true)

    try {
      // Generate high-res collage
      const blob = await renderCollageToCanvas({
        layout,
        photos: collagePhotos,
        transforms: collage.transforms || {},
        options: { quality: 0.95, useHighRes: true }
      })

      // Download
      downloadCollageBlob(blob, `${collage.title || 'collage'}.jpg`)
    } catch (error) {
      console.error('Error downloading collage:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle delete
  const handleDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: t('collage:delete.confirmTitle'),
      message: t('collage:delete.confirmMessage'),
      confirmText: t('collage:delete.confirmButton'),
      cancelText: t('common:cancel'),
      onConfirm: async () => {
        const success = await deleteCollage(id)
        if (success) {
          navigate('/albums')
        }
      }
    })
  }

  // Loading state
  if (isLoading || !collage || !layout || collagePhotos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-60">{t('collage:loading.collage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderBottom: '1px solid var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="ripple-effect p-2 rounded-lg transition"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-lg font-semibold">
                {collage.title || t('collage:untitled')}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                {collagePhotos.length} {t('collage:photos')}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="ripple-effect p-2 rounded-lg transition"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MoreVertical className="w-6 h-6" />
            </button>

            {/* Actions menu */}
            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-12 z-20 w-48 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden text-on-glass">
                  <button
                    onClick={() => {
                      handleEdit()
                      setShowActions(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <Edit className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">
                      {t('collage:actions.edit')}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      handleDownload()
                      setShowActions(false)
                    }}
                    disabled={isDownloading}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10 disabled:opacity-50"
                  >
                    <Download className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">
                      {isDownloading
                        ? t('collage:actions.downloading')
                        : t('collage:actions.download')}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      handleShare()
                      setShowActions(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10"
                  >
                    <Share2 className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium">
                      {t('collage:actions.share')}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      handleDelete()
                      setShowActions(false)
                    }}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 transition-colors border-t border-white/10 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-medium text-red-400">
                      {t('collage:actions.delete')}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 max-w-6xl mx-auto">
        {/* Collage preview */}
        <div className="mb-6">
          <CollagePreview
            photos={collagePhotos}
            layout={layout}
            transforms={collage.transforms || {}}
            className="shadow-2xl"
          />
        </div>

        {/* Metadata */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h3 className="text-sm font-semibold mb-4 opacity-60">
            {t('collage:metadata.title')}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Layout */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Grid3x3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs opacity-60">
                  {t('collage:metadata.layout')}
                </p>
                <p className="text-sm font-medium">
                  {t(layout.nameKey) || layout.name}
                </p>
              </div>
            </div>

            {/* Photos */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ImageIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs opacity-60">
                  {t('collage:metadata.photos')}
                </p>
                <p className="text-sm font-medium">
                  {collagePhotos.length} {t('collage:photos')}
                </p>
              </div>
            </div>

            {/* Resolution */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Maximize2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs opacity-60">
                  {t('collage:metadata.resolution')}
                </p>
                <p className="text-sm font-medium">
                  {layout.canvas.width} × {layout.canvas.height}px
                </p>
              </div>
            </div>

            {/* Created date */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs opacity-60">
                  {t('collage:metadata.created')}
                </p>
                <p className="text-sm font-medium">
                  {new Date(collage.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CollageView
