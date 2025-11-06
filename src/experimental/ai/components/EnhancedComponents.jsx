// ============================================================================
// ENHANCED COMPONENTS - Eksempler på bruk av nye visuelle forbedringer
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Enhanced Photo Card med 3D og ripple-effekt
// ----------------------------------------------------------------------------

import React from 'react';
import { Star } from 'lucide-react';

export const EnhancedPhotoCard = ({ photo, onClick, onFavorite }) => {
  return (
    <div 
      className="card-3d-hover cursor-pointer"
      onClick={onClick}
    >
      <div className="card-3d-inner">
        <div className="photo-container-enhanced ripple-effect card-press">
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full h-48 object-cover card-3d-layer-front"
            loading="lazy"
          />
          
          {/* Favorite star */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(photo.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm 
                     hover:bg-black/50 transition-all card-3d-layer-front z-10"
          >
            <Star 
              className={`w-5 h-5 ${photo.favorite ? 'text-yellow-400 fill-current' : 'text-white'}`}
            />
          </button>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 
                        bg-gradient-to-t from-black/80 to-transparent
                        opacity-0 hover:opacity-100 transition-opacity
                        card-3d-layer-mid">
            <p className="text-white font-medium truncate">{photo.name}</p>
            <p className="text-white/70 text-sm">
              {new Date(photo.createdAt).toLocaleDateString('no-NO')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 2. Premium Bottom Navigation
// ----------------------------------------------------------------------------

import { Home, Image, Search, Settings } from 'lucide-react';

export const PremiumBottomNav = ({ activeTab, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Hjem' },
    { id: 'albums', icon: Image, label: 'Album' },
    { id: 'search', icon: Search, label: 'Søk' },
    { id: 'more', icon: Settings, label: 'Mer' },
  ];

  return (
    <nav className="bottom-nav-float">
      <div className="flex justify-around items-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-item-premium flex-1 ripple-effect ${
              activeTab === item.id ? 'active' : ''
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// ----------------------------------------------------------------------------
// 3. Toast Notification System
// ----------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = toastIcons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${type} ${isExiting ? 'toast-exit' : ''}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="opacity-50 hover:opacity-100 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for å bruke toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    warning: (msg) => showToast(msg, 'warning'),
    info: (msg) => showToast(msg, 'info'),
  };
};

// ----------------------------------------------------------------------------
// 4. Enhanced Modal
// ----------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const EnhancedModal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-backdrop-enhanced" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="modal-content-enhanced"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition ripple-effect"
            aria-label="Lukk"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </>
  );
};

// ----------------------------------------------------------------------------
// 5. Gradient Border Card (for Smart Albums)
// ----------------------------------------------------------------------------

import { Calendar } from 'lucide-react';

export const GradientBorderCard = ({ icon: Icon, title, count, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="card-gradient-border w-full ripple-effect card-press"
    >
      <div className="card-gradient-content text-left">
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${color} mb-4`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-70">
          {count} {count === 1 ? 'bilde' : 'bilder'}
        </p>
      </div>
    </button>
  );
};

// ----------------------------------------------------------------------------
// 6. Enhanced Loading States
// ----------------------------------------------------------------------------

export const DualRingLoader = () => (
  <div className="flex justify-center items-center py-12">
    <div className="loader-dual-ring" />
  </div>
);

export const DotsLoader = () => (
  <div className="flex justify-center items-center py-12">
    <div className="loader-dots">
      <span />
      <span />
      <span />
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="skeleton-premium h-48 w-full" />
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ----------------------------------------------------------------------------
// 7. Interactive Emoji Component
// ----------------------------------------------------------------------------

export const InteractiveEmoji = ({ emoji, label }) => (
  <span 
    className="emoji-interactive text-3xl"
    role="img"
    aria-label={label}
  >
    {emoji}
  </span>
);

// ----------------------------------------------------------------------------
// 8. Enhanced Upload Button
// ----------------------------------------------------------------------------

import { Upload } from 'lucide-react';

export const EnhancedUploadButton = ({ onClick, isUploading }) => (
  <button
    onClick={onClick}
    disabled={isUploading}
    className="btn-premium px-6 py-3 rounded-xl font-semibold 
             flex items-center gap-2 ripple-effect
             disabled:opacity-50 disabled:cursor-not-allowed
             relative overflow-hidden"
  >
    {isUploading ? (
      <>
        <div className="loader-dots scale-50">
          <span />
          <span />
          <span />
        </div>
        <span>Laster opp...</span>
      </>
    ) : (
      <>
        <Upload className="w-5 h-5" />
        <span>Last opp bilder</span>
      </>
    )}
  </button>
);

// ----------------------------------------------------------------------------
// 9. Parallax Hero Section
// ----------------------------------------------------------------------------

export const ParallaxHero = ({ user, stats }) => {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const layer1 = document.querySelector('.parallax-layer-1');
      const layer2 = document.querySelector('.parallax-layer-2');
      const layer3 = document.querySelector('.parallax-layer-3');

      if (layer1) layer1.style.transform = `translateY(${scrolled * 0.1}px)`;
      if (layer2) layer2.style.transform = `translateY(${scrolled * 0.2}px)`;
      if (layer3) layer3.style.transform = `translateY(${scrolled * 0.3}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="parallax-wrapper relative h-80 mb-8">
      <div className="parallax-layer-1 absolute inset-0 flex items-center justify-center">
        <h1 className="text-5xl font-bold text-gradient">
          Velkommen, {user?.displayName}!
        </h1>
      </div>
      
      <div className="parallax-layer-2 absolute inset-0 flex items-end justify-center pb-12">
        <div className="flex gap-6">
          <div className="glass-sm px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold">{stats.photos}</span>
            <span className="text-sm opacity-70 ml-2">bilder</span>
          </div>
          <div className="glass-sm px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold">{stats.albums}</span>
            <span className="text-sm opacity-70 ml-2">album</span>
          </div>
        </div>
      </div>

      <div className="parallax-layer-3 absolute inset-0 pointer-events-none">
        {/* Decorative elements */}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 10. Komplett Eksempel - Enhanced Home Dashboard
// ----------------------------------------------------------------------------

export const EnhancedHomeDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { toasts, showToast, removeToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoClick = (photo) => {
    showToast.success(`Åpnet ${photo.name}`);
  };

  const handleFavorite = (photoId) => {
    showToast.info('Lagt til i favoritter');
  };

  return (
    <>
      {/* Toast container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Main content */}
      <div className="min-h-screen p-6 md:p-10 pb-24">
        {/* Hero med parallax */}
        <ParallaxHero 
          user={{ displayName: 'Bruker' }}
          stats={{ photos: 142, albums: 12 }}
        />

        {/* Smart Albums Grid */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="icon-glow-pulse">✨</span>
            Smarte Album
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GradientBorderCard
              icon={Calendar}
              title="Siste 30 dager"
              count={42}
              color="from-blue-500 to-cyan-500"
              onClick={() => showToast.info('Åpner Siste 30 dager')}
            />
            {/* Add more cards... */}
          </div>
        </section>

        {/* Photos Grid */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Favoritter</h2>
          {isLoading ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Render EnhancedPhotoCard components */}
            </div>
          )}
        </section>

        {/* Upload button */}
        <div className="fixed bottom-32 right-6 z-50">
          <EnhancedUploadButton
            onClick={() => setIsModalOpen(true)}
            isUploading={isLoading}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <PremiumBottomNav
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      {/* Upload Modal */}
      <EnhancedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Last opp bilder"
      >
        <p>Modal innhold her...</p>
      </EnhancedModal>
    </>
  );
};

// ----------------------------------------------------------------------------
// USAGE INSTRUCTIONS
// ----------------------------------------------------------------------------

/*
For å bruke disse komponentene:

1. Kopier CSS-stilene fra enhanced-styles.css til src/index.css

2. Importer komponentene i eksisterende filer:

   // I App.js eller HomeDashboard.jsx
   import { useToast, ToastContainer } from './components/EnhancedComponents';
   import { PremiumBottomNav } from './components/EnhancedComponents';

3. Erstatt eksisterende komponenter gradvis:

   // Gammel kode:
   <div className="glass p-6 rounded-2xl">

   // Ny kode:
   <GradientBorderCard 
     icon={Calendar}
     title="Album"
     count={42}
     color="from-blue-500 to-cyan-500"
   />

4. Legg til toast-funksjonalitet:

   const { toasts, showToast, removeToast } = useToast();

   // Bruk i event handlers:
   showToast.success('Bilde lastet opp!');
   showToast.error('Noe gikk galt');

5. Test responsiveness og performance på mobile enheter

6. Juster timing og animasjoner etter preferanser
*/
