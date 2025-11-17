// ============================================================================
// APP.js – v6.0 Phase 2: Modern Architecture with Zustand & Hooks
// ============================================================================
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from './i18n'

// Contexts
import {
  SecurityProvider,
  useSecurityContext,
} from './contexts/SecurityContext'
import { ToastProvider } from './contexts/ToastContext'

// Pages
import LoginPage from './pages/LoginPage'
import HomeDashboard from './pages/HomeDashboard'
import AlbumsPage from './pages/AlbumsPage'
import SearchPage from './pages/SearchPage'
import MorePage from './pages/MorePage'
import AlbumPage from './pages/AlbumPage'
import AdminDashboard from './pages/AdminDashboard'
import SecuritySettings from './pages/SecuritySettings'
import VaultPage from './pages/VaultPage'
import ProfilePage from './pages/ProfilePage'
import SubscriptionPage from './pages/SubscriptionPage'
import PublicAlbumPage from './pages/PublicAlbumPage'

// Collage Builder
import CollageBuilder from './features/collage/components/CollageBuilder'
import CollageView from './features/collage/pages/CollageView'

// Components
import ErrorBoundary from './components/ErrorBoundary'
import UploadModal from './components/UploadModal'
import PhotoModal from './components/PhotoModal'
import AlbumModal from './components/AlbumModal'
import ConfirmModal from './components/ConfirmModal'
import Notification from './components/Notification'
import Particles from './components/Particles'
import PINLockScreen from './components/PINLockScreen'
import NotificationPanel from './components/NotificationPanel'

// Hooks
import useAuth from './hooks/useAuth'
import usePhotoData from './hooks/usePhotoData'
import useStore from './state/store'

// Icons
import { Home, FolderOpen, Plus, Search, Menu, Bell } from 'lucide-react'

/**
 * Main App Component with new architecture
 */
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <SecurityProvider>
            <Routes>
              {/* Public route - no authentication required */}
              <Route path="/share/:slug" element={<PublicAlbumPage />} />

              {/* Collage routes */}
              <Route path="/collage/edit/:id" element={<CollageBuilder />} />
              <Route path="/collage/:id" element={<CollageView />} />

              {/* All other routes - authenticated */}
              <Route path="*" element={<AppContent />} />
            </Routes>
          </SecurityProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

/**
 * App Content Component
 */
function AppContent() {
  const { t } = useTranslation(['common', 'nav'])

  // Custom hooks
  const { user, userProfile, loading, handleLogout, isAdmin } = useAuth()
  const {
    albums,
    photos,
    handleUpload,
    handleAlbumSave,
    handleCreateAlbumFromUpload,
    handleDeletePhoto,
    handleSetAlbumCover,
    handleUpdatePhotoCount,
    toggleFavorite,
    refreshData,
  } = usePhotoData()

  // Security context
  const { isLocked, pinEnabled } = useSecurityContext()

  // Zustand store
  const uploadModalOpen = useStore((state) => state.uploadModalOpen)
  const albumModalOpen = useStore((state) => state.albumModalOpen)
  const photoModalOpen = useStore((state) => state.photoModalOpen)
  const confirmModal = useStore((state) => state.confirmModal)
  const notification = useStore((state) => state.notification)
  const editingAlbum = useStore((state) => state.editingAlbum)
  const selectedPhotoIndex = useStore((state) => state.selectedPhotoIndex)
  const isDarkMode = useStore((state) => state.isDarkMode)
  const currentPage = useStore((state) => state.currentPage)
  const selectedAlbum = useStore((state) => state.selectedAlbum)
  const storageUsed = useStore((state) => state.storageUsed)
  const storageLimit = useStore((state) => state.storageLimit)

  const setUploadModalOpen = useStore((state) => state.setUploadModalOpen)
  const setAlbumModalOpen = useStore((state) => state.setAlbumModalOpen)
  const setEditingAlbum = useStore((state) => state.setEditingAlbum)
  const setPhotoModalOpen = useStore((state) => state.setPhotoModalOpen)
  const setConfirmModal = useStore((state) => state.setConfirmModal)
  const clearNotification = useStore((state) => state.clearNotification)
  const setCurrentPage = useStore((state) => state.setCurrentPage)
  const setSelectedAlbum = useStore((state) => state.setSelectedAlbum)
  const setTheme = useStore((state) => state.setTheme)

  // Handle photo click
  const handlePhotoClick = (photo) => {
    const index = photos.findIndex((p) => p.id === photo.id)
    const setSelectedPhotoIndex = useStore.getState().setSelectedPhotoIndex
    setSelectedPhotoIndex(index)
    setPhotoModalOpen(true)
  }

  // Handle album click
  const handleAlbumClick = (album) => {
    setSelectedAlbum(album)
    setCurrentPage('album')
  }

  // Handle navigate to photo from notification
  const handleNavigateToPhoto = (photoId) => {
    const photo = photos.find((p) => p.id === photoId)
    if (photo) {
      handlePhotoClick(photo)
    }
  }

  // Apply theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme !== 'light'
    setTheme(isDark)
  }, [setTheme])

  // Global drag & drop for file uploads
  React.useEffect(() => {
    if (!user) return

    const handleGlobalDrop = (e) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))

      if (imageFiles.length > 0 && !uploadModalOpen) {
        setUploadModalOpen(true)
        setTimeout(() => {
          const event = new CustomEvent('externalFileDrop', {
            detail: imageFiles,
          })
          window.dispatchEvent(event)
        }, 100)
      }
    }

    const handleGlobalDragOver = (e) => {
      e.preventDefault()
    }

    window.addEventListener('drop', handleGlobalDrop)
    window.addEventListener('dragover', handleGlobalDragOver)

    return () => {
      window.removeEventListener('drop', handleGlobalDrop)
      window.removeEventListener('dragover', handleGlobalDragOver)
    }
  }, [user, uploadModalOpen, setUploadModalOpen])

  // Set initial language on mount
  React.useEffect(() => {
    const savedLang = localStorage.getItem('photoVaultLanguage') || 'no'
    i18n.changeLanguage(savedLang)
  }, [])

  // Show loading spinner
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage />
  }

  // Show PIN lock screen if locked
  if (isLocked && pinEnabled) {
    return <PINLockScreen />
  }

  // Determine if we should show bottom navigation
  const showBottomNav =
    currentPage !== 'album' &&
    currentPage !== 'admin' &&
    currentPage !== 'security' &&
    currentPage !== 'vault' &&
    currentPage !== 'profile' &&
    currentPage !== 'subscription' &&
    currentPage !== 'collage'

  return (
    <div className="min-h-screen relative">
      <Particles />

      {/* Main content - state-based rendering */}
      <main className="relative z-10">
        {currentPage === 'home' && (
          <HomeDashboard
            albums={albums}
            photos={photos}
            user={userProfile || user}
            onNavigate={setCurrentPage}
            refreshData={refreshData}
          />
        )}

        {currentPage === 'albums' && (
          <AlbumsPage
            albums={albums}
            photos={photos}
            onNavigate={setCurrentPage}
            onAlbumClick={handleAlbumClick}
            onPhotoClick={handlePhotoClick}
            toggleFavorite={toggleFavorite}
            refreshData={refreshData}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage
            photos={photos}
            albums={albums}
            onPhotoClick={handlePhotoClick}
            toggleFavorite={toggleFavorite}
            refreshData={refreshData}
          />
        )}

        {currentPage === 'more' && (
          <MorePage
            user={userProfile || user}
            storageUsed={storageUsed}
            storageLimit={storageLimit}
            photos={photos}
            albums={albums}
            isDarkMode={isDarkMode}
            setIsDarkMode={setTheme}
            onLogout={handleLogout}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'security' && (
          <SecuritySettings onBack={() => setCurrentPage('more')} />
        )}

        {currentPage === 'vault' && <VaultPage />}

        {currentPage === 'profile' && (
          <ProfilePage onBack={() => setCurrentPage('more')} />
        )}

        {currentPage === 'subscription' && (
          <SubscriptionPage onBack={() => setCurrentPage('more')} />
        )}

        {currentPage === 'album' && selectedAlbum && (
          <AlbumPage
            album={selectedAlbum}
            albums={albums}
            user={userProfile || user}
            photos={photos}
            onBack={() => {
              setCurrentPage('albums')
              setSelectedAlbum(null)
            }}
            refreshData={refreshData}
            onDeletePhoto={handleDeletePhoto}
            onSetAlbumCover={handleSetAlbumCover}
            onUpload={handleUpload}
            onSaveAlbum={handleAlbumSave}
            onUpdatePhotoCount={handleUpdatePhotoCount}
            onToggleFavorite={toggleFavorite}
            colors={{}}
          />
        )}

        {console.log('🔍 Current page state:', currentPage)}
        {console.log('🔍 isAdmin value:', isAdmin)}

        {currentPage === 'admin' && isAdmin && (
          <>
            {console.log('🔍 RENDERING ADMIN DASHBOARD')}
            {console.log('🔍 currentPage:', currentPage)}
            {console.log('🔍 isAdmin:', isAdmin)}
            <AdminDashboard
              onBack={() => {
                console.log('🔍 BACK BUTTON CLICKED')
                setCurrentPage('more')
              }}
            />
          </>
        )}

        {currentPage === 'collage' && (
          <CollageBuilder />
        )}
      </main>

      {/* Floating Notification Bell - Bottom right */}
      {user && (
        <div className="fixed z-40 bottom-20 right-4">
          <NotificationPanel onNavigateToPhoto={handleNavigateToPhoto} />
        </div>
      )}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="bottom-nav-float">
          <div className="flex justify-around items-center gap-2">
            {/* Home */}
            <button
              onClick={() => setCurrentPage('home')}
              className={`ripple-effect nav-item-premium ${
                currentPage === 'home' ? 'active' : ''
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:home')}</span>
            </button>

            {/* Albums */}
            <button
              onClick={() => setCurrentPage('albums')}
              className={`ripple-effect nav-item-premium ${
                currentPage === 'albums' ? 'active' : ''
              }`}
            >
              <FolderOpen className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:albums')}</span>
            </button>

            {/* Upload (center FAB) */}
            <button
              onClick={() => setUploadModalOpen(true)}
              className="ripple-effect bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-full shadow-lg transition transform hover:scale-110 -mt-6"
              aria-label={t('nav:upload')}
            >
              <Plus className="w-7 h-7 text-white" />
            </button>

            {/* Search */}
            <button
              onClick={() => setCurrentPage('search')}
              className={`ripple-effect nav-item-premium ${
                currentPage === 'search' ? 'active' : ''
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:search')}</span>
            </button>

            {/* More */}
            <button
              onClick={() => setCurrentPage('more')}
              className={`ripple-effect nav-item-premium ${
                currentPage === 'more' ? 'active' : ''
              }`}
            >
              <Menu className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:more')}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modals */}
      {uploadModalOpen && (
        <UploadModal
          isOpen={uploadModalOpen}
          albums={albums}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUpload}
          onCreateAlbum={handleCreateAlbumFromUpload}
        />
      )}

      {albumModalOpen && (
        <AlbumModal
          editingAlbum={editingAlbum}
          onClose={() => {
            setAlbumModalOpen(false)
            setEditingAlbum(null)
          }}
          onSave={(albumData) => handleAlbumSave(albumData, editingAlbum)}
        />
      )}

      {photoModalOpen && (
        <PhotoModal
          photos={photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setPhotoModalOpen(false)}
          onToggleFavorite={toggleFavorite}
          onPhotoEdited={async (newPhoto) => {
            // Refresh photos to show the new edited photo
            await refreshData();
          }}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
          confirmLabel={confirmModal.confirmLabel || t('common:confirm')}
          cancelLabel={confirmModal.cancelLabel || t('common:cancel')}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </div>
  )
}

export default App
