import React from 'react';
import useEditorV5Store from '../store/editorV5Store';

/**
 * AdjustPanelV5 - Brightness/Contrast/Saturation Sliders
 * Renders below the viewport and scrolls into view when active.
 */
const AdjustPanelV5 = () => {
  const adjustments = useEditorV5Store((state) => state.adjustments);
  const setAdjustment = useEditorV5Store((state) => state.setAdjustment);

  const sliders = [
    {
      key: 'brightness',
      label: 'Brightness',
      min: 0,
      max: 200,
      value: adjustments.brightness,
    },
    {
      key: 'contrast',
      label: 'Contrast',
      min: 0,
      max: 200,
      value: adjustments.contrast,
    },
    {
      key: 'saturate',
      label: 'Saturation',
      min: 0,
      max: 200,
      value: adjustments.saturate,
    },
  ];

  return (
    <div className="editor-v5-panel">
      <div className="editor-v5-panel-title">Adjust</div>
      {sliders.map((slider) => (
        <div key={slider.key} className="editor-v5-adjust-group">
          <div className="editor-v5-adjust-label">
            <span className="editor-v5-adjust-label-name">{slider.label}</span>
            <span className="editor-v5-adjust-label-value">
              {slider.value - 100 > 0 ? '+' : ''}
              {slider.value - 100}
            </span>
          </div>
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            value={slider.value}
            onChange={(e) => setAdjustment(slider.key, Number(e.target.value))}
            className="editor-v5-adjust-slider"
          />
        </div>
      ))}
    </div>
  );
};

export default AdjustPanelV5;
