import React, { useState, useEffect } from 'react'
import { X, Download, ArrowLeft, Loader, Image as ImageIcon, Type, Smile } from 'lucide-react'
import { getAllLayouts } from '../layouts/gridLayouts'
import { useCollageCanvas } from '../hooks/useCollageCanvas'
import LayoutSelector from './LayoutSelector'
import PhotoSelector from './PhotoSelector'
import TextToolPanel from './TextToolPanel'
import StickerPanel from './StickerPanel'

/**
 * Main collage builder component - full-screen editor
 * Three-step workflow: Layout → Photos → Preview/Edit
 */
const CollageBuilder = ({ availablePhotos, onClose, onSave }) => {
  const [step, setStep] = useState(1) // 1: layout, 2: photos, 3: preview
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [saving, setSaving] = useState(false)

  // Phase 2: Text and Sticker layers
  const [textLayers, setTextLayers] = useState([])
  const [stickerLayers, setStickerLayers] = useState([])
  const [activeTab, setActiveTab] = useState('edit') // 'edit', 'text', 'stickers'

  const layouts = getAllLayouts()

  // Initialize canvas hook with text and sticker layers
  const {
    canvasRef,
    exportCollageBlob,
    downloadCollage,
    loading,
    error
  } = useCollageCanvas(selectedLayout, selectedPhotos, textLayers, stickerLayers, {
    backgroundColor: '#ffffff',
    spacing: 0,
    showPlaceholders: true
  })

  // Auto-advance to preview when photos are selected
  // Only auto-advance if we're at step 2 and just completed photo selection
  useEffect(() => {
    if (selectedLayout && selectedPhotos.length === selectedLayout.slots && step === 2) {
      console.log('🚀 Auto-advancing to preview (all photos selected)')
      setStep(3)
    }
  }, [selectedPhotos.length, selectedLayout?.slots, step])

  const handleLayoutSelect = (layout) => {
    setSelectedLayout(layout)
    setSelectedPhotos([])
    setStep(2)
    console.log('✅ Layout selected:', layout.name)
  }

  const handlePhotoSelection = (photos) => {
    setSelectedPhotos(photos)
  }

  const handleSave = async () => {
    if (!selectedLayout || selectedPhotos.length === 0 || saving) return

    try {
      setSaving(true)
      console.log('💾 Saving collage...')
      console.log('📊 Layout:', selectedLayout.name)
      console.log('📷 Photos:', selectedPhotos.length)

      // Export as blob
      const blob = await exportCollageBlob('png', 0.95)

      if (!blob) {
        throw new Error('Failed to export collage')
      }

      console.log('📦 Blob created:', blob.size, 'bytes', blob.type)

      // Convert Blob to File (THIS IS THE FIX - uploadPhoto expects File, not Blob)
      const filename = `collage_${Date.now()}.png`
      const file = new File([blob], filename, {
        type: 'image/png',
        lastModified: Date.now()
      })

      console.log('📄 File created:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })

      // Verify file has type property (required by uploadPhoto)
      if (!file.type) {
        throw new Error('File object missing type property')
      }

      // Call parent save handler with File object
      await onSave(file, {
        layout: selectedLayout.name,
        photoCount: selectedPhotos.length,
        type: 'collage'
      })

      console.log('✅ Collage saved successfully')

      // Small delay so user sees success notification
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      console.error('❌ Error saving collage:', err)
      alert('Kunne ikke lagre kollasjen. Prøv igjen.')
      setSaving(false)
    }
  }

  const handleDownload = () => {
    const filename = `kollasj_${Date.now()}.png`
    downloadCollage(filename, 'png', 0.95)
  }

  const handleChangePhotos = () => {
    console.log('🔄 Going back to photo selection')
    // Clear selected photos to force user to reselect
    // This prevents auto-advance flicker
    setSelectedPhotos([])
    setStep(2)
  }

  // Phase 2: Text layer handlers
  const handleAddText = (textData) => {
    setTextLayers([...textLayers, textData])
    console.log('✅ Text layer added:', textData)
  }

  const handleUpdateText = (id, updates) => {
    setTextLayers(textLayers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    ))
  }

  const handleDeleteText = (id) => {
    setTextLayers(textLayers.filter(layer => layer.id !== id))
    console.log('🗑️ Text layer deleted:', id)
  }

  // Phase 2: Sticker layer handlers
  const handleAddSticker = (stickerData) => {
    setStickerLayers([...stickerLayers, stickerData])
    console.log('✅ Sticker added:', stickerData)
  }

  const handleDeleteSticker = (id) => {
    setStickerLayers(stickerLayers.filter(layer => layer.id !== id))
    console.log('🗑️ Sticker deleted:', id)
  }

  const canSave = selectedLayout && selectedPhotos.length > 0 && !loading && !saving

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 glass-card border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Lag kollasj</h1>
            <p className="text-sm opacity-70">
              {step === 1 && 'Steg 1: Velg layout'}
              {step === 2 && 'Steg 2: Velg bilder'}
              {step === 3 && 'Steg 3: Forhåndsvisning'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {step === 3 && (
            <>
              <button
                onClick={handleDownload}
                disabled={!canSave}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Last ned</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!canSave}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">Lagrer...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Lagre</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-80 glass-card border-r border-white/10 overflow-y-auto p-4">
          {step === 1 && (
            <LayoutSelector
              layouts={layouts}
              selectedLayout={selectedLayout}
              onSelect={handleLayoutSelect}
            />
          )}

          {step === 2 && selectedLayout && (
            <PhotoSelector
              photos={availablePhotos}
              maxPhotos={selectedLayout.slots}
              selectedPhotos={selectedPhotos}
              onSelect={handlePhotoSelection}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && selectedLayout && (
            <div>
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`flex-1 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                    activeTab === 'edit'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Rediger</span>
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                    activeTab === 'text'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span className="text-sm font-medium">Tekst</span>
                </button>
                <button
                  onClick={() => setActiveTab('stickers')}
                  className={`flex-1 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                    activeTab === 'stickers'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Smile className="w-4 h-4" />
                  <span className="text-sm font-medium">Stickers</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'edit' && (
                <div>
                  <button
                    onClick={handleChangePhotos}
                    disabled={saving}
                    className="w-full mb-4 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Endre bilder</span>
                  </button>

                  <div className="glass-card p-4 rounded-xl border border-white/10 mb-4">
                    <h3 className="font-bold mb-2">Layout info</h3>
                    <p className="text-sm opacity-70">{selectedLayout.name}</p>
                    <p className="text-sm opacity-70">{selectedPhotos.length} bilder</p>
                    <p className="text-xs opacity-50 mt-2">
                      {selectedLayout.canvas.width} × {selectedLayout.canvas.height}px
                    </p>
                  </div>

                  <div className="glass-card p-4 rounded-xl border border-white/10">
                    <h3 className="font-bold mb-2">Tips</h3>
                    <ul className="text-sm opacity-70 space-y-1">
                      <li>• Trykk "Last ned" for å lagre lokalt</li>
                      <li>• Trykk "Lagre" for å legge til i album</li>
                      <li>• Bruk "Endre bilder" for å bytte bilder</li>
                      <li>• Legg til tekst og stickers med fanene over</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'text' && (
                <TextToolPanel
                  textLayers={textLayers}
                  onAddText={handleAddText}
                  onUpdateText={handleUpdateText}
                  onDeleteText={handleDeleteText}
                />
              )}

              {activeTab === 'stickers' && (
                <StickerPanel
                  stickerLayers={stickerLayers}
                  onAddSticker={handleAddSticker}
                  onDeleteSticker={handleDeleteSticker}
                />
              )}
            </div>
          )}
        </div>

        {/* Canvas Preview */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8 overflow-auto">
          {step === 1 && (
            <div className="text-center opacity-70">
              <ImageIcon className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Velg en layout</h3>
              <p className="text-sm">Velg en layout fra menyen til venstre for å starte</p>
            </div>
          )}

          {step >= 2 && selectedLayout && (
            <div className="relative max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full shadow-2xl rounded-lg"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />

              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-3 text-purple-400" />
                    <p className="text-sm">Laster bilder...</p>
                  </div>
                </div>
              )}

              {/* Saving overlay */}
              {saving && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg z-10">
                  <div className="text-center glass-card p-6 rounded-xl">
                    <Loader className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-400" />
                    <h3 className="font-bold text-lg mb-2">Lagrer kollasj...</h3>
                    <p className="text-sm opacity-70">Laster opp til Firebase Storage</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center glass-card p-6 rounded-xl max-w-sm">
                    <X className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h3 className="font-bold mb-2">Feil</h3>
                    <p className="text-sm opacity-70">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-4 py-2 glass-card border-t border-white/10">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-purple-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CollageBuilder
