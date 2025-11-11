import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePublicAlbum } from '../features/qr-sharing/hooks/usePublicAlbum'
import { trackPublicView } from '../features/qr-sharing/utils/analytics'
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'
import PhotoModal from '../components/PhotoModal'
import UploadModal from '../components/UploadModal'

const PublicAlbumPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { album, photos, loading, error } = usePublicAlbum(slug)
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 })
  const [uploadOpen, setUploadOpen] = useState(false)

  // Track analytics when album loads
  useEffect(() => {
    if (album && slug) {
      trackPublicView(slug, document.referrer)
    }
  }, [album, slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="opacity-70">Laster album...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-600/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Album ikke tilgjengelig</h2>
          <p className="opacity-70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition"
          >
            Gå til forsiden
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{album.name}</h1>
              <p className="text-sm opacity-70">{photos.length} bilder</p>
            </div>
          </div>

          {album.publicSettings?.allowUpload && (
            <button
              onClick={() => setUploadOpen(true)}
              className="ripple-effect px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition flex items-center gap-2"
            >
              <Upload size={18} />
              Last opp
            </button>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="container mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="opacity-70">Ingen bilder i dette albumet ennå</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setPhotoModal({ open: true, index })}
                className="relative aspect-square bg-black/10 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {photoModal.open && (
        <PhotoModal
          photos={photos}
          currentIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
          readOnly={true}
        />
      )}

      {/* Upload Modal */}
      {album.publicSettings?.allowUpload && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          albumId={album.id}
          publicMode={true}
        />
      )}

      {/* Info banner */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-card border-t border-white/20">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Liker du PhotoVault?</p>
            <p className="text-xs opacity-70">Lag din egen konto gratis</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="ripple-effect px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition text-sm font-medium"
          >
            Registrer deg
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicAlbumPage
