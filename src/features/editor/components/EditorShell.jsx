// TEMP: Minimal layout for Patch 01B-03
// Updated in Patch 02 to use canvas
// Updated in Patch 03 to add Reset button
import EditorCanvas from './EditorCanvas'

export default function EditorShell({
  imageUrl,
  photoName,
  onClose,
  onSave,
  onReset,
}) {
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

      {/* Canvas area - UPDATED in Patch 02 */}
      <EditorCanvas imageUrl={imageUrl} />

      {/* Bottom placeholder */}
      <div className="py-6 text-center border-t border-[#2a2a2a]">
        <p className="text-gray-500 text-sm">
          Tools will appear here (Patch 04+)
        </p>
      </div>
    </div>
  )
}
