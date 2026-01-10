import EditorHeaderV4 from './EditorHeaderV4'
import EditorViewportV4 from './EditorViewportV4'
import EditorToolbarV4 from './EditorToolbarV4'
import AdjustOverlay from './AdjustOverlay'
import CropOverlay from './CropOverlayV4'
import RotateOverlay from './RotateOverlay'
import FiltersOverlay from './FiltersOverlay'
import useEditorStore from '../store/editorStore'
import './EditorShellV4.css'

/**
 * EditorShellV4 - Ultimate Responsive Layout
 *
 * Layout:
 * - Minimal header (overlay on top)
 * - Responsive viewport (flex: 1, shrinks when tool active)
 * - Tool panel (in flow, NOT absolute - pushes viewport up)
 * - Bottom toolbar (compact with text labels)
 *
 * When tool inactive: Viewport fills space
 * When tool active: Panel appears, viewport shrinks, image scales down
 */
export default function EditorShellV4({
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

  return (
    <div className="editor-v4-container">
      {/* Minimal header - overlay on top */}
      <EditorHeaderV4
        photoName={photoName}
        onClose={onClose}
        onSave={onSave}
        onReset={onReset}
        onRevert={onRevert}
        isEdited={isEdited}
        isSaving={isSaving}
      />

      {/* Responsive viewport - grows/shrinks based on panel */}
      <div className="editor-v4-viewport">
        <EditorViewportV4 imageUrl={imageUrl} />
      </div>

      {/* Tool panel - in normal flow (NOT absolute) */}
      {activeTool && (
        <div className="editor-v4-panel">
          {activeTool === 'adjust' && <AdjustOverlay />}
          {activeTool === 'crop' && <CropOverlay />}
          {activeTool === 'rotate' && <RotateOverlay />}
          {activeTool === 'filters' && <FiltersOverlay />}
        </div>
      )}

      {/* Bottom toolbar */}
      <EditorToolbarV4 />

      {/* Saving overlay */}
      {isSaving && (
        <div className="editor-v4-saving-overlay">
          <div className="editor-v4-saving-content">
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
