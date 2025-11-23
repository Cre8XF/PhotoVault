// ============================================================================
// COMPONENT: MobileEditorLayout.jsx - Google Photos-style mobile editor
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Sliders, Crop as CropIcon, RotateCw, Sparkles, RotateCcw } from 'lucide-react';
import EditorPreview from './EditorPreview';

/**
 * MobileEditorLayout - Google Photos-style mobile editor
 *
 * Architecture:
 * - Fixed topbar (56px)
 * - Fixed preview (between topbar and toolbar)
 * - Fixed toolbar (72px)
 * - Fixed bottom sheet panel (200px over toolbar)
 * - No flex layout - everything is position: fixed overlays
 */
const MobileEditorLayout = ({
  originalPhoto,
  transform,
  activeMode,
  hasTransforms,
  onModeChange,
  onReset,
  onBack,
  onSave,
  renderPanel
}) => {
  const { t } = useTranslation();

  const modes = [
    { id: 'adjust', label: t('editor.adjust', 'Adjust'), icon: Sliders },
    { id: 'crop', label: t('editor.crop', 'Crop'), icon: CropIcon },
    { id: 'rotate', label: t('editor.rotate', 'Rotate'), icon: RotateCw },
    { id: 'filters', label: t('editor.filters', 'Filters'), icon: Sparkles },
  ];

  return (
    <div className="mobile-editor-root">
      {/* Fixed Topbar */}
      <header className="mobile-editor-topbar">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-2 py-2 hover:bg-white/10 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1 text-center">
          {t('editor.title', 'Edit Photo')}
        </h1>
        <button
          onClick={onSave}
          disabled={!hasTransforms()}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium"
        >
          <Save className="w-4 h-4" />
        </button>
      </header>

      {/* Fixed Preview - ALWAYS VISIBLE */}
      <div className="mobile-editor-preview">
        <EditorPreview
          photo={originalPhoto}
          transform={transform}
          activeMode={activeMode}
        />
      </div>

      {/* Fixed Toolbar */}
      <div className="mobile-editor-toolbar">
        <div className="flex items-center justify-center gap-1 w-full">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(activeMode === mode.id ? null : mode.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{mode.label}</span>
              </button>
            );
          })}

          <div className="w-px h-8 bg-white/20 mx-1" />

          <button
            onClick={onReset}
            disabled={!hasTransforms()}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[9px] font-medium">{t('editor.reset', 'Reset')}</span>
          </button>
        </div>
      </div>

      {/* Fixed Bottom Sheet Panel */}
      {activeMode && (
        <div className="mobile-editor-panel">
          <div className="mobile-editor-panel-inner">
            {renderPanel()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileEditorLayout;
