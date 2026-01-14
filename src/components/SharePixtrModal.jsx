import React, { useState, useEffect } from 'react'
import { X, Copy, Check, Share2, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import useStore from '../state/store'

/**
 * SharePixtrModal - Modal for sharing the Pixtr app
 * Shows pixtr.cloud URL with copy, QR code, and native share options
 */
const SharePixtrModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['common'])
  const isDarkMode = useStore((state) => state.isDarkMode)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const PIXTR_URL = 'https://pixtr.cloud'

  // Check if native share is supported
  const canShare = typeof navigator !== 'undefined' && navigator.share

  // Regenerate QR code when theme changes
  useEffect(() => {
    if (showQR && qrDataUrl) {
      setQrDataUrl('')
      handleShowQR()
    }
  }, [isDarkMode]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PIXTR_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  /**
   * Use native share API
   */
  const handleNativeShare = async () => {
    if (!canShare) return

    try {
      await navigator.share({
        title: 'Pixtr',
        text: t('share.pixtrText', {
          defaultValue: 'Check out Pixtr - a privacy-first photo storage app',
        }),
        url: PIXTR_URL,
      })
    } catch (error) {
      // User cancelled or share failed
      console.log('Share cancelled:', error)
    }
  }

  /**
   * Generate and show QR code
   */
  const handleShowQR = async () => {
    if (!showQR && !qrDataUrl) {
      try {
        const dataUrl = await QRCode.toDataURL(PIXTR_URL, {
          width: 256,
          margin: 2,
          color: {
            dark: isDarkMode ? '#a78bfa' : '#6B21A8', // purple-400 in dark, purple-800 in light
            light: isDarkMode ? '#0b0f1a' : '#FFFFFF', // bg-primary for each mode
          },
        })
        setQrDataUrl(dataUrl)
        setShowQR(true)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    } else {
      setShowQR(!showQR)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass rounded-2xl p-6 max-w-md w-full border border-white/20 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('share.pixtrTitle', { defaultValue: 'Share Pixtr' })}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition text-gray-700 dark:text-gray-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('share.pixtrDescription', {
            defaultValue:
              'Share Pixtr with friends and family so they can enjoy privacy-first photo storage too.',
          })}
        </p>

        {/* URL Display */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-500 mb-1">
              {t('share.pixtrUrl', { defaultValue: 'Pixtr URL' })}
            </p>
            <p className="text-lg font-semibold text-purple-600 dark:text-purple">
              {PIXTR_URL}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-4">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600
                       hover:from-purple-700 hover:to-pink-700 text-white font-semibold
                       transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                {t('share.copied', { defaultValue: 'Copied!' })}
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                {t('share.copyLink', { defaultValue: 'Copy Link' })}
              </>
            )}
          </button>

          {/* Native Share Button (if supported) */}
          {canShare && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10
                         text-gray-900 dark:text-white font-semibold transition
                         flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              {t('share.shareNative', { defaultValue: 'Share' })}
            </button>
          )}

          {/* QR Code Toggle Button */}
          <button
            onClick={handleShowQR}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10
                       text-gray-900 dark:text-white font-semibold transition
                       flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            {showQR
              ? t('share.hideQR', { defaultValue: 'Hide QR Code' })
              : t('share.showQR', { defaultValue: 'Show QR Code' })}
          </button>
        </div>

        {/* QR Code Display */}
        {showQR && qrDataUrl && (
          <div className="text-center py-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {t('share.scanQR', {
                defaultValue: 'Scan to visit Pixtr',
              })}
            </p>
            <img
              src={qrDataUrl}
              alt="Pixtr QR Code"
              className="mx-auto rounded-lg bg-white p-4"
              style={{ maxWidth: '200px' }}
            />
          </div>
        )}

        {/* Helper Text */}
        <p className="text-xs text-center text-gray-600 dark:text-gray-500 mt-4">
          {t('share.helperText', {
            defaultValue:
              'This shares the Pixtr app, not your personal photos or albums.',
          })}
        </p>
      </div>
    </div>
  )
}

export default SharePixtrModal
