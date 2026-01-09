import useEditorStore from '../store/editorStore'

/**
 * EditorToolbarV4 - Bottom toolbar with tool icons
 *
 * Google Photos style:
 * - Bottom of screen
 * - Large icons
 * - Active tool highlighted
 * - Labels below icons
 */
export default function EditorToolbarV4() {
  const activeTool = useEditorStore((state) => state.activeTool)
  const setActiveTool = useEditorStore((state) => state.setActiveTool)

  const tools = [
    {
      id: 'adjust',
      label: 'Adjust',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      ),
    },
    {
      id: 'crop',
      label: 'Crop',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
          <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
        </svg>
      ),
    },
    {
      id: 'rotate',
      label: 'Rotate',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>
      ),
    },
    {
      id: 'filters',
      label: 'Filters',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
        </svg>
      ),
    },
  ]

  const handleToolClick = (toolId) => {
    // Toggle tool - if already active, deactivate
    if (activeTool === toolId) {
      setActiveTool(null)
    } else {
      setActiveTool(toolId)
    }
  }

  return (
    <div className="editor-v4-toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`editor-v4-toolbar-button ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => handleToolClick(tool.id)}
          aria-label={tool.label}
        >
          {tool.icon}
          <span className="label">{tool.label}</span>
        </button>
      ))}
    </div>
  )
}
