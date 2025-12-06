import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles, ArrowRight, Grid3x3, Layout, Image } from 'lucide-react'
import '../styles/collageTeaser.css'

/**
 * CollageTeaser Component
 * Showcases Pixtr's unique collage creation feature
 * Displays between Favoritter and Recent sections on HomeDashboard
 */
const CollageTeaser = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['home'])

  const templates = [
    {
      id: 'grid',
      icon: Grid3x3,
      name: t('home:collageTeaser.gridTemplate', 'Grid'),
      slots: [
        { col: 1, row: 1, span: 1 },
        { col: 2, row: 1, span: 1 },
        { col: 1, row: 2, span: 1 },
        { col: 2, row: 2, span: 1 }
      ]
    },
    {
      id: 'story',
      icon: Layout,
      name: t('home:collageTeaser.storyTemplate', 'Story'),
      slots: [
        { col: 1, row: 1, span: 2 },
        { col: 1, row: 2, span: 1 },
        { col: 2, row: 2, span: 1 }
      ]
    },
    {
      id: 'polaroid',
      icon: Image,
      name: t('home:collageTeaser.polaroidTemplate', 'Polaroid'),
      slots: [
        { col: 1, row: 1, span: 1, rotate: -5 },
        { col: 2, row: 1, span: 1, rotate: 3 },
        { col: 1, row: 2, span: 1, rotate: 2 }
      ]
    }
  ]

  return (
    <section className="collage-teaser-section">
      <div className="collage-teaser-container">
        {/* Shimmer background */}
        <div className="collage-shimmer" />

        {/* Content */}
        <div className="collage-teaser-content">
          {/* Icon with sparkle animation */}
          <div className="collage-icon-wrapper">
            <Sparkles className="collage-sparkle-icon" />
          </div>

          {/* Title & Description */}
          <div className="collage-text">
            <h3 className="collage-title">
              {t('home:collageTeaser.title', 'Create Beautiful Collages')}
            </h3>
            <p className="collage-description">
              {t('home:collageTeaser.description', 'Turn your photos into stunning layouts in seconds')}
            </p>
          </div>

          {/* Template Previews */}
          <div className="collage-templates-preview">
            {templates.map((template) => (
              <div key={template.id} className="template-preview-card">
                <div className="template-preview-grid">
                  {template.slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="template-slot"
                      style={{
                        gridColumn: `${slot.col} / span ${slot.span || 1}`,
                        gridRow: `${slot.row} / span ${slot.span || 1}`,
                        transform: slot.rotate ? `rotate(${slot.rotate}deg)` : undefined
                      }}
                    />
                  ))}
                </div>
                <span className="template-name">{template.name}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/tools/collage/templates')}
            className="collage-cta-button"
          >
            <span>{t('home:collageTeaser.cta', 'Start Creating')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default CollageTeaser
