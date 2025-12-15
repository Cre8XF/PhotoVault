/**
 * Tool Selector - Tab navigation for editor tools
 *
 * @param {string} activeTool - Currently active tool
 * @param {function} onToolChange - Callback when tool changes
 */
export default function ToolSelector({ activeTool, onToolChange }) {
  const tools = [
    { id: 'adjust', label: 'Adjust', icon: '™' },
    { id: 'crop', label: 'Crop', icon: '' },
    { id: 'rotate', label: 'Rotate', icon: '»' },
    { id: 'filters', label: 'Filters', icon: '<¨' },
  ]

  return (
    <div className="flex items-center justify-around border-b border-[#2a2a2a] bg-[#1a1a1a]">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTool === tool.id
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <span className="mr-2">{tool.icon}</span>
          {tool.label}
        </button>
      ))}
    </div>
  )
}
