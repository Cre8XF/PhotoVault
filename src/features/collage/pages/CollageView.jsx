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
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-[10000] h-14 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-full p-2 hover:bg-white/10 transition active:scale-95"
            aria-label={t('common:back')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 text-center px-4">
            <h1 className="text-sm font-medium truncate">
              {collage.name || t('collage:untitled')}
            </h1>
            <p className="text-xs text-gray-400">Collage</p>
          </div>

          {/* Right side spacer for balance */}
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main content - Edge-to-edge image display */}
      <main className="flex-1 flex items-center justify-center p-0">
        <img
          src={imageUrl}
          alt={collage.name || 'Collage'}
          className="max-w-full max-h-[100vh] object-contain"
          draggable={false}
        />
      </main>
    </div>
  )
}

export default CollageView
