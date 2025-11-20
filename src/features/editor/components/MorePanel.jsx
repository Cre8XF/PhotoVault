/**
 * Photo Editor V2 - MorePanel Component
 *
 * Text editing tools and additional options
 * Text position is now handled by drag-and-drop overlay in PhotoEditor
 */

import React, { useState, useEffect } from 'react'
import { Type, Plus, Trash2, RotateCcw, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FONT_FAMILIES, createTextLayer, updateTextLayer } from '../utils/textUtils'

const MorePanel = ({
  textLayers,
  currentLayer,
  onAddText,
  onUpdateText,
  onRemoveText,
  onReset
}) => {
  const { t } = useTranslation(['editor'])
  const [localLayer, setLocalLayer] = useState(currentLayer || createTextLayer())
  const [showAddForm, setShowAddForm] = useState(false)

  // DEBUG: Log component render
  console.log('🎨 MorePanel RENDER')
  console.log('🎨 Props:', { textLayers, currentLayer, onAddText, onUpdateText, onRemoveText, onReset })
  console.log('🎨 State:', { localLayer, showAddForm })
  console.log('🎨 textLayers count:', textLayers?.length || 0)
  console.log('🎨 currentLayer:', currentLayer)

  // Update local state when currentLayer changes
  useEffect(() => {
    if (currentLayer) {
      setLocalLayer(currentLayer)
      setShowAddForm(true)
    }
  }, [currentLayer])

  // Handle text input change
  const handleTextChange = (e) => {
    const updated = updateTextLayer(localLayer, 'text', e.target.value)
    setLocalLayer(updated)
    if (onUpdateText) {
      onUpdateText(updated)
    }
  }

  // Handle property change
  const handlePropertyChange = (property, value) => {
    console.log('🔤 MorePanel.handlePropertyChange:', property, '=', value)
    console.log('🔤 Current localLayer.id:', localLayer?.id)
    console.log('🔤 Current localLayer:', localLayer)

    const updated = updateTextLayer(localLayer, property, value)

    console.log('🔤 Updated layer.id:', updated?.id)
    console.log('🔤 Updated layer:', updated)

    setLocalLayer(updated)

    if (onUpdateText) {
      console.log('✅ Calling onUpdateText with layer:', updated.id)
      onUpdateText(updated)
    } else {
      console.error('❌ onUpdateText callback is not defined!')
    }
  }

  // Handle add new text layer
  const handleAddLayer = () => {
    console.log('➕ handleAddLayer called')
    const newLayer = createTextLayer()
    console.log('➕ New layer created:', newLayer)
    setLocalLayer(newLayer)
    setShowAddForm(true)
    console.log('➕ showAddForm set to true')
    if (onAddText) {
      console.log('➕ Calling onAddText with new layer')
      onAddText(newLayer)
    } else {
      console.error('❌ onAddText callback is not defined!')
    }
  }

  // Handle remove current layer
  const handleRemoveLayer = () => {
    if (onRemoveText && localLayer.id) {
      onRemoveText(localLayer.id)
      setLocalLayer(createTextLayer())
      setShowAddForm(false)
    }
  }

  return (
    <>
      <style>{`
        .more-panel input[type="range"] {
          height: 8px;
        }
        .more-panel input[type="range"]::-webkit-slider-thumb {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        .more-panel input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
      `}</style>
      <div className="more-panel space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-sm">{t('editor:text.title')}</h3>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition touch-target"
            title={t('editor:buttons.resetAll')}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">
              {t('editor:buttons.reset')}
            </span>
          </button>
        </div>

        {/* Add Text Button */}
        {!showAddForm && (
          <button
            onClick={handleAddLayer}
            className="w-full min-h-[44px] py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 touch-target"
          >
            <Plus className="w-5 h-5" />
            {t('editor:buttons.addText')}
          </button>
        )}

        {/* Text Editor Form */}
        {showAddForm && (
          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-400">
                {t('editor:text.textLabel')}
              </label>
              <textarea
                value={localLayer.text}
                onChange={handleTextChange}
                placeholder={t('editor:text.placeholder')}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-400">
                {t('editor:text.fontFamily')}
              </label>
              <select
                value={localLayer.fontFamily}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 touch-target"
              >
                {FONT_FAMILIES.map(font => (
                  <option key={font.value} value={font.value} className="bg-gray-900">
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-400">
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

            {/* Color */}
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-400">
                {t('editor:text.color')}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localLayer.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer bg-gray-700 border border-white/10 touch-target"
                />
                <input
                  type="text"
                  value={localLayer.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Text Style */}
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-400">
                {t('editor:text.style')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePropertyChange('bold', !localLayer.bold)}
                  className={`
                    flex-1 min-h-[44px] p-3 rounded-lg border transition touch-target
                    ${localLayer.bold
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <Bold className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => handlePropertyChange('italic', !localLayer.italic)}
                  className={`
                    flex-1 min-h-[44px] p-3 rounded-lg border transition touch-target
                    ${localLayer.italic
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <Italic className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-400">
                {t('editor:text.alignment')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePropertyChange('align', 'left')}
                  className={`
                    min-h-[44px] p-3 rounded-lg border transition touch-target
                    ${localLayer.align === 'left'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <AlignLeft className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => handlePropertyChange('align', 'center')}
                  className={`
                    min-h-[44px] p-3 rounded-lg border transition touch-target
                    ${localLayer.align === 'center'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <AlignCenter className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => handlePropertyChange('align', 'right')}
                  className={`
                    min-h-[44px] p-3 rounded-lg border transition touch-target
                    ${localLayer.align === 'right'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <AlignRight className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>

            {/* Shadow Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-400">
                  {t('editor:text.shadow')}
                </label>
                <input
                  type="checkbox"
                  checked={localLayer.shadow?.enabled || false}
                  onChange={(e) => handlePropertyChange('shadow.enabled', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Stroke Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-400">
                  {t('editor:text.outline')}
                </label>
                <input
                  type="checkbox"
                  checked={localLayer.stroke?.enabled || false}
                  onChange={(e) => handlePropertyChange('stroke.enabled', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemoveLayer}
              className="w-full min-h-[44px] py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition flex items-center justify-center gap-2 touch-target"
            >
              <Trash2 className="w-4 h-4" />
              {t('editor:text.removeLayer')}
            </button>

            {/* Help */}
            <p className="text-xs text-gray-500 text-center">
              💡 {t('editor:text.dragToMove')}
            </p>
          </div>
        )}

        {/* Existing Layers Count */}
        {textLayers && textLayers.length > 0 && (
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400">
              {t('editor:text.layersCount', { count: textLayers.length })}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default MorePanel
