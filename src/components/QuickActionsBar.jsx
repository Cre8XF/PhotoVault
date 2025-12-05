import React from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FolderPlus, Palette, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActionsBar = ({
  onUpload,
  onNewAlbum,
  onCreateCollage,
  onSearchFaces
}) => {
  const { t } = useTranslation(['home'])

  const actions = [
    {
      id: 'upload',
      icon: Upload,
      label: t('home:quickActions.upload'),
      onClick: onUpload,
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      id: 'newAlbum',
      icon: FolderPlus,
      label: t('home:quickActions.newAlbum'),
      onClick: onNewAlbum,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'createCollage',
      icon: Palette,
      label: t('home:quickActions.createCollage'),
      onClick: onCreateCollage,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      id: 'searchFaces',
      icon: Search,
      label: t('home:quickActions.searchFaces'),
      onClick: onSearchFaces,
      gradient: 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <div className="quick-actions-container">
      <div className="quick-actions">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="quick-action-btn ripple-effect"
            >
              <div className={`quick-action-icon-wrapper bg-gradient-to-br ${action.gradient}`}>
                <Icon className="quick-action-icon" />
              </div>
              <span className="quick-action-label">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActionsBar
