// ============================================================================
// COMPONENT: PanelShell.jsx - Editor Panel Container (Phase 7C-1)
// ============================================================================

import React from 'react';
import '../editor.css';

/**
 * PanelShell - Bottom-sheet panel for editor tools
 *
 * Phase 7C-1: Foundation only - shows simple text placeholders
 * Future phases will add actual tool controls:
 * - 7C-2: Crop controls
 * - 7C-3: Adjust sliders
 * - 7C-4: Rotate buttons
 * - 7C-5: Filter presets
 *
 * @param {string} activeTool - Current active tool ("adjust", "crop", "rotate", "filters", or "none")
 */
const PanelShell = ({ activeTool }) => {
  if (!activeTool || activeTool === 'none') {
    return null;
  }

  const renderPlaceholder = () => {
    switch (activeTool) {
      case 'adjust':
        return (
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">Adjust</h3>
            <p className="text-sm text-white/60">Adjust controls will appear here in Phase 7C-3</p>
          </div>
        );

      case 'crop':
        return (
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">Crop</h3>
            <p className="text-sm text-white/60">Crop controls will appear here in Phase 7C-2</p>
          </div>
        );

      case 'rotate':
        return (
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">Rotate</h3>
            <p className="text-sm text-white/60">Rotate controls will appear here in Phase 7C-4</p>
          </div>
        );

      case 'filters':
        return (
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">Filters</h3>
            <p className="text-sm text-white/60">Filter presets will appear here in Phase 7C-5</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`editor-panel-sheet ${activeTool && activeTool !== 'none' ? 'active' : ''}`}>
      <div className="editor-panel-content">
        {renderPlaceholder()}
      </div>
    </div>
  );
};

export default PanelShell;
