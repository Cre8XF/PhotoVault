# 💻 PhotoVault FASE 2 - Kodeeksempler

## 📚 Innholdsfortegnelse

1. [Basic Setup](#basic-setup)
2. [Upload med Compression](#upload-med-compression)
3. [Lazy Loading Images](#lazy-loading-images)
4. [Infinite Scroll Gallery](#infinite-scroll-gallery)
5. [Cache Management](#cache-management)
6. [Advanced Scenarios](#advanced-scenarios)

---

## Basic Setup

### **1. Import og initialiser**

```javascript
// I App.js eller hovedkomponent
import PhotoGridOptimized from './components/PhotoGridOptimized';
import UploadModalOptimized from './components/UploadModalOptimized';
import { uploadPhoto, uploadThumbnail, addPhoto } from './firebase';
import { compressImage, generateThumbnails } from './utils/imageOptimization';
```

---

## Upload med Compression

### **Enkel upload med auto-compression**

```javascript
import { compressImage, generateThumbnails } from './utils/imageOptimization';
import { uploadPhoto, uploadThumbnail, addPhoto } from './firebase';

async function handleSimpleUpload(file, userId) {
  try {
    // 1. Komprimer hovedbilde
    const compressedBlob = await compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85
    });

    // 2. Generer thumbnails
    const thumbnails = await generateThumbnails(file);

    // 3. Konverter til File
    const compressedFile = new File(
      [compressedBlob], 
      file.name, 
      { type: 'image/jpeg' }
    );

    // 4. Last opp hovedbilde
    const { downloadURL, storagePath } = await uploadPhoto(
      compressedFile,
      userId,
      'default-album'
    );

    // 5. Last opp thumbnails
    const photoId = storagePath.split('/').pop().split('_')[0];
    
    const { downloadURL: thumbSmall } = await uploadThumbnail(
      thumbnails.small,
      userId,
      photoId,
      'small'
    );

    const { downloadURL: thumbMedium } = await uploadThumbnail(
      thumbnails.medium,
      userId,
      photoId,
      'medium'
    );

    // 6. Lagre metadata
    await addPhoto({
      url: downloadURL,
      thumbnailSmall: thumbSmall,
      thumbnailMedium: thumbMedium,
      storagePath,
      userId,
      name: file.name,
      size: compressedFile.size,
      type: compressedFile.type,
      createdAt: new Date().toISOString()
    });

    console.log('✓ Upload komplett!');
  } catch (error) {
    console.error('Upload feilet:', error);
  }
}
```

### **Batch upload med progress**

```javascript
import { batchCompressImages } from './utils/imageOptimization';

async function handleBatchUpload(files, userId) {
  const [setProgress, setMessage] = useState([0, '']);

  try {
    setMessage('Komprimerer bilder...');
    
    // Komprimer alle bilder
    const compressedFiles = await batchCompressImages(
      files,
      { maxWidth: 1920, maxHeight: 1080, quality: 0.85 },
      (progress) => {
        setProgress(progress.percentage);
        setMessage(`Komprimerer ${progress.current}/${progress.total}`);
      }
    );

    // Last opp alle
    for (let i = 0; i < compressedFiles.length; i++) {
      const file = compressedFiles[i];
      if (!file) continue; // Skip failed compressions

      setMessage(`Laster opp ${i + 1}/${compressedFiles.length}`);
      
      // Upload logic her (samme som enkel upload)
      await handleSimpleUpload(file, userId);
    }

    setMessage('Alle bilder lastet opp!');
  } catch (error) {
    setMessage('Feil ved opplasting');
    console.error(error);
  }
}
```

---

## Lazy Loading Images

### **Grunnleggende bruk**

```javascript
import LazyImage from './components/LazyImage';

function PhotoCard({ photo }) {
  return (
    <div className="photo-card">
      <LazyImage
        src={photo.url}
        thumbnail={photo.thumbnailSmall}
        photoId={photo.id}
        alt={photo.title}
        className="w-full h-64 object-cover rounded-lg"
        onLoad={() => console.log('Bilde lastet!')}
      />
    </div>
  );
}
```

### **Med custom loading state**

```javascript
import LazyImage from './components/LazyImage';
import { Loader } from 'lucide-react';

function PhotoCardWithLoader({ photo }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <Loader className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      )}
      
      <LazyImage
        src={photo.url}
        thumbnail={photo.thumbnailSmall}
        photoId={photo.id}
        alt={photo.title}
        className="w-full h-64 object-cover rounded-lg"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
```

### **Manual lazy loading (uten komponent)**

```javascript
import { useEffect, useRef, useState } from 'react';

function ManualLazyImage({ src, thumbnail, alt }) {
  const [currentSrc, setCurrentSrc] = useState(thumbnail);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Last full image
            const img = new Image();
            img.src = src;
            img.onload = () => setCurrentSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className="transition-opacity duration-300"
    />
  );
}
```

---

## Infinite Scroll Gallery

### **Standard implementering**

```javascript
import PhotoGridOptimized from './components/PhotoGridOptimized';

function GalleryPage() {
  const [photos, setPhotos] = useState([]);

  return (
    <PhotoGridOptimized
      photos={photos}
      title="Mine bilder"
      refreshPhotos={() => loadPhotos()}
      enableInfiniteScroll={true}
      itemsPerPage={20}
      showFavoriteButton={true}
    />
  );
}
```

### **Med custom hook**

```javascript
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import LazyImage from './components/LazyImage';

function CustomGallery({ allPhotos }) {
  const {
    displayedItems,
    hasMore,
    isLoading,
    sentinelRef,
    stats
  } = useInfiniteScroll(allPhotos, 20);

  return (
    <div>
      <p>Viser {stats.displayed} av {stats.total} bilder</p>
      
      <div className="grid grid-cols-4 gap-4">
        {displayedItems.map(photo => (
          <LazyImage
            key={photo.id}
            src={photo.url}
            thumbnail={photo.thumbnailSmall}
            photoId={photo.id}
            className="w-full h-48 object-cover"
          />
        ))}
      </div>

      {/* Sentinel element */}
      {hasMore && (
        <div ref={sentinelRef} className="py-8 text-center">
          {isLoading && <p>Laster flere...</p>}
        </div>
      )}
    </div>
  );
}
```

### **Virtual scrolling for ekstreme lister (1000+ items)**

```javascript
import { useVirtualScroll } from './hooks/useInfiniteScroll';

function VirtualGallery({ photos }) {
  const {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    stats
  } = useVirtualScroll(photos, 200, 600);

  return (
    <div
      ref={containerRef}
      style={{ height: '600px', overflow: 'auto' }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((photo, index) => (
            <div key={photo.id} style={{ height: '200px' }}>
              <LazyImage src={photo.url} thumbnail={photo.thumbnailSmall} />
            </div>
          ))}
        </div>
      </div>
      <p>Viser {stats.start}-{stats.end} av {stats.total}</p>
    </div>
  );
}
```

---

## Cache Management

### **Grunnleggende caching**

```javascript
import {
  cacheThumbnail,
  getCachedThumbnail,
  cacheImage
} from './utils/cacheManager';

// Cache et thumbnail
async function saveThumbnailToCache(photoId, blob) {
  await cacheThumbnail(photoId, 'small', blob);
  console.log('✓ Thumbnail cached');
}

// Hent fra cache
async function loadFromCache(photoId) {
  const cached = await getCachedThumbnail(photoId, 'small');
  
  if (cached) {
    const url = URL.createObjectURL(cached);
    console.log('✓ Loaded from cache');
    return url;
  }
  
  console.log('Cache miss - loading from network');
  return null;
}
```

### **Cache stats og cleanup**

```javascript
import {
  getCacheStats,
  clearExpiredCache,
  clearAllCache
} from './utils/cacheManager';

function CacheManager() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const data = await getCacheStats();
    setStats(data);
  }

  async function cleanup() {
    const result = await clearExpiredCache();
    console.log(`Slettet ${result.deletedCount} utløpte entries`);
    loadStats();
  }

  async function clearAll() {
    await clearAllCache();
    console.log('All cache slettet');
    loadStats();
  }

  return (
    <div>
      {stats && (
        <div>
          <p>Thumbnails: {stats.thumbnails}</p>
          <p>Bilder: {stats.images}</p>
          <p>Totalt: {stats.total}</p>
        </div>
      )}
      <button onClick={cleanup}>Rydd opp utløpte</button>
      <button onClick={clearAll}>Slett all cache</button>
    </div>
  );
}
```

### **Pre-caching strategy**

```javascript
async function preCachePhotos(photos) {
  console.log('Pre-caching thumbnails...');
  
  for (const photo of photos) {
    try {
      // Skip hvis allerede cached
      const cached = await getCachedThumbnail(photo.id, 'small');
      if (cached) continue;

      // Fetch og cache
      const response = await fetch(photo.thumbnailSmall);
      const blob = await response.blob();
      await cacheThumbnail(photo.id, 'small', blob);
      
      console.log(`✓ Cached ${photo.id}`);
    } catch (err) {
      console.error(`Failed to cache ${photo.id}:`, err);
    }
  }
  
  console.log('Pre-caching complete!');
}

// Bruk ved app start eller ved idle time
useEffect(() => {
  const timer = setTimeout(() => {
    preCachePhotos(recentPhotos);
  }, 2000); // Start etter 2 sekunder

  return () => clearTimeout(timer);
}, [recentPhotos]);
```

---

## Advanced Scenarios

### **Progressive image quality**

```javascript
function ProgressiveImage({ photo }) {
  const [quality, setQuality] = useState('low'); // low → medium → high

  return (
    <div className="relative">
      {quality === 'low' && (
        <LazyImage
          src={photo.thumbnailSmall}
          className="blur-sm"
          onLoad={() => setQuality('medium')}
        />
      )}
      
      {quality === 'medium' && (
        <LazyImage
          src={photo.thumbnailMedium}
          className="blur-xs"
          onLoad={() => setQuality('high')}
        />
      )}
      
      {quality === 'high' && (
        <img src={photo.url} className="sharp" />
      )}
    </div>
  );
}
```

### **Smart preloading (neste/forrige bilde)**

```javascript
function Lightbox({ photos, currentIndex }) {
  useEffect(() => {
    // Preload neste og forrige bilde
    const preloadIndexes = [currentIndex - 1, currentIndex + 1];
    
    preloadIndexes.forEach(index => {
      if (index >= 0 && index < photos.length) {
        const img = new Image();
        img.src = photos[index].url;
      }
    });
  }, [currentIndex, photos]);

  return (
    <div>
      <img src={photos[currentIndex].url} alt="" />
    </div>
  );
}
```

### **Adaptive quality basert på nettverkshastighet**

```javascript
import { useEffect, useState } from 'react';

function useNetworkQuality() {
  const [quality, setQuality] = useState('high');

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateQuality = () => {
        const effectiveType = connection.effectiveType;
        
        if (effectiveType === '4g') {
          setQuality('high');
        } else if (effectiveType === '3g') {
          setQuality('medium');
        } else {
          setQuality('low');
        }
      };

      updateQuality();
      connection.addEventListener('change', updateQuality);

      return () => connection.removeEventListener('change', updateQuality);
    }
  }, []);

  return quality;
}

function AdaptiveGallery({ photos }) {
  const networkQuality = useNetworkQuality();

  const qualitySettings = {
    low: { maxWidth: 1280, quality: 0.7 },
    medium: { maxWidth: 1920, quality: 0.8 },
    high: { maxWidth: 3840, quality: 0.9 }
  };

  return (
    <div>
      <p>Network: {networkQuality}</p>
      {/* Bruk kvalitetsinnstillingene ved upload/compression */}
    </div>
  );
}
```

### **Error recovery med retry**

```javascript
async function uploadWithRetry(file, userId, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await handleSimpleUpload(file, userId);
      return result;
    } catch (error) {
      attempt++;
      console.log(`Upload attempt ${attempt} failed:`, error);

      if (attempt >= maxRetries) {
        throw new Error(`Upload failed after ${maxRetries} attempts`);
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### **Offline queue system**

```javascript
const uploadQueue = [];

async function queueUpload(file, userId) {
  if (!navigator.onLine) {
    // Offline - legg til i kø
    uploadQueue.push({ file, userId, timestamp: Date.now() });
    console.log('Offline - lagt til i kø');
    return;
  }

  await handleSimpleUpload(file, userId);
}

// Når tilkoblingen er tilbake
window.addEventListener('online', async () => {
  console.log('Online - prosesserer kø...');
  
  while (uploadQueue.length > 0) {
    const item = uploadQueue.shift();
    try {
      await handleSimpleUpload(item.file, item.userId);
    } catch (err) {
      // Legg tilbake i kø hvis det feiler
      uploadQueue.unshift(item);
      break;
    }
  }
});
```

---

## 🎯 Best Practices

### **1. Alltid validér før upload**

```javascript
import { validateImage } from './utils/imageOptimization';

const validation = validateImage(file, {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  return;
}
```

### **2. Vis progress til bruker**

```javascript
const [uploadProgress, setUploadProgress] = useState({
  current: 0,
  total: 0,
  percentage: 0
});

// Oppdater UI basert på progress
{uploadProgress.total > 0 && (
  <div className="progress-bar">
    <div style={{ width: `${uploadProgress.percentage}%` }} />
    <p>{uploadProgress.current} / {uploadProgress.total}</p>
  </div>
)}
```

### **3. Cleanup on unmount**

```javascript
useEffect(() => {
  // Cleanup object URLs for å unngå minnelekkasje
  return () => {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
  };
}, []);
```

---

Disse eksemplene dekker de mest vanlige bruksscenarioene for FASE 2-funksjonaliteten! 🚀
