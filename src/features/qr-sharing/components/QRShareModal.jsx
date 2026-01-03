import React, { useState, useEffect } from 'react'
import { X, Share2, Globe, Lock, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QRCodeDisplay from './QRCodeDisplay'
import {
  generatePublicSlug,
  getPublicAlbumUrl,
} from '../utils/generatePublicSlug'
import { doc, setDoc, getFirestore, deleteField } from 'firebase/firestore'
import useAuth from '../../../hooks/useAuth'
import {
  trackQRGenerated,
  trackQRDownload,
  trackLinkCopied,
  trackSharingToggled,
} from '../utils/analytics'


const QRShareModal = ({ isOpen, onClose, album }) => {
  const { t } = useTranslation(['qrshare', 'common'])
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [publicUrl, setPublicUrl] = useState('')
  const [shareSettings, setShareSettings] = useState({
    isPublic: !!album.isPublic,
    allowUpload: !!album?.publicSettings?.allowUpload,
    expiresAt: null,
  })

  useEffect(() => {
    if (isOpen && album) {
      if (album.publicSlug) {
        // Album allerede delt
        setPublicUrl(getPublicAlbumUrl(album.publicSlug))
      } else {
        // Generer ny slug
        generateAndSaveSlug()
      }
    }
  }, [isOpen, album])

  const generateAndSaveSlug = async () => {
    if (!user || !user.uid) {
      console.error('❌ ERROR: User not loaded')
      alert(t('qrshare:errors.userNotLoaded'))
      return
    }

    setLoading(true)
    try {
      const slug = generatePublicSlug(album.name)
      const url = getPublicAlbumUrl(slug)

      if (import.meta.env.DEV) console.log('✅ Generated slug:', slug)
      if (import.meta.env.DEV) console.log('✅ Generated URL:', url)

      // Lagre til Firestore
      const db = getFirestore()
      const albumRef = doc(db, `albums/${album.id}`)

      if (import.meta.env.DEV) console.log('📝 Saving to Firestore path:', `albums/${album.id}`)

     await setDoc(
  albumRef,
  {
    publicSlug: slug,
    isPublic: true,
    sharedAt: new Date().toISOString(),
    publicSettings: {
      allowUpload: shareSettings.allowUpload,
      expiresAt: shareSettings.expiresAt,
    },
    // rydder bort gammel struktur
    'publicSettings.isPublic': deleteField(),
  },
  { merge: true }
)


      if (import.meta.env.DEV) console.log('✅ Successfully saved to Firestore')
      setPublicUrl(url)

      // Track analytics
      trackQRGenerated(album.id, user.uid)
    } catch (error) {
      console.error('❌ Error generating slug:', error)
      alert(t('qrshare:errors.generateFailed') + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = () => {
    // Track analytics
    trackQRDownload(album.id, album.name)

    // Konverter SVG til PNG og last ned
    const svg = document.querySelector('#qr-code-svg')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const img = new Image()
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        const link = document.createElement('a')
        link.download = `${album.name}-qr-code.png`
        link.href = URL.createObjectURL(blob)
        link.click()
      })

      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)

      // Track analytics
      trackLinkCopied(album.id, publicUrl)

      return true
    } catch (error) {
      console.error('Copy failed:', error)
      return false
    }
  }

  const handleTogglePublic = async () => {
    if (!user || !user.uid) {
      console.error('❌ ERROR: User not loaded')
      alert(t('qrshare:errors.userNotLoaded'))
      return
    }

    setLoading(true)
    try {
      const db = getFirestore()
      const albumRef = doc(db, `albums/${album.id}`)

      const newPublicState = !shareSettings.isPublic

      if (import.meta.env.DEV) console.log('📝 Toggling public to:', newPublicState)
      if (import.meta.env.DEV) console.log('📝 Saving to Firestore path:', `albums/${album.id}`)

      await setDoc(
        albumRef,
        {
          isPublic: newPublicState, // Top-level field only
          publicSettings: {
            allowUpload: shareSettings.allowUpload,
            expiresAt: shareSettings.expiresAt,
          },
          // Clean up any old nested isPublic field
          'publicSettings.isPublic': deleteField(),
        },
        { merge: true }
      )

      if (import.meta.env.DEV) console.log('✅ Successfully toggled public state')

      setShareSettings((prev) => ({ ...prev, isPublic: newPublicState }))

      // Track analytics
      trackSharingToggled(album.id, newPublicState)
    } catch (error) {
      console.error('❌ Error toggling public:', error)
      alert(t('qrshare:errors.updateFailed') + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Show loading if user is not ready yet
  if (!user) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="opacity-70">{t('qrshare:loading.userData')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl shadow-2xl border border-white/20
                    bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl
                    max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-purple-600/20 rounded-lg">
              <Share2 className="w-4 h-4 md:w-5 md:h-5 text-purple" />
            </div>
            <h2 className="text-lg md:text-xl font-bold">{t('qrshare:modal.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Settings */}
        <div className="p-4 md:p-6 border-b border-white/10 space-y-3 md:space-y-4">
          {/* Public toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base">{t('qrshare:settings.public.title')}</p>
                <p className="text-xs md:text-sm opacity-70 truncate">
                  {t('qrshare:settings.public.description')}
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6 flex-shrink-0">
              <input
                type="checkbox"
                checked={shareSettings.isPublic}
                onChange={handleTogglePublic}
                disabled={loading}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-600 rounded-full peer-checked:bg-purple-600 transition"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6"></div>
            </label>
          </div>

          {/* Allow upload toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Lock className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base">{t('qrshare:settings.upload.title')}</p>
                <p className="text-xs md:text-sm opacity-70 truncate">{t('qrshare:settings.upload.description')}</p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6 flex-shrink-0">
              <input
                type="checkbox"
                checked={shareSettings.allowUpload}
                onChange={() =>
                  setShareSettings((prev) => ({
                    ...prev,
                    allowUpload: !prev.allowUpload,
                  }))
                }
                disabled={!shareSettings.isPublic || loading}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-600 rounded-full peer-checked:bg-green-600 transition peer-disabled:opacity-50"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6"></div>
            </label>
          </div>

          {/* Expiry date */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base">{t('qrshare:settings.expiry.title')}</p>
                <p className="text-xs md:text-sm opacity-70 truncate">{t('qrshare:settings.expiry.description')}</p>
              </div>
            </div>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={shareSettings.expiresAt || ''}
              onChange={(e) =>
                setShareSettings((prev) => ({
                  ...prev,
                  expiresAt: e.target.value,
                }))
              }
              disabled={!shareSettings.isPublic || loading}
              className="px-2 py-1.5 md:px-3 md:py-2 bg-white/5 border border-white/10 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 flex-shrink-0"
            />
          </div>
        </div>

        {/* QR Code Display */}
        {shareSettings.isPublic && publicUrl && (
          <QRCodeDisplay
            url={publicUrl}
            albumName={album.name}
            onDownload={handleDownloadQR}
            onCopyLink={handleCopyLink}
          />
        )}

        {/* Info */}
        {shareSettings.isPublic && (
          <div className="p-4 md:p-6 bg-blue-600/10 border-t border-white/10">
            <p className="text-xs md:text-sm opacity-70" dangerouslySetInnerHTML={{
              __html: t('qrshare:info.tip')
            }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default QRShareModal
