// ============================================================================
// COMPONENT: AlbumModal.jsx – v2.1 med i18n
// ============================================================================
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, FolderPlus, Image as ImageIcon } from "lucide-react";
import { updateAlbum } from '../firebase';

const AlbumModal = ({ onClose, onSave, editingAlbum }) => {
  const { t } = useTranslation(['albums']);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");

  // New state for UX
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingAlbum) {
      setName(editingAlbum.name || "");
      setDescription(editingAlbum.description || "");
      setCover(editingAlbum.cover || "");
    }
  }, [editingAlbum]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, loading]);

  // Validation helper
  const validateForm = () => {
    // Clear previous errors
    setError('');

    // Validate name
    if (!name.trim()) {
      setError(t('albums:enterAlbumName') || 'Album name is required');
      return false;
    }

    if (name.length > 50) {
      setError('Album name must be less than 50 characters');
      return false;
    }

    if (description.length > 200) {
      setError('Description must be less than 200 characters');
      return false;
    }

    return true;
  };

  // Enhanced submit handler
  const handleSave = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const albumData = {
        name: name.trim(),
        description: description.trim(),
        cover: cover.trim(),
      };

      if (editingAlbum) {
        // UPDATE existing album
        await updateAlbum(editingAlbum.id, albumData);
        if (window.showToast) {
          window.showToast('Album updated ✅', 'success');
        }
      } else {
        // CREATE new album - let parent handle creation
        await onSave(albumData);
        // Parent will show success toast
      }

      onClose();
    } catch (err) {
      console.error('Error saving album:', err);
      setError(err.message || 'Failed to save album. Please try again.');

      if (window.showToast) {
        window.showToast('Failed to save album', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-700/40
                    bg-gradient-to-b from-gray-800/90 to-gray-900/90 p-6 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            {editingAlbum ? t('albums:editAlbum') : t('albums:newAlbum')}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="ripple-effect text-gray-400 hover:text-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              {t('albums:name')} <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(''); // Clear error on change
              }}
              placeholder={t('albums:namePlaceholder') || 'Enter album name (max 50 characters)'}
              maxLength={50}
              disabled={loading}
              className="w-full p-3 rounded-xl bg-gray-800/60 border border-gray-600/50
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/50 characters</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">{t('albums:description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('albums:descriptionPlaceholder') || 'Add a description (optional, max 200 characters)'}
              maxLength={200}
              rows="3"
              disabled={loading}
              className="w-full p-3 rounded-xl bg-gray-800/60 border border-gray-600/50
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/200 characters</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              {t('albums:coverImage')}
            </label>
            <input
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://..."
              disabled={loading}
              className="w-full p-3 rounded-xl bg-gray-800/60 border border-gray-600/50
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {cover && (
              <img
                src={cover}
                alt="Cover preview"
                className="w-full h-40 object-cover rounded-xl mt-2 border border-gray-700"
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="ripple-effect px-5 py-2 rounded-xl bg-gray-700/60 hover:bg-gray-600/70
                         text-gray-200 text-sm font-semibold transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('albums:cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="ripple-effect px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                         hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {editingAlbum ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingAlbum ? t('albums:saveChanges') : t('albums:createAlbum')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumModal;
