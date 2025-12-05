import React from 'react'
import { useTranslation } from 'react-i18next'

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  const { t } = useTranslation()

  return (
    <div className="empty-state animate-scale-in">
      <div className="empty-state-content">
        <div className="empty-state-icon">
          {icon}
        </div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="empty-state-action ripple-effect"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default EmptyState
