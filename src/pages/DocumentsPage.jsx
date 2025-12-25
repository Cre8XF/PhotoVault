// ============================================================================
// PAGE: DocumentsPage.jsx – Document Management (Lite/Pro only)
// ============================================================================
// Displays all user documents in a list/table format with:
// - File icon based on MIME type
// - File name, size, upload date
// - Actions: Preview (PDF), Download, Delete
// ============================================================================

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  File,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  Search,
  X,
  FolderOpen,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import useStore from '../state/store'
import EmptyState from '../components/EmptyState'

/**
 * Get icon and color for document based on MIME type
 */
function getDocumentIcon(mimeType) {
  if (!mimeType) return { icon: File, color: 'text-gray-400' }

  // PDF - Red
  if (mimeType.includes('pdf')) {
    return { icon: FileText, color: 'text-red-500' }
  }

  // Word documents - Blue
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return { icon: FileText, color: 'text-blue-500' }
  }

  // Excel/Spreadsheets - Green
  if (mimeType.includes('sheet') || mimeType.includes('excel')) {
    return { icon: FileSpreadsheet, color: 'text-green-500' }
  }

  // Text files - Gray
  if (mimeType.includes('text')) {
    return { icon: FileText, color: 'text-gray-400' }
  }

  // Default
  return { icon: File, color: 'text-purple-400' }
}

/**
 * Check if document is a PDF
 */
function isPDF(mimeType) {
  return mimeType && mimeType.includes('pdf')
}

/**
 * Format file size to human-readable format
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const DocumentsPage = ({ photos = [], onDeletePhoto }) => {
  const { t, i18n } = useTranslation(['common', 'documents'])
  const [searchQuery, setSearchQuery] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  // Store
  const setConfirmModal = useStore((state) => state.setConfirmModal)
  const setNotification = useStore((state) => state.setNotification)

  // Filter only documents
  const documents = useMemo(() => {
    const safePhotos = Array.isArray(photos) ? photos : []
    return safePhotos.filter((p) => p.type === 'document')
  }, [photos])

  // Search filter
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents

    const query = searchQuery.toLowerCase()
    return documents.filter((doc) =>
      doc.name?.toLowerCase().includes(query)
    )
  }, [documents, searchQuery])

  // Sort by upload date (most recent first)
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadedAt || 0).getTime()
      const dateB = new Date(b.createdAt || b.uploadedAt || 0).getTime()
      return dateB - dateA
    })
  }, [filteredDocuments])

  /**
   * Preview document (PDF only) or open in new tab
   */
  const handlePreviewDocument = (doc) => {
    if (!doc.url) {
      setNotification({
        message: t('common:errorOccurred'),
        type: 'error',
      })
      return
    }

    if (isPDF(doc.mimeType)) {
      // Show inline preview for PDFs
      setPreviewDoc(doc)
    } else {
      // Open non-PDFs in new tab
      window.open(doc.url, '_blank', 'noopener,noreferrer')
    }
  }

  /**
   * Download document
   */
  const handleDownloadDocument = async (doc) => {
    try {
      const response = await fetch(doc.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setNotification({
        message: t('documents:downloadSuccess', { name: doc.name }),
        type: 'success',
      })
    } catch (error) {
      console.error('Download error:', error)
      setNotification({
        message: t('documents:downloadError'),
        type: 'error',
      })
    }
  }

  /**
   * Delete document with confirmation
   */
  const handleDeleteDocument = (doc) => {
    setConfirmModal({
      title: t('documents:confirmDeleteTitle'),
      message: t('documents:confirmDeleteMessage', { name: doc.name }),
      onConfirm: () => {
        if (onDeletePhoto) {
          onDeletePhoto(doc)
        }
      },
    })
  }

  return (
    <div className="container-premium max-w-7xl mx-auto p-4 pb-20 md:pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-2">
          <FileText className="w-7 h-7" />
          {t('documents:title', 'Documents')}
        </h1>
        <p className="text-sm opacity-70">
          {t('documents:subtitle', 'Manage your uploaded documents')}
        </p>
      </div>

      {/* Search bar */}
      {documents.length > 0 && (
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 opacity-60" />
            <input
              type="text"
              placeholder={t('documents:searchPlaceholder', 'Search documents...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="ripple-effect p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Document count */}
      {documents.length > 0 && (
        <div className="mb-4 text-sm opacity-70">
          {t('documents:documentCount', {
            count: sortedDocuments.length,
            total: documents.length,
            defaultValue: `Showing ${sortedDocuments.length} of ${documents.length} documents`,
          })}
        </div>
      )}

      {/* Documents list */}
      {sortedDocuments.length > 0 ? (
        <div className="space-y-3">
          {sortedDocuments.map((doc) => {
            const { icon: Icon, color } = getDocumentIcon(doc.mimeType)
            const uploadDate = doc.createdAt || doc.uploadedAt
            const locale = i18n.language === 'no' ? nb : undefined
            const isPdf = isPDF(doc.mimeType)

            return (
              <div
                key={doc.id}
                className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition group"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 ${color}`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-base mb-1">
                    {doc.name || t('documents:untitledDocument', 'Untitled')}
                  </h3>
                  <div className="flex items-center gap-3 text-xs opacity-70">
                    <span>{formatFileSize(doc.size)}</span>
                    {uploadDate && (
                      <>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(uploadDate), {
                            addSuffix: true,
                            locale,
                          })}
                        </span>
                      </>
                    )}
                    {doc.mimeType && (
                      <>
                        <span>•</span>
                        <span className="uppercase">
                          {doc.mimeType.split('/').pop()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Preview (PDF) or Open */}
                  <button
                    onClick={() => handlePreviewDocument(doc)}
                    className="ripple-effect p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                    title={isPdf ? t('documents:previewDocument', 'Preview') : t('documents:openDocument', 'Open')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="ripple-effect p-2 rounded-lg bg-green-600 hover:bg-green-700 transition"
                    title={t('documents:downloadDocument', 'Download')}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteDocument(doc)}
                    className="ripple-effect p-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                    title={t('documents:deleteDocument', 'Delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : documents.length === 0 ? (
        /* No documents uploaded */
        <EmptyState
          icon={<FolderOpen className="w-12 h-12" />}
          title={t('documents:emptyTitle', 'No documents yet')}
          description={t(
            'documents:emptyDescription',
            'Upload PDF, Word, Excel, or text files to access them here.'
          )}
          actionLabel={t('documents:uploadFirst', 'Upload your first document')}
          onAction={() => {
            // Navigate to upload - or trigger upload modal
            const uploadBtn = document.querySelector('[data-upload-trigger]')
            if (uploadBtn) uploadBtn.click()
          }}
        />
      ) : (
        /* No search results */
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title={t('documents:noSearchResults', 'No documents found')}
          description={t(
            'documents:tryDifferentSearch',
            'Try a different search term.'
          )}
          actionLabel={t('common:clearSearch', 'Clear search')}
          onAction={() => setSearchQuery('')}
        />
      )}

      {/* PDF Preview Modal */}
      {previewDoc && isPDF(previewDoc.mimeType) && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg truncate flex-1">
                {previewDoc.name}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="ripple-effect p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800">
              <iframe
                src={previewDoc.url}
                className="w-full h-full"
                title={previewDoc.name}
                style={{ minHeight: '500px' }}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleDownloadDocument(previewDoc)}
                className="ripple-effect px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('documents:downloadDocument', 'Download')}
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="ripple-effect px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
              >
                {t('common:close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentsPage
