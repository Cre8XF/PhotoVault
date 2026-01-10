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
 * EditorShellV4 - Google Photos Style Layout
 *
 * Layout:
 * - Minimal header (icons only, overlay)
 * - Fullscreen viewport (fills entire space)
 * - Bottom toolbar (compact icon toolbar)
 * - Overlay panels (slide up from bottom)
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

      {/* Fullscreen viewport */}
      <EditorViewportV4 imageUrl={imageUrl} />

      {/* Bottom toolbar */}
      <EditorToolbarV4 />

      {/* Overlay panels - slide up from bottom */}
      {activeTool === 'adjust' && <AdjustOverlay />}
      {activeTool === 'crop' && <CropOverlay />}
      {activeTool === 'rotate' && <RotateOverlay />}
      {activeTool === 'filters' && <FiltersOverlay />}

      {/* Saving overlay */}
      {isSaving && (
        <div className="editor-v4-saving-overlay">
          <div className="editor-v4-saving-content">
            <div className="flex items-center gap-4">
              <span className="text-4xl animate-spin">⟳</span>
              <div>
                <p className="font-semibold mb-1 text-white">
                  Saving your photo
                </p>
                <p className="opacity-70 text-sm text-gray-300">Applying all edits...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
