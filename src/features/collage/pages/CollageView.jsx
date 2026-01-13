import React, { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

// Hooks
import usePhotoData from '../../../hooks/usePhotoData'

const CollageView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['collage', 'common'])

  // Load collage from photos collection
  const { photos } = usePhotoData()
  const collage = photos.find((p) => p.id === id && p.isCollage === true)

  // 📍 DIAGNOSTIC: Log component mount
  useEffect(() => {
    console.log('📍 [CollageView] mounted', {
      pathname: window.location.pathname,
      params: { id },
      collageFound: !!collage,
      timestamp: new Date().toISOString(),
    })
  }, [id, collage])

  // Handle back navigation with returnPath support
  const handleBack = () => {
    const returnPath = location.state?.returnPath || '/albums'
    navigate(returnPath)
  }

  // Render guard: collage not found
  if (!collage) {
    console.warn('⛔ [CollageView] Photo-collage not found', id)
    return null
  }

  // Render collage as simple image view
  const imageUrl = collage.displayUrl || collage.url

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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
                {collage.name || t('collage:untitled')}
              </h1>
              <p className="text-xs opacity-50">Collage</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Simple image display */}
      <main className="p-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <img
            src={imageUrl}
            alt={collage.name || 'Collage'}
            className="w-full rounded-xl shadow-2xl"
          />
        </div>
      </main>
    </div>
  )
}

export default CollageView
