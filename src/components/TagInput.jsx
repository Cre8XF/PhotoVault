import React, { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import PropTypes from 'prop-types'
import './TagInput.css'

/**
 * Tag Input Component
 * Allows adding/removing tags with suggestions
 */
export function TagInput({
  tags = [],
  onAddTag,
  onRemoveTag,
  suggestions = [],
  placeholder = 'Legg til tag...'
}) {
  const [input, setInput] = useState('')

  // 🐛 DEBUG: Log what TagInput receives
  console.log('🎨 TagInput render:', {
    tags,
    tagsLength: tags.length,
    tagsType: typeof tags,
    isArray: Array.isArray(tags),
    tagsContent: tags
  })

  const handleAddTag = () => {
    if (input.trim()) {
      console.log('➕ TagInput calling onAddTag:', input.trim())
      onAddTag(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="tag-input-container">
      {/* Existing tags - USE plainTags */}
      {plainTags.length > 0 && (
        <div className="tag-list">
          {plainTags.map((tag) => (
            <div key={tag} className="tag-chip">
              <span>{tag}</span>
              <button
                onClick={() => onRemoveTag(tag)}
                className="tag-remove-btn"
                aria-label={`Fjern ${tag}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="tag-input-field">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="tag-input"
        />
        <button
          onClick={handleAddTag}
          disabled={!input.trim()}
          className="tag-add-btn"
        >
          Legg til
        </button>
      </div>

      {/* Suggestions - USE plainSuggestions */}
      {plainSuggestions.length > 0 && (
        <div className="tag-suggestions">
          <span className="suggestions-label">Foreslått:</span>
          {plainSuggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => {
                onAddTag(sug)
              }}
              className="tag-suggestion-chip"
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

TagInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string
}

export default TagInput
