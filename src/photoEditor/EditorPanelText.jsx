/**
 * EditorPanelText.jsx
 * Text overlay tool with draggable text, font settings, and styling
 */
import React, { useState } from 'react'
import { Plus, Trash2, Bold, Italic } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EditorPanelText = ({ textLayers, onTextLayersChange, canvasDimensions }) => {
  const { t } = useTranslation(['editor'])
  const [selectedLayerId, setSelectedLayerId] = useState(null)

  const selectedLayer = textLayers.find(layer => layer.id === selectedLayerId)

  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Impact',
    'Comic Sans MS'
  ]

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
  ]

  const addTextLayer = () => {
    const newLayer = {
      id: `text-${Date.now()}`,
      text: t('editor:text.newText'),
      x: canvasDimensions ? canvasDimensions.width / 2 : 200,
      y: canvasDimensions ? canvasDimensions.height / 2 : 200,
      size: 40,
      font: 'Arial',
      color: '#ffffff',
      bold: false,
      italic: false,
      strokeWidth: 0,
      strokeColor: '#000000',
      shadow: false
    }

    onTextLayersChange([...textLayers, newLayer])
    setSelectedLayerId(newLayer.id)
  }

  const updateLayer = (updates) => {
    if (!selectedLayer) return

    const updatedLayers = textLayers.map(layer =>
      layer.id === selectedLayerId ? { ...layer, ...updates } : layer
    )

    onTextLayersChange(updatedLayers)
  }

  const deleteLayer = (layerId) => {
    const updatedLayers = textLayers.filter(layer => layer.id !== layerId)
    onTextLayersChange(updatedLayers)

    if (selectedLayerId === layerId) {
      setSelectedLayerId(null)
    }
  }

  return (
    <div className="editor-panel">
      <div className="editor-panel-header">
        <h3 className="editor-panel-title">{t('editor:text.title')}</h3>
        <p className="editor-panel-subtitle">{t('editor:text.subtitle')}</p>
      </div>

      {/* Add Text Button */}
      <div className="editor-panel-section">
        <button
          onClick={addTextLayer}
          className="editor-btn editor-btn-primary editor-btn-full"
        >
          <Plus className="w-5 h-5" />
          <span>{t('editor:text.addText')}</span>
        </button>
      </div>

      {/* Text Layers List */}
      {textLayers.length > 0 && (
        <div className="editor-panel-section">
          <label className="editor-label">{t('editor:text.layers')}</label>
          <div className="editor-text-layers">
            {textLayers.map((layer) => (
              <div
                key={layer.id}
                className={`editor-text-layer ${selectedLayerId === layer.id ? 'active' : ''}`}
                onClick={() => setSelectedLayerId(layer.id)}
              >
                <span className="editor-text-layer-preview">{layer.text}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteLayer(layer.id)
                  }}
                  className="editor-text-layer-delete"
                  aria-label={t('editor:text.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text Editor */}
      {selectedLayer && (
        <>
          {/* Text Input */}
          <div className="editor-panel-section">
            <label className="editor-label">{t('editor:text.textContent')}</label>
            <input
              type="text"
              value={selectedLayer.text}
              onChange={(e) => updateLayer({ text: e.target.value })}
              className="editor-input"
              placeholder={t('editor:text.placeholder')}
            />
          </div>

          {/* Font Family */}
          <div className="editor-panel-section">
            <label className="editor-label">{t('editor:text.font')}</label>
            <select
              value={selectedLayer.font}
              onChange={(e) => updateLayer({ font: e.target.value })}
              className="editor-select"
            >
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="editor-panel-section">
            <label className="editor-label">
              {t('editor:text.size')}: {selectedLayer.size}px
            </label>
            <input
              type="range"
              min="12"
              max="120"
              step="1"
              value={selectedLayer.size}
              onChange={(e) => updateLayer({ size: parseInt(e.target.value) })}
              className="editor-slider"
            />
          </div>

          {/* Color */}
          <div className="editor-panel-section">
            <label className="editor-label">{t('editor:text.color')}</label>
            <div className="editor-color-grid">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateLayer({ color })}
                  className={`editor-color-btn ${selectedLayer.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedLayer.color}
              onChange={(e) => updateLayer({ color: e.target.value })}
              className="editor-color-input"
            />
          </div>

          {/* Style Buttons */}
          <div className="editor-panel-section">
            <label className="editor-label">{t('editor:text.style')}</label>
            <div className="editor-text-style-buttons">
              <button
                onClick={() => updateLayer({ bold: !selectedLayer.bold })}
                className={`editor-btn editor-btn-icon ${selectedLayer.bold ? 'active' : ''}`}
                aria-label={t('editor:text.bold')}
              >
                <Bold className="w-5 h-5" />
              </button>
              <button
                onClick={() => updateLayer({ italic: !selectedLayer.italic })}
                className={`editor-btn editor-btn-icon ${selectedLayer.italic ? 'active' : ''}`}
                aria-label={t('editor:text.italic')}
              >
                <Italic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stroke (Outline) */}
          <div className="editor-panel-section">
            <label className="editor-label">
              {t('editor:text.outline')}: {selectedLayer.strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={selectedLayer.strokeWidth}
              onChange={(e) => updateLayer({ strokeWidth: parseInt(e.target.value) })}
              className="editor-slider"
            />
            {selectedLayer.strokeWidth > 0 && (
              <input
                type="color"
                value={selectedLayer.strokeColor}
                onChange={(e) => updateLayer({ strokeColor: e.target.value })}
                className="editor-color-input"
              />
            )}
          </div>

          {/* Shadow Toggle */}
          <div className="editor-panel-section">
            <label className="editor-checkbox">
              <input
                type="checkbox"
                checked={selectedLayer.shadow}
                onChange={(e) => updateLayer({ shadow: e.target.checked })}
              />
              <span>{t('editor:text.shadow')}</span>
            </label>
          </div>
        </>
      )}
    </div>
  )
}

export default EditorPanelText
