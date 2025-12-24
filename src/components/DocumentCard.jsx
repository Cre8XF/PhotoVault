// ============================================================================
// DocumentCard.jsx – Document rendering component
// ============================================================================
import React from 'react'
import { FileText, Download, FileSpreadsheet, FileImage } from 'lucide-react'

/**
 * Get icon based on mimeType or file extension
 */
const getDocumentIcon = (mimeType, name) => {
  const mime = (mimeType || '').toLowerCase()
  const fileName = (name || '').toLowerCase()

  // PDF
  if (mime.includes('pdf') || fileName.endsWith('.pdf')) {
    return <FileImage className="w-12 h-12 text-red-500" />
  }

  // Excel/Spreadsheets
  if (mime.includes('spreadsheet') || mime.includes('excel') || fileName.match(/\.(xlsx?|csv)$/)) {
    return <FileSpreadsheet className="w-12 h-12 text-green-500" />
  }

  // Word/Documents
  if (mime.includes('word') || mime.includes('document') || fileName.match(/\.docx?$/)) {
    return <FileText className="w-12 h-12 text-blue-500" />
  }

  // PowerPoint/Presentations
  if (mime.includes('presentation') || mime.includes('powerpoint') || fileName.match(/\.pptx?$/)) {
    return <FileText className="w-12 h-12 text-orange-500" />
  }

  // Text files
  if (mime.includes('text') || fileName.endsWith('.txt')) {
    return <FileText className="w-12 h-12 text-gray-400" />
  }

  // Default generic document
  return <FileText className="w-12 h-12 text-gray-500" />
}

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * DocumentCard component
 * Renders a clickable card for document files
 */
const DocumentCard = ({ item, className = '' }) => {
  const handleClick = (e) => {
    e.preventDefault()
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDownload = (e) => {
    e.stopPropagation()
    if (item.url) {
      const link = document.createElement('a')
      link.href = item.url
      link.download = item.name || 'document'
      link.click()
    }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all group ${className}`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="mb-4">
        {getDocumentIcon(item.mimeType || item.type, item.name)}
      </div>

      {/* File name */}
      <div className="text-center w-full mb-2">
        <p className="text-sm font-medium text-white truncate" title={item.name}>
          {item.name || 'Document'}
        </p>
      </div>

      {/* File size */}
      {item.size && (
        <div className="text-xs text-white/60 mb-4">
          {formatFileSize(item.size)}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
        >
          Open
        </button>
        <button
          onClick={handleDownload}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default DocumentCard
