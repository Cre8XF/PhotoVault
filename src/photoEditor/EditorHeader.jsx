/**
 * EditorHeader.jsx
 * Header with back, undo/redo, and save buttons
 */
import React from 'react'
import { X, Undo2, Redo2, Download, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EditorHeader = ({
  onClose,
  onUndo,
  onRedo,
  onDownload,
  onSave,
  canUndo,
  canRedo,
  saving
}) => {
  const { t } = useTranslation(['editor'])

  return (
    <div className="editor-header">
      <div className="editor-header-content">
        {/* Left: Back button */}
        <button
          onClick={onClose}
          className="editor-btn editor-btn-icon"
          aria-label={t('editor:buttons.close')}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Center: Title and undo/redo */}
        <div className="editor-header-center">
          <h1 className="editor-title">{t('editor:title')}</h1>

          <div className="editor-undo-redo">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="editor-btn editor-btn-icon"
              aria-label={t('editor:buttons.undo')}
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="editor-btn editor-btn-icon"
              aria-label={t('editor:buttons.redo')}
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Download and Save */}
        <div className="editor-header-actions">
          <button
            onClick={onDownload}
            className="editor-btn editor-btn-secondary"
            aria-label={t('editor:buttons.download')}
          >
            <Download className="w-5 h-5" />
            <span className="editor-btn-text">{t('editor:buttons.download')}</span>
          </button>

          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="editor-btn editor-btn-primary"
              aria-label={saving ? t('editor:buttons.saving') : t('editor:buttons.save')}
            >
              <Save className="w-5 h-5" />
              <span className="editor-btn-text">
                {saving ? t('editor:buttons.saving') : t('editor:buttons.save')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorHeader
