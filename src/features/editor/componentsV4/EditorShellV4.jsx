import { useEffect } from 'react'
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
 * EditorShellV4 - Stable Canvas Principle (Google Photos Model)
 *
 * Philosophy:
 * "Ingen UI-state har lov til å påvirke viewport-størrelsen."
 * "Bildet reagerer aldri på UI-endringer. UI reagerer på bildet."
 *
 * Layout:
 * - Sticky header at top
 * - FIXED viewport (height: calc(100vh - 50px - 80px), NEVER shrinks)
 * - Tool panel (adds to container height, making it scrollable)
 * - Sticky toolbar at bottom
 *
 * Behavior:
 * No panel: Container = 100vh, no scroll, image large
 * Panel opens: Container > 100vh, scrollable, image SAME size
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

  // Auto-scroll to panel when tool activates
  useEffect(() => {
    if (activeTool) {
      setTimeout(() => {
        const panel = document.querySelector('.editor-v4-panel')
        if (panel) {
          panel.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        }
      }, 100)
    }
  }, [activeTool])

  return (
    <div className="editor-v4-container">
      {/* Sticky header at top */}
      <EditorHeaderV4
        photoName={photoName}
        onClose={onClose}
        onSave={onSave}
        onReset={onReset}
        onRevert={onRevert}
        isEdited={isEdited}
        isSaving={isSaving}
      />

      {/* FIXED viewport - NEVER shrinks */}
      <div className="editor-v4-viewport">
        <EditorViewportV4 imageUrl={imageUrl} />
      </div>

      {/* Tool panel - adds to container height */}
      {activeTool && (
        <div className="editor-v4-panel">
          {activeTool === 'adjust' && <AdjustOverlay />}
          {activeTool === 'crop' && <CropOverlay />}
          {activeTool === 'rotate' && <RotateOverlay />}
          {activeTool === 'filters' && <FiltersOverlay />}
        </div>
      )}

      {/* Sticky toolbar at bottom */}
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
