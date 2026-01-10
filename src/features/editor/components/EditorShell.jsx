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
      {/* Top bar - Clean left/center/right layout */}
      <div className="flex items-center justify-between px-4 py-3 border-b editor-border gap-4">
        {/* Left: Close button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Close editor"
        >
          <span className="text-xl editor-text-primary">✕</span>
        </button>

        {/* Center: Filename (truncated with tooltip) */}
        <h1
          className="editor-text-primary font-semibold text-lg truncate flex-1 mx-4 text-center"
          title={photoName}
        >
          {photoName}
        </h1>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Revert to Original button - only show if photo was previously edited (hidden on mobile to save space) */}
          {isEdited && onRevert && (
            <button
              onClick={onRevert}
              disabled={isSaving}
              className="hidden md:inline-flex px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revert to Original
            </button>
          )}

          {/* Reset button - secondary/ghost style */}
          {onReset && (
            <button
              onClick={onReset}
              disabled={isSaving}
              className="px-3 py-1.5 editor-text-muted hover:bg-white/10 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          )}

          {/* Save button - primary style */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isSaving ? (
              <>
                <span>Saving...</span>
                <span className="animate-spin">⟳</span>
              </>
            ) : (
              <>
                <span>Save</span>
                <span className="text-lg">✓</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas area - optimized for mobile */}
      <div className="flex-1 relative">
        <EditorCanvas imageUrl={imageUrl} />
      </div>

      {/* Tools section - compact on mobile */}
      <div className="editor-tools border-t editor-border max-h-[50vh] md:max-h-[400px] flex flex-col">
        {/* Sticky tab bar - always visible while scrolling */}
        <div className="sticky top-0 z-10 editor-bg-secondary">
          <ToolSelector activeTool={activeTool} onToolChange={setActiveTool} />
        </div>
        <div className="overflow-y-auto flex-1 editor-scroll-container">{renderToolPanel()}</div>
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
