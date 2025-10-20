# 💻 Code Snippets - Ready to Use

## 🎯 Klar-til-bruk kodeeksempler

---

## 1. PHOTO GRID MED ALLE EFFEKTER

```jsx
// src/components/EnhancedPhotoGrid.jsx
import React from 'react';
import { Star, Heart } from 'lucide-react';

const EnhancedPhotoGrid = ({ photos, onPhotoClick, onToggleFavorite }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="card-3d-hover animate-scale-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="card-3d-inner">
            <div
              className="photo-container-enhanced ripple-effect card-press cursor-pointer"
              onClick={() => onPhotoClick(photo)}
            >
              {/* Main image */}
              <img
                src={photo.thumbnailMedium || photo.url}
                alt={photo.name || 'Photo'}
                className="w-full h-48 object-cover card-3d-layer-front gpu-layer"
                loading="lazy"
              />

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(photo.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full 
                         bg-black/30 backdrop-blur-sm hover:bg-black/50 
                         transition-all ripple-effect card-3d-layer-front z-10"
              >
                <Star
                  className={`w-5 h-5 transition-all ${
                    photo.favorite
                      ? 'text-yellow-400 fill-yellow-400 scale-110'
                      : 'text-white'
                  }`}
                />
              </button>

              {/* Info overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 p-3 
                          bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                          opacity-0 hover:opacity-100 transition-opacity duration-300 
                          card-3d-layer-mid"
              >
                <p className="text-white font-medium text-sm truncate">
                  {photo.name || 'Untitled'}
                </p>
                <p className="text-white/70 text-xs">
                  {new Date(photo.createdAt).toLocaleDateString('no-NO')}
                </p>
              </div>

              {/* Badge for special photos */}
              {photo.faces > 0 && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full 
                              bg-purple-600/80 backdrop-blur-sm text-white text-xs 
                              font-medium card-3d-layer-front">
                  {photo.faces} {photo.faces === 1 ? 'person' : 'personer'}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedPhotoGrid;
```

---

## 2. SMART ALBUM CARDS

```jsx
// src/components/SmartAlbumCard.jsx
import React from 'react';

const SmartAlbumCard = ({ 
  icon: Icon, 
  title, 
  description, 
  count, 
  gradient, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="card-gradient-border w-full ripple-effect card-press 
               hover:scale-105 transition-transform duration-300"
    >
      <div className="card-gradient-content">
        {/* Icon with gradient background */}
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-4`}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Title and count */}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        
        {/* Description */}
        {description && (
          <p className="text-sm opacity-70 mb-3">{description}</p>
        )}

        {/* Photo count with animation */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
              style={{ width: `${Math.min((count / 100) * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold">
            {count} {count === 1 ? 'bilde' : 'bilder'}
          </span>
        </div>
      </div>
    </button>
  );
};

// Usage example:
const SmartAlbums = () => {
  const albums = [
    {
      id: 'favorites',
      icon: Star,
      title: 'Favoritter',
      description: 'Dine beste bilder',
      count: 42,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'recent',
      icon: Clock,
      title: 'Nylig',
      description: 'Siste 7 dager',
      count: 15,
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {albums.map((album) => (
        <SmartAlbumCard
          key={album.id}
          icon={album.icon}
          title={album.title}
          description={album.description}
          count={album.count}
          gradient={album.gradient}
          onClick={() => console.log('Open album:', album.id)}
        />
      ))}
    </div>
  );
};

export default SmartAlbumCard;
```

---

## 3. TOAST SYSTEM - KOMPLETT IMPLEMENTERING

```jsx
// src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const Toast = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = toastIcons[toast.type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div className={`toast ${toast.type} ${isExiting ? 'toast-exit' : ''}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        {toast.title && (
          <p className="font-semibold text-sm mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="opacity-50 hover:opacity-100 transition ripple-effect p-1 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration || 3000,
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    show: showToast,
    success: (msg, opts) => showToast(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => showToast(msg, { ...opts, type: 'error' }),
    warning: (msg, opts) => showToast(msg, { ...opts, type: 'warning' }),
    info: (msg, opts) => showToast(msg, { ...opts, type: 'info' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Usage in App.js:
/*
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
*/

// Usage in components:
/*
import { useToast } from './contexts/ToastContext';

function MyComponent() {
  const toast = useToast();

  const handleUpload = async () => {
    try {
      await uploadPhoto();
      toast.success('Bilde lastet opp!', { 
        title: 'Suksess',
        duration: 2000 
      });
    } catch (error) {
      toast.error('Kunne ikke laste opp bilde', {
        title: 'Feil',
      });
    }
  };
}
*/
```

---

## 4. ENHANCED UPLOAD BUTTON MED PROGRESS

```jsx
// src/components/EnhancedUploadButton.jsx
import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';

const EnhancedUploadButton = ({ onUpload, accept = 'image/*', multiple = true }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate upload progress (replace with actual upload logic)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(i);
      }

      await onUpload(files);
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="upload-input"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <label
        htmlFor="upload-input"
        className={`btn-premium px-6 py-3 rounded-xl font-semibold 
                   flex items-center gap-3 ripple-effect cursor-pointer
                   relative overflow-hidden inline-flex
                   ${isUploading || isSuccess ? 'pointer-events-none' : ''}`}
      >
        {/* Progress bar */}
        {isUploading && (
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          {isSuccess ? (
            <>
              <Check className="w-5 h-5" />
              <span>Lastet opp!</span>
            </>
          ) : isUploading ? (
            <>
              <div className="loader-dots scale-75">
                <span />
                <span />
                <span />
              </div>
              <span>Laster opp... {progress}%</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Last opp bilder</span>
            </>
          )}
        </div>
      </label>
    </div>
  );
};

export default EnhancedUploadButton;
```

---

## 5. ENHANCED MODAL MED ANIMATIONS

```jsx
// src/components/EnhancedModal.jsx
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const EnhancedModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-2xl',
  showCloseButton = true,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();

      // Escape key to close
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop-enhanced"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`modal-content-enhanced ${maxWidth}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-all 
                       ripple-effect"
              aria-label="Lukk"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </>
  );
};

// Confirmation modal variant
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  message,
  confirmText = 'Bekreft',
  cancelText = 'Avbryt',
  variant = 'danger', // 'danger' | 'warning' | 'info'
}) => {
  const variants = {
    danger: 'from-red-600 to-red-700',
    warning: 'from-yellow-600 to-yellow-700',
    info: 'from-blue-600 to-blue-700',
  };

  return (
    <EnhancedModal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-lg mb-6 opacity-80">{message}</p>
      
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-xl hover:bg-white/10 transition-all 
                   ripple-effect font-medium"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-6 py-2 rounded-xl font-medium ripple-effect
                     bg-gradient-to-r ${variants[variant]} text-white
                     hover:scale-105 transition-transform`}
        >
          {confirmText}
        </button>
      </div>
    </EnhancedModal>
  );
};

export default EnhancedModal;
```

---

## 6. FLOATING ACTION BUTTON (FAB)

```jsx
// src/components/FloatingActionButton.jsx
import React, { useState } from 'react';
import { Plus, Upload, FolderPlus, Image } from 'lucide-react';

const FloatingActionButton = ({ onUpload, onCreateAlbum }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { 
      icon: Upload, 
      label: 'Last opp', 
      onClick: onUpload,
      color: 'from-purple-600 to-purple-700'
    },
    { 
      icon: FolderPlus, 
      label: 'Nytt album', 
      onClick: onCreateAlbum,
      color: 'from-blue-600 to-blue-700'
    },
  ];

  return (
    <div className="fixed bottom-32 right-6 z-50">
      {/* Action buttons */}
      {isExpanded && (
        <div className="mb-3 space-y-3 animate-scale-in">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="glass-sm px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
              <button
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                className={`p-4 rounded-full bg-gradient-to-r ${action.color}
                          shadow-lg hover:scale-110 transition-transform
                          ripple-effect`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600
                   shadow-2xl hover:scale-110 transition-all ripple-effect
                   ${isExpanded ? 'rotate-45' : ''}`}
      >
        <Plus className="w-7 h-7 text-white" />
      </button>
    </div>
  );
};

export default FloatingActionButton;
```

---

## 7. SEARCH BAR MED ANIMATIONS

```jsx
// src/components/EnhancedSearchBar.jsx
import React, { useState } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';

const EnhancedSearchBar = ({ onSearch, suggestions = [] }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div
        className={`glass rounded-2xl flex items-center gap-3 px-4 py-3
                   transition-all duration-300 ${
                     isFocused
                       ? 'ring-2 ring-purple-400 shadow-lg scale-105'
                       : ''
                   }`}
      >
        <Search className="w-5 h-5 text-purple-400" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Søk i bilder..."
          className="flex-1 bg-transparent outline-none placeholder-white/40"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="p-1 rounded-lg hover:bg-white/10 transition-all ripple-effect"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl 
                      overflow-hidden shadow-2xl animate-scale-in z-10">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSearch(suggestion)}
              className="w-full px-4 py-3 flex items-center gap-3 
                       hover:bg-white/10 transition-all text-left"
            >
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
```

---

## 8. STATS CARD MED COUNTER ANIMATION

```jsx
// src/components/StatsCard.jsx
import React, { useEffect, useState } from 'react';

const StatsCard = ({ icon: Icon, label, value, gradient, delay = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="glass p-6 rounded-2xl animate-scale-in hover:scale-105 
               transition-transform cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      <p className="text-3xl font-bold mb-1">{count}</p>
      <p className="text-sm opacity-70">{label}</p>
    </div>
  );
};

// Usage:
const StatsSection = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatsCard
      icon={Image}
      label="Bilder totalt"
      value={stats.total}
      gradient="from-purple-600 to-purple-700"
      delay={0}
    />
    <StatsCard
      icon={Star}
      label="Favoritter"
      value={stats.favorites}
      gradient="from-yellow-600 to-yellow-700"
      delay={0.1}
    />
    {/* ... more stats */}
  </div>
);

export default StatsCard;
```

---

## 9. SKELETON LOADER COMPONENTS

```jsx
// src/components/SkeletonLoaders.jsx
import React from 'react';

export const PhotoCardSkeleton = () => (
  <div className="skeleton-premium h-48 rounded-xl" />
);

export const PhotoGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <PhotoCardSkeleton key={i} />
    ))}
  </div>
);

export const AlbumCardSkeleton = () => (
  <div className="glass p-6 rounded-2xl">
    <div className="skeleton-premium h-10 w-10 rounded-xl mb-4" />
    <div className="skeleton-premium h-6 w-3/4 mb-2" />
    <div className="skeleton-premium h-4 w-1/2" />
  </div>
);

export const AlbumGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <AlbumCardSkeleton key={i} />
    ))}
  </div>
);

// Usage:
const MyComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState([]);

  return (
    <div>
      {isLoading ? (
        <PhotoGridSkeleton count={12} />
      ) : (
        <PhotoGrid photos={photos} />
      )}
    </div>
  );
};
```

---

## 10. COMPLETE APP INTEGRATION EXAMPLE

```jsx
// src/App.jsx - Complete example
import React, { useState } from 'react';
import { ToastProvider, useToast } from './contexts/ToastContext';
import EnhancedModal from './components/EnhancedModal';
import EnhancedPhotoGrid from './components/EnhancedPhotoGrid';
import FloatingActionButton from './components/FloatingActionButton';
import { PhotoGridSkeleton } from './components/SkeletonLoaders';

function AppContent() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUpload = async (files) => {
    setIsLoading(true);
    try {
      // Upload logic here
      await uploadPhotos(files);
      toast.success(`${files.length} bilder lastet opp!`);
      setIsUploadModalOpen(false);
    } catch (error) {
      toast.error('Kunne ikke laste opp bilder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (photoId) => {
    // Toggle logic
    toast.info('Favoritt oppdatert');
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Content */}
      {isLoading ? (
        <PhotoGridSkeleton count={12} />
      ) : (
        <EnhancedPhotoGrid
          photos={photos}
          onPhotoClick={(photo) => console.log('Open:', photo)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* FAB */}
      <FloatingActionButton
        onUpload={() => setIsUploadModalOpen(true)}
        onCreateAlbum={() => toast.info('Opprett album')}
      />

      {/* Upload Modal */}
      <EnhancedModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Last opp bilder"
      >
        <EnhancedUploadButton onUpload={handleUpload} />
      </EnhancedModal>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
```

---

## 🎯 TIPS FOR IMPLEMENTERING

1. **Start med én komponent om gangen**
2. **Test på mobile først**
3. **Bruk DevTools for å debugge animasjoner**
4. **Juster timing etter preferanser**
5. **Hold koden DRY (Don't Repeat Yourself)**

**Lykke til! 🚀**
