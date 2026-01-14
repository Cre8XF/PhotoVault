// ============================================================================
// PAGE: DocumentsPage.jsx – Document Management (Lite/Pro only)
// ============================================================================
// Displays all user documents in a list/table format with:
// - File icon based on MIME type
// - File name, size, upload date
// - Actions: Preview (PDF), Download, Delete
// ============================================================================

import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ArrowLeft,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import useStore from '../state/store'
import EmptyState from '../components/EmptyState'
import UpgradePromptModal from '../components/UpgradePromptModal'
import useAuth from '../hooks/useAuth'

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
  return { icon: File, color: 'text-purple' }
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

/**
 * Get friendly file type name instead of raw MIME type
 */
function getFriendlyFileType(mimeType) {
  if (!mimeType) return 'Document'

  const types = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/msword': 'Word Document',
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'text/plain': 'Text File',
    'text/csv': 'CSV File',
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'image/svg+xml': 'SVG Image',
  }

  return types[mimeType] || 'Document'
}

const DocumentsPage = ({ photos = [], onDeletePhoto }) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['common', 'documents'])
  const [searchQuery, setSearchQuery] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Auth & Store
  const { canUploadDocument } = useAuth()
  const setConfirmModal = useStore((state) => state.setConfirmModal)
  const setNotification = useStore((state) => state.setNotification)

  // ✅ ROUTE GUARD: Redirect FREE users with upgrade modal
  useEffect(() => {
    if (!canUploadDocument()) {
      setShowUpgradeModal(true)
    }
  }, [canUploadDocument])

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
      {/* Page Header Section */}
      <section className="page-header mb-6 space-y-4">
        {/* Title and Back Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/account')}
            className="ripple-effect p-2 hover:bg-white/10 rounded-xl transition"
            aria-label={t('common:back')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">
                {t('documents:title', 'Documents')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {t('documents:documentCount', { count: documents.length, total: documents.length })}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('documents:subtitle', 'Your uploaded files')}
            </p>
          </div>
        </div>

        {/* Search and Meta Info */}
        {documents.length > 0 && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="glass rounded-2xl p-4">
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
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Document Count - Secondary Meta */}
            {searchQuery && (
              <p className="text-sm text-gray-500 dark:text-gray-500 pl-1">
                {t('documents:documentCount', { count: sortedDocuments.length, total: documents.length })}
              </p>
            )}
          </div>
        )}
      </section>

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
                className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 hover:shadow-lg transition-all duration-200 ease-out group cursor-pointer hover:scale-[0.99] active:scale-[0.98]"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 ${color}`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-base mb-1 leading-snug">
                    {doc.name || t('documents:untitledDocument', 'Untitled')}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                        <span>
                          {getFriendlyFileType(doc.mimeType)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Preview (PDF) or Open */}
                  <button
                    onClick={() => handlePreviewDocument(doc)}
                    className="ripple-effect p-2 rounded-lg bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    title={isPdf ? t('documents:previewDocument', 'Preview') : t('documents:openDocument', 'Open')}
                    aria-label={isPdf ? t('documents:previewDocument', 'Preview') : t('documents:openDocument', 'Open')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="ripple-effect p-2 rounded-lg bg-green-600 hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    title={t('documents:downloadDocument', 'Download')}
                    aria-label={t('documents:downloadDocument', 'Download')}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteDocument(doc)}
                    className="ripple-effect p-2 rounded-lg bg-red-600 hover:bg-red-700 hover:shadow-md active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    title={t('documents:deleteDocument', 'Delete')}
                    aria-label={t('documents:deleteDocument', 'Delete')}
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
          icon={FolderOpen}
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
          icon={Search}
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

      {/* Upgrade Prompt Modal for FREE users */}
      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          navigate('/more')
        }}
        feature="documents"
      />
    </div>
  )
}

export default DocumentsPage
