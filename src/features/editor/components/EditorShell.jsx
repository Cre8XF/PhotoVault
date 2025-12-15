// TEMP: Minimal layout for Patch 01B
// Replaced by proper editor layout in later patches
export default function EditorShell({ imageUrl, photoName, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <span className="text-xl">✕</span>
          <span className="text-sm font-medium">Close</span>
        </button>

        <h1 className="text-white font-semibold text-lg truncate max-w-[200px]">
          {photoName}
        </h1>

        <button
          onClick={onSave}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span className="text-sm font-medium">Save</span>
          <span className="text-xl">✓</span>
        </button>
      </div>

      {/* Canvas area - just image for now */}
      <div className="flex-1 flex items-center justify-center p-8">
        <img
          src={imageUrl}
          alt="Edit preview"
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Bottom placeholder */}
      <div className="py-6 text-center border-t border-[#2a2a2a]">
        <p className="text-gray-500 text-sm">
          Tools will appear here (Patch 04+)
        </p>
      </div>
    </div>
  )
}
