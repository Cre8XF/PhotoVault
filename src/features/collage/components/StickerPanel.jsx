import React, { useState } from 'react'
import { Smile, Trash2 } from 'lucide-react'
import { getStickerCategories, STICKER_SIZES } from '../utils/stickers'

/**
 * Sticker panel for adding emoji stickers to collage
 */
const StickerPanel = ({ stickerLayers, onAddSticker, onDeleteSticker }) => {
  const [selectedCategory, setSelectedCategory] = useState('hearts')
  const [selectedSize, setSelectedSize] = useState(64)

  const categories = getStickerCategories()
  const currentCategory = categories.find((cat) => cat.id === selectedCategory)

  const handleStickerClick = (emoji) => {
    onAddSticker({
      emoji,
      size: selectedSize,
      x: 600, // Center horizontally (assuming 1200px canvas)
      y: 300, // Center vertically
      rotation: 0,
      id: Date.now()
    })
  }

  return (
    <div className="sticker-panel">
      <div className="flex items-center gap-2 mb-4">
        <Smile className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold">Stickers</h3>
      </div>

      {/* Size Selector */}
      <div className="mb-4">
        <label className="text-sm opacity-70 block mb-2">Størrelse</label>
        <div className="grid grid-cols-4 gap-2">
          {STICKER_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => setSelectedSize(size.value)}
              className={`
                px-3 py-2 rounded-lg transition text-sm
                ${
                  selectedSize === size.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-3 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-3 py-2 rounded-lg transition whitespace-nowrap text-sm flex items-center gap-1
                ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticker Grid */}
      <div className="glass-card p-3 rounded-xl border border-white/10 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {currentCategory && currentCategory.items.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleStickerClick(emoji)}
              className="aspect-square flex items-center justify-center text-4xl hover:bg-white/10 rounded-lg transition hover:scale-110"
              title="Legg til sticker"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Added Stickers List */}
      {stickerLayers && stickerLayers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm opacity-70 mb-2">
            {stickerLayers.length} sticker{stickerLayers.length !== 1 ? 's' : ''}
          </p>
          {stickerLayers.map((layer) => (
            <div
              key={layer.id}
              className="glass-card p-3 rounded-lg border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{layer.emoji}</span>
                <div>
                  <p className="text-sm opacity-70">{layer.size}px</p>
                </div>
              </div>
              <button
                onClick={() => onDeleteSticker(layer.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition"
                title="Slett sticker"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {stickerLayers && stickerLayers.length === 0 && (
        <p className="text-sm opacity-50 text-center py-4">
          Ingen stickers lagt til ennå
        </p>
      )}
    </div>
  )
}

export default StickerPanel
