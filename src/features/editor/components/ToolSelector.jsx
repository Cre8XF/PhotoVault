import { Sliders, Crop, RotateCw, Palette } from 'lucide-react'

/**
 * Tool Selector - Tab navigation for editor tools
 *
 * @param {string} activeTool - Currently active tool
 * @param {function} onToolChange - Callback when tool changes
 */
export default function ToolSelector({ activeTool, onToolChange }) {
  const tools = [
    { id: 'adjust', label: 'Adjust', Icon: Sliders },
    { id: 'crop', label: 'Crop', Icon: Crop },
    { id: 'rotate', label: 'Rotate', Icon: RotateCw },
    { id: 'filters', label: 'Filters', Icon: Palette },
  ]

  return (
    <div className="flex items-center justify-around border-b editor-border editor-bg-secondary">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTool === tool.id
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'editor-text-muted hover:editor-text-secondary'
          }`}
        >
          <tool.Icon className="w-4 h-4" />
          {tool.label}
        </button>
      ))}
    </div>
  )
}
