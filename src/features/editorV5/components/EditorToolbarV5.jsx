import React from 'react';
import useEditorV5Store from '../store/editorV5Store';

/**
 * EditorToolbarV5 - Tool Selector
 * Sticky toolbar for selecting editing tools (Adjust, Crop, Rotate, Filters).
 */
const EditorToolbarV5 = ({ onToolChange }) => {
  const activeTool = useEditorV5Store((state) => state.activeTool);
  const setActiveTool = useEditorV5Store((state) => state.setActiveTool);

  const tools = [
    { id: 'adjust', label: 'Adjust', icon: '☀️' },
    { id: 'crop', label: 'Crop', icon: '✂️' },
    { id: 'rotate', label: 'Rotate', icon: '↻' },
    { id: 'filters', label: 'Filters', icon: '🎨' },
  ];

  const handleToolClick = (toolId) => {
    const newTool = activeTool === toolId ? null : toolId;
    setActiveTool(newTool);
    if (onToolChange) {
      onToolChange(newTool);
    }
  };

  return (
    <div className="editor-v5-toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          className={`editor-v5-toolbar-btn ${activeTool === tool.id ? 'active' : ''}`}
        >
          <span className="editor-v5-toolbar-icon">{tool.icon}</span>
          <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

export default EditorToolbarV5;
