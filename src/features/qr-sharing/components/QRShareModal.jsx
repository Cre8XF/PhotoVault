import React, { useState, useEffect } from 'react'
import { X, Share2, Globe, Lock, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QRCodeDisplay from './QRCodeDisplay'
import { generatePublicSlug, getPublicAlbumUrl } from '../utils/generatePublicSlug'
import { doc, updateDoc, getFirestore } from 'firebase/firestore'
import useAuth from '../../../hooks/useAuth'

const QRShareModal = ({ isOpen, onClose, album }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [publicUrl, setPublicUrl] = useState('')
  const [shareSettings, setShareSettings] = useState({
    isPublic: album.isPublic || false,
    allowUpload: false,
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
    // Debug logging
    console.log('🔍 DEBUG - generateAndSaveSlug called')
    console.log('User object:', user)
    console.log('User UID:', user?.uid)
    console.log('Album:', album)

    if (!user || !user.uid) {
      console.error('❌ ERROR: User or user.uid is undefined')
      alert('Bruker ikke lastet. Vent litt og prøv igjen.')
      return
    }

    setLoading(true)
    try {
      const slug = generatePublicSlug(album.name)
      const url = getPublicAlbumUrl(slug)

      console.log('✅ Generated slug:', slug)
      console.log('✅ Generated URL:', url)

      // Lagre til Firestore
      const db = getFirestore()
      const albumRef = doc(db, `users/${user.uid}/albums/${album.id}`)

      console.log('📝 Saving to Firestore path:', `users/${user.uid}/albums/${album.id}`)

      await updateDoc(albumRef, {
        publicSlug: slug,
        isPublic: true,
        publicSettings: shareSettings,
        sharedAt: new Date().toISOString(),
      })

      console.log('✅ Successfully saved to Firestore')
      setPublicUrl(url)
    } catch (error) {
      console.error('❌ Error generating slug:', error)
      alert('Kunne ikke generere delingslenke: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = () => {
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
      return true
    } catch (error) {
      console.error('Copy failed:', error)
      return false
    }
  }

  const handleTogglePublic = async () => {
    console.log('🔍 DEBUG - handleTogglePublic called')
    console.log('User UID:', user?.uid)

    if (!user || !user.uid) {
      console.error('❌ ERROR: User or user.uid is undefined')
      alert('Bruker ikke lastet. Vent litt og prøv igjen.')
      return
    }

    setLoading(true)
    try {
      const db = getFirestore()
      const albumRef = doc(db, `users/${user.uid}/albums/${album.id}`)

      const newPublicState = !shareSettings.isPublic

      console.log('📝 Toggling public to:', newPublicState)

      await updateDoc(albumRef, {
        isPublic: newPublicState,
        'publicSettings.allowUpload': shareSettings.allowUpload,
      })

      console.log('✅ Successfully toggled public state')

      setShareSettings(prev => ({ ...prev, isPublic: newPublicState }))
    } catch (error) {
      console.error('❌ Error toggling public:', error)
      alert('Kunne ikke oppdatere innstillinger: ' + error.message)
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
            <p className="opacity-70">Laster brukerdata...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl shadow-2xl border border-white/20
                    bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl
                    max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Share2 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">Del album</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 border-b border-white/10 space-y-4">
          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium">Offentlig tilgjengelig</p>
                <p className="text-sm opacity-70">
                  Alle med lenken kan se albumet
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium">Tillat opplasting</p>
                <p className="text-sm opacity-70">
                  Andre kan laste opp bilder
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={shareSettings.allowUpload}
                onChange={() => setShareSettings(prev => ({
                  ...prev,
                  allowUpload: !prev.allowUpload
                }))}
                disabled={!shareSettings.isPublic || loading}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-600 rounded-full peer-checked:bg-green-600 transition peer-disabled:opacity-50"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6"></div>
            </label>
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
          <div className="p-6 bg-blue-600/10 border-t border-white/10">
            <p className="text-sm opacity-70">
              💡 <strong>Tips:</strong> Print QR-koden og vis på event-lokalet,
              eller del lenken i sosiale medier.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRShareModal
