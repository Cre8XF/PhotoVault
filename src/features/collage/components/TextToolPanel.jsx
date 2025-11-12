import React, { useState } from 'react'
import { Type, Plus, Trash2 } from 'lucide-react'
import { FONT_FAMILIES, FONT_WEIGHTS, TEXT_COLORS } from '../utils/textUtils'

/**
 * Text tool panel for adding and editing text layers
 */
const TextToolPanel = ({ textLayers, onAddText, onUpdateText, onDeleteText }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newText, setNewText] = useState({
    text: '',
    fontSize: 48,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    color: '#FFFFFF',
    shadow: true,
    stroke: true
  })

  const handleAdd = () => {
    if (!newText.text.trim()) return

    onAddText({
      ...newText,
      x: 600, // Center horizontally (assuming 1200px canvas)
      y: 300, // Center vertically
      id: Date.now()
    })

    // Reset form
    setNewText({
      text: '',
      fontSize: 48,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#FFFFFF',
      shadow: true,
      stroke: true
    })
    setShowAddForm(false)
  }

  return (
    <div className="text-tool-panel">
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold">Tekst</h3>
      </div>

      {/* Add Text Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-4 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Legg til tekst</span>
        </button>
      )}

      {/* Add Text Form */}
      {showAddForm && (
        <div className="glass-card p-4 rounded-xl border border-white/10 mb-4">
          <h4 className="font-bold mb-3">Ny tekst</h4>

          <div className="space-y-3">
            {/* Text Input */}
            <div>
              <label className="text-sm opacity-70 block mb-1">Tekst</label>
              <input
                type="text"
                value={newText.text}
                onChange={(e) => setNewText({ ...newText, text: e.target.value })}
                placeholder="Skriv tekst..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 outline-none"
              />
            </div>

            {/* Font Size */}
            <div>
              <label className="text-sm opacity-70 block mb-1">
                Størrelse: {newText.fontSize}px
              </label>
              <input
                type="range"
                min="20"
                max="120"
                value={newText.fontSize}
                onChange={(e) => setNewText({ ...newText, fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="text-sm opacity-70 block mb-1">Skrift</label>
              <select
                value={newText.fontFamily}
                onChange={(e) => setNewText({ ...newText, fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Weight */}
            <div>
              <label className="text-sm opacity-70 block mb-1">Vekt</label>
              <select
                value={newText.fontWeight}
                onChange={(e) => setNewText({ ...newText, fontWeight: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                {FONT_WEIGHTS.map((weight) => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="text-sm opacity-70 block mb-1">Farge</label>
              <div className="grid grid-cols-5 gap-2">
                {TEXT_COLORS.map((colorObj) => (
                  <button
                    key={colorObj.value}
                    onClick={() => setNewText({ ...newText, color: colorObj.value })}
                    className={`
                      w-full aspect-square rounded-lg border-2 transition
                      ${newText.color === colorObj.value ? 'border-purple-500' : 'border-white/20'}
                    `}
                    style={{ backgroundColor: colorObj.value }}
                    title={colorObj.label}
                  />
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newText.shadow}
                  onChange={(e) => setNewText({ ...newText, shadow: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Skygge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newText.stroke}
                  onChange={(e) => setNewText({ ...newText, stroke: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Outline</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newText.text.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
              >
                Legg til
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Text Layers */}
      {textLayers && textLayers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm opacity-70 mb-2">
            {textLayers.length} tekst{textLayers.length !== 1 ? 'er' : ''}
          </p>
          {textLayers.map((layer) => (
            <div
              key={layer.id}
              className="glass-card p-3 rounded-lg border border-white/10 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="font-medium truncate">{layer.text}</p>
                <p className="text-xs opacity-50">
                  {layer.fontSize}px {layer.fontFamily}
                </p>
              </div>
              <button
                onClick={() => onDeleteText(layer.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition"
                title="Slett tekst"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {textLayers && textLayers.length === 0 && !showAddForm && (
        <p className="text-sm opacity-50 text-center py-4">
          Ingen tekst lagt til ennå
        </p>
      )}
    </div>
  )
}

export default TextToolPanel
