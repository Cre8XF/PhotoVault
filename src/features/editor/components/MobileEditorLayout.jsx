// ============================================================================
// COMPONENT: MobileEditorLayout.jsx - Mobile-specific editor layout
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Crop as CropIcon, RotateCw, Sparkles, RotateCcw } from 'lucide-react';
import EditorPreview from './EditorPreview';

/**
 * MobileEditorLayout
 *
 * Mobile-specific layout for photo editor with:
 * - Fixed preview height
 * - Bottom sheet panels
 * - Fixed toolbar over panels
 * - Proper z-index stack
 */
const MobileEditorLayout = ({
  originalPhoto,
  transform,
  activeMode,
  hasTransforms,
  onModeChange,
  onReset,
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
    <div className="mobile-editor-layout">
      {/* Preview - Fixed height */}
      <div className="mobile-editor-preview">
        <EditorPreview
          photo={originalPhoto}
          transform={transform}
          activeMode={activeMode}
        />
      </div>

      {/* Toolbar - Fixed at bottom */}
      <div className="mobile-editor-toolbar">
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{mode.label}</span>
              </button>
            );
          })}

          <div className="w-px h-10 bg-white/20 mx-1" />

          <button
            onClick={onReset}
            disabled={!hasTransforms()}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('editor.reset', 'Reset')}</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet Panel - Slides up over preview */}
      {activeMode && (
        <div className={`mobile-editor-panel ${activeMode ? 'active' : ''}`}>
          {renderPanel()}
        </div>
      )}
    </div>
  );
};

export default MobileEditorLayout;
