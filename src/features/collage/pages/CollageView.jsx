import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Calendar,
} from 'lucide-react'

// Hooks and utilities
import useCollageData from '../../../hooks/useCollageData'
import usePhotoData from '../../../hooks/usePhotoData'
import {
  renderCollageToCanvas,
  downloadCollageBlob,
} from '../../../utils/renderCollageToCanvas'
import { LAYOUTS_V3 } from '../layouts/layouts_v3'
import { getTemplateById, expandTemplate } from '../templateEngine'

// Components
import CollagePreview from '../components/CollagePreview'
import useStore from '../../../state/store'

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

        // Resolve layout from collage data (supports both v1 and v2)
        let resolvedLayout = null

        // V2 (template-based): Use templateId to get template, then extract layout
        if (collageData.templateId) {
          console.log(
            'Loading collage with templateId:',
            collageData.templateId
          )
          const template = getTemplateById(collageData.templateId)

          if (template) {
            try {
              // Expand template to get slots
              const expanded = expandTemplate(template)

              console.log('Expanded template:', expanded)
              console.log('Expanded slots:', expanded.slots)

              // Defensive check: ensure slots exist and are an array
              const safeSlots = Array.isArray(expanded.slots)
                ? expanded.slots
                : []

              if (safeSlots.length > 0) {
                // Calculate grid dimensions from slots
                const maxRow = Math.max(
                  ...safeSlots.map((s) => s.row + s.rowSpan - 1)
                )
                const maxCol = Math.max(
                  ...safeSlots.map((s) => s.col + s.colSpan - 1)
                )

                // Convert template format to layout format expected by CollagePreview
                resolvedLayout = {
                  id: expanded.id,
                  name: expanded.name,
                  nameKey: expanded.nameKey,
                  aspectRatio: expanded.aspectRatio,
                  minPhotos: expanded.minPhotos || 2,
                  maxPhotos: expanded.maxPhotos || 2,
                  slots: safeSlots,
                  grid: {
                    desktop: `repeat(${maxRow}, 1fr) / repeat(${maxCol}, 1fr)`,
                    mobile: `repeat(${maxRow}, 1fr) / repeat(${maxCol}, 1fr)`,
                  },
                  gap: expanded.gap || 8,
                  padding: expanded.padding || 0,
                }

                if (import.meta.env.DEV) {
                  console.log('Resolved layout with', safeSlots.length, 'slots')
                }
              } else {
                console.warn('Expanded template has no slots:', expanded)
                // Create minimal layout as fallback
                resolvedLayout = {
                  id: expanded.id,
                  name: expanded.name,
                  aspectRatio: expanded.aspectRatio || 1,
                  slots: [],
                  grid: { desktop: 'repeat(2, 1fr)', mobile: 'repeat(2, 1fr)' },
                  gap: 8,
                  padding: 0,
                }
              }
            } catch (error) {
              console.error('Error expanding template:', error)
            }
          } else {
            console.error(
              'Template not found for templateId:',
              collageData.templateId
            )
          }
        }

        // V1 (legacy): Use layoutId to find layout in LAYOUTS_V3
        if (!resolvedLayout && collageData.layoutId) {
          resolvedLayout = Object.values(LAYOUTS_V3).find(
            (l) => l.id === collageData.layoutId
          )

          if (import.meta.env.DEV && resolvedLayout) {
            console.log('Resolved layout from layoutId:', collageData.layoutId)
          }
        }

        // Fallback: Use collage.layout field if present
        if (!resolvedLayout && collageData.layout) {
          resolvedLayout = collageData.layout

          if (import.meta.env.DEV) {
            console.log('Using layout from collage.layout field')
          }
        }

        // Final fallback: Create minimal layout
        if (!resolvedLayout) {
          console.warn('Could not resolve layout, using fallback')
          resolvedLayout = {
            id: 'fallback',
            name: 'Grid Layout',
            aspectRatio: 1,
            slots: [],
            grid: { desktop: 'repeat(2, 1fr)', mobile: 'repeat(2, 1fr)' },
            gap: 8,
            padding: 0,
          }
        }

        setLayout(resolvedLayout)
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

    // Defensive: ensure photoIds exists and is an array
    const photoIds = Array.isArray(collage.photoIds) ? collage.photoIds : []

    const photos = photoIds
      .map((photoId) => allPhotos.find((p) => p.id === photoId))
      .filter(Boolean)

    setCollagePhotos(photos)

    if (import.meta.env.DEV) {
      console.log('Loaded', photos.length, 'photos for collage')
    }
  }, [collage, allPhotos])

  // Set current page
  useEffect(() => {
    setCurrentPage('collage-view')
    return () => setCurrentPage(null)
  }, [setCurrentPage])

  // Handle back navigation
  const handleBack = () => {
    navigate('/albums')
  }

  // Handle edit collage
  const handleEdit = () => {
    setCurrentPage('collage')
    navigate(`/collage/edit/${id}`)
  }

  // Handle download
  const handleDownload = async () => {
    if (!collage || !layout || collagePhotos.length === 0) {
      console.warn('Cannot download: missing collage, layout, or photos')
      return
    }

    try {
      setIsDownloading(true)

      const blob = await renderCollageToCanvas({
        layout,
        photos: collagePhotos,
        transforms: collage.transforms || {},
        options: { quality: 0.95, useHighRes: true },
      })

      downloadCollageBlob(blob, `${collage.title || 'collage'}.jpg`)
    } catch (error) {
      console.error('Error downloading collage:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    if (!collage || !layout || collagePhotos.length === 0) {
      console.warn('Cannot share: missing collage, layout, or photos')
      return
    }

    try {
      const blob = await renderCollageToCanvas({
        layout,
        photos: collagePhotos,
        transforms: collage.transforms || {},
        options: { quality: 0.9, useHighRes: true },
      })

      const file = new File([blob], `${collage.title || 'collage'}.jpg`, {
        type: 'image/jpeg',
      })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: collage.title || 'My Collage',
          text: `Check out my collage: ${collage.title}`,
          files: [file],
        })
      } else {
        downloadCollageBlob(blob, `${collage.title || 'collage'}.jpg`)
      }
    } catch (error) {
      console.error('Error sharing collage:', error)
    }
  }

  // Handle delete
  const handleDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: t('collage:delete.title'),
      message: t('collage:delete.message'),
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteCollage(id)
          navigate('/albums')
        } catch (error) {
          console.error('Error deleting collage:', error)
        }
      },
    })
  }

  // Loading state
  if (isLoading || !collage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-60">{t('collage:loading.collage')}</p>
        </div>
      </div>
    )
  }

  // Error state: Layout could not be resolved
  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3x3 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Layout Missing</h2>
          <p className="text-sm opacity-70 mb-6">
            This collage's layout could not be loaded. The template may have
            been removed.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {t('common:back')}
          </button>
        </div>
      </div>
    )
  }

  // Defensive: Ensure slots is always an array
  const safeSlots = Array.isArray(layout.slots) ? layout.slots : []

  // Error state: No photos loaded
  if (collagePhotos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-60">{t('collage:loading.photos')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={t('common:back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">
                {collage.title || t('collage:untitled')}
              </h1>
            </div>
          </div>

          {/* Right: Actions menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Actions"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Actions dropdown */}
            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-2xl z-40">
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
                  {layout.nameKey ? t(layout.nameKey) : layout.name || 'Custom'}
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

            {/* Resolution - only show if canvas data exists */}
            {layout.canvas?.width && layout.canvas?.height && (
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
            )}

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
