// ============================================================================
// SlideshowPage - Phase 2B: Fullscreen Slideshow World
// ============================================================================
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react';
import useStore from '../state/store';
import { usePhotoById } from '../hooks/usePhotoById';
import { usePhotoContext } from '../hooks/usePhotoContext';
import { usePrefetchAdjacentPhotos } from '../hooks/usePrefetchAdjacentPhotos';

export default function SlideshowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [uiVisible, setUiVisible] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on mount
  const [intervalSec, setIntervalSec] = useState(5); // Configurable interval
  const uiTimerRef = useRef(null);
  const slideTimerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Store
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const setSlideshowActive = useStore((state) => state.setSlideshowActive);
  const photos = useStore((state) => state.photos);

  // Custom hooks
  const { photo, loading, error } = usePhotoById(id);
  const {
    photoContext,
    photoOrder,
    photoIndex,
    setPhotoIndex,
    setCurrentPhotoId,
  } = usePhotoContext();

  // Prefetch adjacent photos
  usePrefetchAdjacentPhotos(photoOrder, photoIndex, photos);

  // Set world view and slideshow active on mount
  useEffect(() => {
    setIsWorldView(true);
    setSlideshowActive(true);
    setCurrentPhotoId(id);
    return () => {
      setIsWorldView(false);
      setSlideshowActive(false);
      setCurrentPhotoId(null);
    };
  }, [setIsWorldView, setSlideshowActive, setCurrentPhotoId, id]);

  // Reset UI timer on any interaction
  const resetUiTimer = useCallback(() => {
    setUiVisible(true);
    if (uiTimerRef.current) {
      clearTimeout(uiTimerRef.current);
    }
    uiTimerRef.current = setTimeout(() => {
      setUiVisible(false);
    }, 3000);
  }, []);

  // Handle navigation to next photo (with wrap around)
  const handleNext = useCallback(() => {
    if (!Array.isArray(photoOrder) || photoOrder.length === 0) return;

    const nextIndex = photoIndex >= photoOrder.length - 1 ? 0 : photoIndex + 1;
    const nextId = photoOrder[nextIndex];

    setPhotoIndex(nextIndex);
    setCurrentPhotoId(nextId);
    setImageLoaded(false);
    navigate(`/slideshow/${nextId}`, { replace: true });
    resetUiTimer();
  }, [photoOrder, photoIndex, setPhotoIndex, setCurrentPhotoId, navigate, resetUiTimer]);

  // Handle navigation to previous photo (with wrap around)
  const handlePrev = useCallback(() => {
    if (!Array.isArray(photoOrder) || photoOrder.length === 0) return;

    const prevIndex = photoIndex <= 0 ? photoOrder.length - 1 : photoIndex - 1;
    const prevId = photoOrder[prevIndex];

    setPhotoIndex(prevIndex);
    setCurrentPhotoId(prevId);
    setImageLoaded(false);
    navigate(`/slideshow/${prevId}`, { replace: true });
    resetUiTimer();
  }, [photoOrder, photoIndex, setPhotoIndex, setCurrentPhotoId, navigate, resetUiTimer]);

  // Handle exit slideshow
  const handleExit = useCallback(() => {
    // Return to PhotoPage for current photo, or back to context
    if (id) {
      navigate(`/photo/${id}`, { replace: true });
    } else if (location.state?.from) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate, id, location]);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    resetUiTimer();
  }, [resetUiTimer]);

  // Auto-advance slideshow when playing
  useEffect(() => {
    if (!isPlaying) {
      // Clear interval when paused
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
        slideTimerRef.current = null;
      }
      return;
    }

    // Set up auto-advance interval
    slideTimerRef.current = setInterval(() => {
      handleNext();
    }, intervalSec * 1000);

    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
        slideTimerRef.current = null;
      }
    };
  }, [isPlaying, intervalSec, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'Escape':
          handleExit();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handlePlayPause, handleExit]);

  // Touch/swipe navigation
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX.current - touchEndX.current;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left → next
          handleNext();
        } else {
          // Swipe right → prev
          handlePrev();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleNext, handlePrev]);

  // Reset timer on mouse move
  useEffect(() => {
    const handleMouseMove = () => {
      resetUiTimer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [resetUiTimer]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (uiTimerRef.current) {
        clearTimeout(uiTimerRef.current);
      }
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
      }
    };
  }, []);

  // Toggle UI on image click
  const handleImageClick = () => {
    if (uiVisible) {
      setUiVisible(false);
      if (uiTimerRef.current) {
        clearTimeout(uiTimerRef.current);
      }
    } else {
      resetUiTimer();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // Error state
  if (error || !photo) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center text-white">
        <div className="text-center max-w-sm px-4">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-white/60 mb-4">{error || 'Photo not found'}</p>
          <button
            onClick={handleExit}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            Exit slideshow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Top Bar */}
      <header
        className={`fixed top-0 inset-x-0 z-[10000] h-14 backdrop-blur-md overlay-on-image transition-opacity duration-300 text-on-glass ${
          uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left: Back button */}
          <button
            onClick={handleExit}
            className="flex items-center gap-2 text-white hover:bg-white/10 rounded-full p-2 transition active:scale-95"
            aria-label="Exit slideshow"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Center: Title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-white text-sm font-medium">Slideshow</h1>
            {photoContext && photoOrder && photoOrder.length > 0 && (
              <p className="text-white/60 text-xs">
                {photoIndex + 1} / {photoOrder.length}
              </p>
            )}
          </div>

          {/* Right: Exit X button */}
          <button
            onClick={handleExit}
            className="text-white hover:bg-white/10 p-2 rounded-full transition active:scale-95"
            aria-label="Exit"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Image Canvas */}
      <main className="flex-1 flex items-center justify-center p-0">
        <img
          src={photo.url}
          alt={photo.caption || photo.name || 'Photo'}
          className={`max-w-full max-h-[100vh] object-contain transition-opacity duration-500 cursor-pointer ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onClick={handleImageClick}
          draggable={false}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="spinner" />
          </div>
        )}
      </main>

      {/* Bottom Controls - Floating Pill */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] transition-opacity duration-300 ${
          uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-black/40 dark:bg-black/60 backdrop-blur-md rounded-full flex items-center gap-4 px-6 py-3 text-on-glass drop-shadow-lg">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="hover:bg-white/10 p-2 rounded-full transition active:scale-95"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="hover:bg-white/10 p-3 rounded-full transition active:scale-95"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" fill="currentColor" />
            ) : (
              <Play className="w-7 h-7" fill="currentColor" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="hover:bg-white/10 p-2 rounded-full transition active:scale-95"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Interval Control */}
          <div className="border-l border-white/20 pl-4">
            <select
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="bg-black/40 text-white text-xs px-2 py-1 rounded border border-white/20 cursor-pointer"
            >
              <option value={2}>2s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
