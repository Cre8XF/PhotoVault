import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'

const TipsCarousel = () => {
  const { t } = useTranslation()
  const [currentTip, setCurrentTip] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)

  // Check if user has dismissed tips
  useEffect(() => {
    const dismissed = localStorage.getItem('tips-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  // Auto-rotate tips every 10 seconds
  useEffect(() => {
    if (isDismissed) return

    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % 10)
    }, 10000)

    return () => clearInterval(interval)
  }, [isDismissed])

  const handleDismiss = () => {
    localStorage.setItem('tips-dismissed', 'true')
    setIsDismissed(true)
  }

  const nextTip = () => {
    setCurrentTip(prev => (prev + 1) % 10)
  }

  const prevTip = () => {
    setCurrentTip(prev => (prev - 1 + 10) % 10)
  }

  if (isDismissed) return null

  // Tips array - all using i18n
  const tips = [
    t('tips:longPress'),
    t('tips:quickActions'),
    t('tips:searchFaces'),
    t('tips:shareQR'),
    t('tips:createCollage'),
    t('tips:favoriteSync'),
    t('tips:albumOrganize'),
    t('tips:pinchZoom'),
    t('tips:swipeNavigation'),
    t('tips:autoBackup')
  ]

  return (
    <div className="tips-carousel glass card-premium p-6 rounded-2xl mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('tips:title')}
          </h3>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common:close')}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="relative">
        <p className="text-gray-700 dark:text-gray-300 text-center py-4 px-12 min-h-[80px] flex items-center justify-center">
          {tips[currentTip]}
        </p>

        {/* Navigation buttons */}
        <button
          onClick={prevTip}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common:previous')}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          onClick={nextTip}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common:next')}
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-3">
        {tips.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentTip(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentTip
                ? 'bg-purple-600 w-6'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={`${t('tips:goToTip')} ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default TipsCarousel
