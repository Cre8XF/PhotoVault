import React from 'react'
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SlideshowControls = ({
  isPlaying,
  onTogglePlay,
  onPrevious,
  onNext,
  onExit,
  interval = 3,
  onIntervalChange,
}) => {
  const { t } = useTranslation(['common'])

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-card p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
        {/* Previous */}
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-white/10 rounded-lg transition"
          title={t('common:previous')}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition"
          title={isPlaying ? t('common:pause') : t('common:play')}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6" fill="currentColor" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="p-2 hover:bg-white/10 rounded-lg transition"
          title={t('common:next')}
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Interval selector */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
          <label className="text-sm text-gray-400">
            {t('common:slideshow.interval')}:
          </label>
          <select
            value={interval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm outline-none focus:border-purple-400"
          >
            <option value={2}>2s</option>
            <option value={3}>3s</option>
            <option value={5}>5s</option>
            <option value={7}>7s</option>
            <option value={10}>10s</option>
          </select>
        </div>

        {/* Exit */}
        <button
          onClick={onExit}
          className="p-2 hover:bg-red-500/20 rounded-lg transition ml-4 pl-4 border-l border-white/20"
          title={t('common:slideshow.exit')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default SlideshowControls
