import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Chip } from './Chip'
import './TagInput.css'

/**
 * Tag Input Component
 * Allows adding/removing tags with suggestions
 * Uses Chip component for consistent styling
 */
export function TagInput({
  tags = [],
  onAddTag,
  onRemoveTag,
  suggestions = [],
  placeholder = 'Legg til tag...',
}) {
  const [input, setInput] = useState('')

  // 🔒 DEFENSIVE: Convert Firestore arrays to plain JavaScript arrays
  const plainTags = useMemo(
    () => (Array.isArray(tags) ? [...tags] : []),
    [tags]
  )

  const plainSuggestions = useMemo(
    () => (Array.isArray(suggestions) ? [...suggestions] : []),
    [suggestions]
  )

  const handleAddTag = () => {
    if (input.trim()) {
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
      {/* Existing tags using Chip component */}
      {plainTags.length > 0 && (
        <div className="tag-list">
          {plainTags.map((tag) => (
            <Chip
              key={tag}
              variant="tag"
              removable
              onRemove={() => onRemoveTag(tag)}
            >
              {tag}
            </Chip>
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

      {/* Suggestions using Chip component */}
      {plainSuggestions.length > 0 && (
        <div className="tag-suggestions">
          <span className="suggestions-label">Foreslått:</span>
          {plainSuggestions.map((sug) => (
            <Chip
              key={sug}
              variant="tag"
              onClick={() => {
                onAddTag(sug)
                setInput('')
              }}
            >
              {sug}
            </Chip>
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
  placeholder: PropTypes.string,
}

export default TagInput
