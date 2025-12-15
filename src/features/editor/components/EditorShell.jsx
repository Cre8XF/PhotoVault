// TEMP: Layout updated in Patch 04 to include tools
import EditorCanvas from './EditorCanvas'
import ToolSelector from './ToolSelector'
import AdjustPanel from './AdjustPanel'
import CropPanel from './CropPanel'
import RotatePanel from './RotatePanel'
import FiltersPanel from './FiltersPanel'
import useEditorStore from '../store/editorStore'

export default function EditorShell({
  imageUrl,
  photoName,
  onClose,
  onSave,
  onReset,
}) {
  const activeTool = useEditorStore((state) => state.activeTool)
  const setActiveTool = useEditorStore((state) => state.setActiveTool)

  // Render active tool panel
  const renderToolPanel = () => {
    switch (activeTool) {
      case 'adjust':
        return <AdjustPanel />
      case 'crop':
        return <CropPanel />
      case 'rotate':
        return <RotatePanel />
      case 'filters':
        return <FiltersPanel />
      default:
        return (
          <div className="p-4 bg-[#0a0a0a] text-center">
            <p className="text-gray-400">Select a tool to get started</p>
          </div>
        )
    }
  }
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col">
      {/* Top bar - with Reset button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <span className="text-xl">✕</span>
          <span className="text-sm font-medium">Close</span>
        </button>

        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold text-lg truncate max-w-[200px]">
            {photoName}
          </h1>

          {/* Reset button - NEW */}
          {onReset && (
            <button
              onClick={onReset}
              className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
            >
              Reset
            </button>
          )}
        </div>

        <button
          onClick={onSave}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span className="text-sm font-medium">Save</span>
          <span className="text-xl">✓</span>
        </button>
      </div>

      {/* Canvas area */}
      <EditorCanvas imageUrl={imageUrl} />

      {/* Tools section - NEW in Patch 04 */}
      <div className="border-t border-[#2a2a2a]">
        <ToolSelector activeTool={activeTool} onToolChange={setActiveTool} />
        {renderToolPanel()}
      </div>
    </div>
  )
}
