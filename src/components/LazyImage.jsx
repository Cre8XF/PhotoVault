// ============================================================================
// LazyImage.jsx - Optimized lazy loading image component
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { getCachedThumbnail, cacheThumbnail } from '../utils/cacheManager';

const LazyImage = ({
  src,
  thumbnail,
  alt = '',
  className = '',
  photoId,
  onLoad,
  onClick,
  loading = 'lazy',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Try to load from cache first
    const loadFromCache = async () => {
      if (photoId) {
        const cached = await getCachedThumbnail(photoId, 'small');
        if (cached) {
          const url = URL.createObjectURL(cached);
          setCurrentSrc(url);
          setIsLoading(false);
          return true;
        }
      }
      return false;
    };

    loadFromCache();
  }, [photoId]);

  useEffect(() => {
    if (!imgRef.current) return;

    // Intersection Observer for lazy loading
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage();
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        }
      });
    }, options);

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src, thumbnail]);

  const loadImage = async () => {
    try {
      // Load thumbnail first if available
      if (thumbnail && !currentSrc) {
        setCurrentSrc(thumbnail);
        
        // Cache thumbnail if photoId is provided
        if (photoId) {
          try {
            const response = await fetch(thumbnail);
            const blob = await response.blob();
            await cacheThumbnail(photoId, 'small', blob);
          } catch (err) {
            console.error('Failed to cache thumbnail:', err);
          }
        }
      }

      // Then load full image
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoading(false);
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        setError(true);
        setIsLoading(false);
      };
    } catch (err) {
      console.error('Image load error:', err);
      setError(true);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800`}>
        <div className="text-gray-500 text-sm">Failed to load</div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-800 animate-pulse`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
      
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onClick={onClick}
          loading={loading}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
