/**
 * EditorHeaderV4 - Minimal header with icons only
 *
 * Layout: [X] [Photo Name] [Reset] [Save]
 * - Transparent overlay on top
 * - Icons only, no text labels (except on hover)
 * - Clean, minimal Google Photos style
 */
export default function EditorHeaderV4({
  photoName,
  onClose,
  onSave,
  onReset,
  onRevert,
  isEdited,
  isSaving,
}) {
  return (
    <div className="editor-v4-header">
      {/* Left: Close button */}
      <button
        onClick={onClose}
        disabled={isSaving}
        aria-label="Close editor"
        title="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Center: Photo name (hidden on mobile to save space) */}
      <h1
        className="hidden md:block text-white font-semibold text-sm truncate flex-1 mx-4 text-center"
        title={photoName}
      >
        {photoName}
      </h1>

      {/* Right: Action buttons */}
      <div className="editor-v4-header-actions">
        {/* Revert to Original - only show if previously edited */}
        {isEdited && onRevert && (
          <button
            onClick={onRevert}
            disabled={isSaving}
            aria-label="Revert to original"
            title="Revert to original"
            className="hidden md:flex"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            </svg>
          </button>
        )}

        {/* Reset button */}
        {onReset && (
          <button
            onClick={onReset}
            disabled={isSaving}
            aria-label="Reset all changes"
            title="Reset all changes"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        )}

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          aria-label="Save photo"
          title="Save photo"
          style={{
            background: isSaving ? 'rgba(147, 51, 234, 0.5)' : 'rgb(147, 51, 234)',
            padding: '8px 16px',
            borderRadius: '8px',
            opacity: 1,
          }}
        >
          {isSaving ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
