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
  uiVisible = true,
}) => {
  const { t } = useTranslation(['common'])

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-4 bg-black/60 dark:bg-black/70 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl border border-white/10">
        {/* Previous */}
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-white/10 rounded-full transition active:scale-95 text-white"
          title={t('common:previous')}
          aria-label={t('common:previous')}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause - Larger, centered */}
        <button
          onClick={onTogglePlay}
          className="p-4 bg-purple-600 hover:bg-purple-700 rounded-full transition active:scale-95 shadow-lg"
          title={isPlaying ? t('common:pause') : t('common:play')}
          aria-label={isPlaying ? t('common:pause') : t('common:play')}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6 text-white" fill="currentColor" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="p-2 hover:bg-white/10 rounded-full transition active:scale-95 text-white"
          title={t('common:next')}
          aria-label={t('common:next')}
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Interval selector */}
        <div className="h-8 w-px bg-white/20 mx-2" />
        <select
          value={interval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-purple-400 transition cursor-pointer"
          aria-label={t('common:slideshow.interval')}
        >
          <option value={2}>2s</option>
          <option value={3}>3s</option>
          <option value={5}>5s</option>
          <option value={7}>7s</option>
          <option value={10}>10s</option>
        </select>

        {/* Exit Slideshow */}
        <div className="h-8 w-px bg-white/20 mx-2" />
        <button
          onClick={onExit}
          className="p-2 bg-red-600/80 hover:bg-red-700 rounded-full transition active:scale-95 text-white"
          title={t('common:slideshow.exitSlideshow')}
          aria-label={t('common:slideshow.exitSlideshow')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default SlideshowControls
