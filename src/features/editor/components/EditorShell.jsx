// TEMP: Layout updated in Patch 04 to include tools
import EditorCanvas from './EditorCanvas'
import ToolSelector from './ToolSelector'
import AdjustPanel from './AdjustPanel'
import CropPanel from './CropPanel'
import RotatePanel from './RotatePanel'
import FiltersPanel from './FiltersPanel'
import useEditorStore from '../store/editorStore'
import '../styles/editor.css'

export default function EditorShell({
  imageUrl,
  photoName,
  onClose,
  onSave,
  onReset,
  onRevert,
  isEdited = false,
  isSaving = false,
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
          <div className="p-4 editor-bg-primary text-center">
            <p className="editor-text-muted">Select a tool to get started</p>
          </div>
        )
    }
  }
  return (
    <div className="fixed inset-0 editor-bg-primary flex flex-col">
      {/* Top bar - with Reset button */}
      <div className="flex items-center justify-between px-4 py-3 border-b editor-border">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="flex items-center gap-2 editor-text-primary hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">✕</span>
          <span className="text-sm font-medium">Close</span>
        </button>

        <div className="flex items-center gap-4">
          <h1 className="editor-text-primary font-semibold text-lg truncate max-w-[200px]">
            {photoName}
          </h1>

          {/* Revert to Original button - only show if photo was previously edited (hidden on mobile to save space) */}
          {isEdited && onRevert && (
            <button
              onClick={onRevert}
              disabled={isSaving}
              className="hidden md:inline-flex text-red-400 hover:text-red-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revert to Original
            </button>
          )}

          {/* Reset button - resets current editing session */}
          {onReset && (
            <button
              onClick={onReset}
              disabled={isSaving}
              className="editor-text-muted hover:editor-text-secondary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="text-sm font-medium">Saving...</span>
              <span className="animate-spin">⟳</span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium">Save</span>
              <span className="text-xl">✓</span>
            </>
          )}
        </button>
      </div>

      {/* Canvas area - optimized for mobile */}
      <div className="flex-1 relative">
        <EditorCanvas imageUrl={imageUrl} />
      </div>

      {/* Tools section - compact on mobile */}
      <div className="editor-tools border-t editor-border max-h-[50vh] md:max-h-[400px] flex flex-col">
        <ToolSelector activeTool={activeTool} onToolChange={setActiveTool} />
        <div className="overflow-y-auto flex-1">{renderToolPanel()}</div>
      </div>

      {/* Saving overlay */}
      {isSaving && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'var(--overlay-bg)' }}>
          <div className="editor-bg-secondary rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl animate-spin">⟳</span>
              <div>
                <p className="font-semibold mb-1">
                  Saving your photo
                </p>
                <p className="opacity-70 text-sm">Applying all edits...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
