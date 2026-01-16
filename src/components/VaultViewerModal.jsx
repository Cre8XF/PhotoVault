// ============================================================================
// COMPONENT: VaultViewerModal – Full Media Viewer for Vault
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileText, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getVaultFileCategory, revokeObjectUrl, formatFileSize } from '../utils/vaultMedia';

/**
 * VaultViewerModal - Universal viewer for vault items (images, videos, documents)
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Object} props.vaultItem - Vault item to display
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.getDecryptedUrl - Function to get decrypted blob URL
 */
const VaultViewerModal = ({ isOpen, vaultItem, onClose, getDecryptedUrl }) => {
  const { t } = useTranslation(['vault', 'common']);
  const [objectUrl, setObjectUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const objectUrlRef = useRef(null);

  // Get file info
  const mimeType = vaultItem?.encryptedMetadata?.mimeType || '';
  const originalName = vaultItem?.encryptedMetadata?.originalName || 'file';
  const fileSize = vaultItem?.encryptedMetadata?.size || 0;
  const category = getVaultFileCategory(mimeType);

  // Load decrypted file when modal opens
  useEffect(() => {
    if (!isOpen || !vaultItem) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadFile = async () => {
      try {
        const url = await getDecryptedUrl(vaultItem);

        if (isMounted) {
          if (url) {
            setObjectUrl(url);
            objectUrlRef.current = url;
          } else {
            setError(t('vault:viewer.loadError', { defaultValue: 'Failed to load file' }));
          }
        }
      } catch (err) {
        console.error('Failed to load vault file:', err);
        if (isMounted) {
          setError(t('vault:viewer.loadError', { defaultValue: 'Failed to load file' }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, vaultItem, getDecryptedUrl, t]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        // Note: We don't revoke here because the URL is cached in Zustand store
        // The store handles cleanup when the cache is cleared
        objectUrlRef.current = null;
      }
    };
  }, []);

  // Handle download
  const handleDownload = () => {
    if (!objectUrl) return;

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle close
  const handleClose = () => {
    setObjectUrl(null);
    setLoading(true);
    setError(null);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 dark:bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-white font-semibold truncate">{originalName}</h3>
            {fileSize > 0 && (
              <p className="text-gray-300 text-sm">{formatFileSize(fileSize)}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {objectUrl && !loading && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={t('common:download', { defaultValue: 'Download' })}
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t('common:close', { defaultValue: 'Close' })}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center pt-20 pb-4">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-10 h-10 text-white animate-spin" />
            <p className="text-white text-sm">
              {t('vault:viewer.loading', { defaultValue: 'Loading...' })}
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 text-red-400">
            <AlertCircle className="w-12 h-12" />
            <p className="text-lg">{error}</p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {t('common:close', { defaultValue: 'Close' })}
            </button>
          </div>
        )}

        {!loading && !error && objectUrl && (
          <>
            {/* Image Viewer */}
            {category === 'image' && (
              <img
                src={objectUrl}
                alt={originalName}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Video Viewer */}
            {category === 'video' && (
              <video
                src={objectUrl}
                controls
                playsInline
                className="max-w-full max-h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {t('vault:viewer.videoNotSupported', {
                  defaultValue: 'Your browser does not support video playback.',
                })}
              </video>
            )}

            {/* PDF Viewer */}
            {category === 'pdf' && (
              <iframe
                src={objectUrl}
                title={originalName}
                className="w-full h-full rounded-lg bg-white"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Document/Other - Download prompt */}
            {!['image', 'video', 'pdf'].includes(category) && (
              <div
                className="bg-gray-900/90 border border-gray-700 rounded-xl p-8 max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <FileText className="w-16 h-16 text-purple-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {originalName}
                    </h3>
                    <p className="text-gray-400 mb-1">
                      {t('vault:viewer.previewNotAvailable', {
                        defaultValue: 'Preview not available for this file type',
                      })}
                    </p>
                    {fileSize > 0 && (
                      <p className="text-gray-500 text-sm">{formatFileSize(fileSize)}</p>
                    )}
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600
                               hover:from-purple-700 hover:to-blue-700 text-white font-semibold
                               flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    {t('common:download', { defaultValue: 'Download' })}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VaultViewerModal;
