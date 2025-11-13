import React, { useState, useEffect } from 'react'
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FONT_FAMILIES, createTextLayer, updateTextLayer } from '../utils/textUtils'

/**
 * TextTool Component
 * UI for adding and editing text overlays on photos
 */
const TextTool = ({
  currentTextLayer,
  onTextLayerChange,
  onAddTextLayer,
  onRemoveTextLayer
}) => {
  const { t } = useTranslation(['editor'])
  const [localLayer, setLocalLayer] = useState(currentTextLayer || createTextLayer())

  // Update local state when currentTextLayer changes
  useEffect(() => {
    if (currentTextLayer) {
      setLocalLayer(currentTextLayer)
    }
  }, [currentTextLayer])

  // Handle text input change
  const handleTextChange = (e) => {
    const updated = updateTextLayer(localLayer, 'text', e.target.value)
    setLocalLayer(updated)
    if (onTextLayerChange) {
      onTextLayerChange(updated)
    }
  }

  // Handle property change
  const handlePropertyChange = (property, value) => {
    const updated = updateTextLayer(localLayer, property, value)
    setLocalLayer(updated)
    if (onTextLayerChange) {
      onTextLayerChange(updated)
    }
  }

  // Handle position change
  const handlePositionChange = (axis, value) => {
    const updated = updateTextLayer(localLayer, axis, parseFloat(value))
    setLocalLayer(updated)
    if (onTextLayerChange) {
      onTextLayerChange(updated)
    }
  }

  // Handle add new text layer
  const handleAddLayer = () => {
    if (onAddTextLayer) {
      const newLayer = createTextLayer()
      setLocalLayer(newLayer)
      onAddTextLayer(newLayer)
    }
  }

  // Handle remove current layer
  const handleRemoveLayer = () => {
    if (onRemoveTextLayer && localLayer.id) {
      onRemoveTextLayer(localLayer.id)
      setLocalLayer(createTextLayer())
    }
  }

  return (
    <div className="text-tool p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          <h3 className="font-semibold">{t('editor:text.title')}</h3>
        </div>
        {currentTextLayer && (
          <button
            onClick={handleRemoveLayer}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
            title={t('editor:text.removeLayer')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('editor:text.textLabel')}
        </label>
        <textarea
          value={localLayer.text}
          onChange={handleTextChange}
          placeholder={t('editor:text.placeholder')}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows={3}
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('editor:text.fontFamily')}
        </label>
        <select
          value={localLayer.fontFamily}
          onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('editor:text.fontSize')}: {localLayer.fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="120"
          step="2"
          value={localLayer.fontSize}
          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('editor:text.color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={localLayer.color}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-12 h-10 rounded cursor-pointer bg-gray-700 border border-gray-600"
          />
          <input
            type="text"
            value={localLayer.color}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Text Style */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('editor:text.style')}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handlePropertyChange('bold', !localLayer.bold)}
            className={`flex-1 p-2 rounded-lg border transition-colors ${
              localLayer.bold
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Bold className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={() => handlePropertyChange('italic', !localLayer.italic)}
            className={`flex-1 p-2 rounded-lg border transition-colors ${
              localLayer.italic
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Italic className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('editor:text.alignment')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePropertyChange('align', 'left')}
            className={`p-2 rounded-lg border transition-colors ${
              localLayer.align === 'left'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <AlignLeft className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={() => handlePropertyChange('align', 'center')}
            className={`p-2 rounded-lg border transition-colors ${
              localLayer.align === 'center'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <AlignCenter className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={() => handlePropertyChange('align', 'right')}
            className={`p-2 rounded-lg border transition-colors ${
              localLayer.align === 'right'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <AlignRight className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('editor:text.position')}
        </label>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">
              {t('editor:text.horizontal')}: {Math.round(localLayer.x * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localLayer.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">
              {t('editor:text.vertical')}: {Math.round(localLayer.y * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localLayer.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Shadow */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            {t('editor:text.shadow')}
          </label>
          <input
            type="checkbox"
            checked={localLayer.shadow.enabled}
            onChange={(e) => handlePropertyChange('shadow.enabled', e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
          />
        </div>
        {localLayer.shadow.enabled && (
          <div className="space-y-2 pl-2">
            <div>
              <label className="text-xs text-gray-400">
                {t('editor:text.blur')}: {localLayer.shadow.blur}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={localLayer.shadow.blur}
                onChange={(e) => handlePropertyChange('shadow.blur', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stroke/Outline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            {t('editor:text.outline')}
          </label>
          <input
            type="checkbox"
            checked={localLayer.stroke.enabled}
            onChange={(e) => handlePropertyChange('stroke.enabled', e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
          />
        </div>
        {localLayer.stroke.enabled && (
          <div className="space-y-2 pl-2">
            <div className="flex gap-2">
              <input
                type="color"
                value={localLayer.stroke.color}
                onChange={(e) => handlePropertyChange('stroke.color', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer bg-gray-700 border border-gray-600"
              />
              <input
                type="text"
                value={localLayer.stroke.color}
                onChange={(e) => handlePropertyChange('stroke.color', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="#000000"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">
                {t('editor:text.width')}: {localLayer.stroke.width}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={localLayer.stroke.width}
                onChange={(e) => handlePropertyChange('stroke.width', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Text Layer Button */}
      {!currentTextLayer && (
        <button
          onClick={handleAddLayer}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Type className="w-5 h-5" />
          {t('editor:buttons.addText')}
        </button>
      )}
    </div>
  )
}

export default TextTool
