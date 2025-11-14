import React from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check } from 'lucide-react'

const QRCodeDisplay = ({ url, albumName, onDownload, onCopyLink }) => {
  const { t } = useTranslation(['qrshare'])
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await onCopyLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* QR Code */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <QRCodeSVG
          id="qr-code-svg"
          value={url}
          size={256}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/logo192.png", // Optional: App logo i midten
            height: 48,
            width: 48,
            excavate: true,
          }}
        />
      </div>

      {/* Album name */}
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{albumName}</h3>
        <p className="text-sm opacity-70">
          {t('qrshare:qr.scanInstructions')}
        </p>
      </div>

      {/* URL display */}
      <div className="w-full glass p-4 rounded-xl">
        <p className="text-sm opacity-70 mb-2">{t('qrshare:qr.shareLink')}:</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 bg-transparent text-sm"
          />
          <button
            onClick={handleCopy}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
            title={t('qrshare:qr.copyLink')}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onDownload}
          className="ripple-effect flex-1 glass p-4 rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>{t('qrshare:qr.downloadButton')}</span>
        </button>
      </div>
    </div>
  )
}

export default QRCodeDisplay
