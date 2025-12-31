import React from 'react'
import { X, Sparkles, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * CollageUpgradeModal - Shown to GRATIS users when they try to create a collage
 * Encourages upgrade BEFORE user invests time in building
 *
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {object} template - Selected template (optional)
 */
export default function CollageUpgradeModal({ isOpen, onClose, template }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleUpgrade = () => {
    navigate('/subscription')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="bg-card rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition p-2 hover:bg-white/5 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Unlock Collage Creation
          </h2>
          <p className="text-muted-foreground text-sm">
            Create beautiful collages with the {template?.name || 'template'} layout
          </p>
        </div>

        {/* Template preview (small) */}
        {template?.previewSlots && (
          <div className="mb-6 rounded-lg overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
            <div
              className="w-full aspect-square rounded-lg bg-muted/50 overflow-hidden grid gap-0.5 p-0.5 mx-auto max-w-[200px]"
              style={{
                gridTemplateColumns: `repeat(${Math.max(...template.previewSlots.map((s) => s.col + s.colSpan - 1))}, 1fr)`,
                gridTemplateRows: `repeat(${Math.max(...template.previewSlots.map((s) => s.row + s.rowSpan - 1))}, 1fr)`,
              }}
            >
              {template.previewSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-gradient-to-br from-purple-500/60 to-pink-500/60 rounded-sm"
                  style={{
                    gridColumn: `${slot.col} / span ${slot.colSpan}`,
                    gridRow: `${slot.row} / span ${slot.rowSpan}`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-3 mb-6">
          <FeatureItem text="Create unlimited collages" />
          <FeatureItem text="Choose from 20+ templates" />
          <FeatureItem text="High-resolution exports" />
          <FeatureItem text="5 GB storage included" />
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity mb-3 shadow-lg hover:shadow-xl"
        >
          Upgrade to LITE — $9/month
        </button>

        <button
          onClick={onClose}
          className="w-full text-muted-foreground py-2 text-sm hover:text-foreground transition"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-purple-400" />
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}
