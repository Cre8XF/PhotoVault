// ============================================================================
// APP.js – v6.0 Phase 2: Modern Architecture with Zustand & Hooks
// ============================================================================
import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom'
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

// Function Worlds - Phase 1
import ToolsPage from './pages/ToolsPage'
import CollageTemplatesPage from './pages/CollageTemplatesPage'
import CollageNewPage from './pages/CollageNewPage'
import CollageEditPage from './pages/CollageEditPage'
import PhotoPage from './pages/PhotoPage'
import SlideshowPage from './pages/SlideshowPage'

// AI Tools - Phase 5
import AIToolsPage from './pages/ai/AIToolsPage'
import AIEnhancePage from './pages/ai/AIEnhancePage'
import AIRemoveBgPage from './pages/ai/AIRemoveBgPage'
import AIPortraitPage from './pages/ai/AIPortraitPage'
import AIColorPage from './pages/ai/AIColorPage'
import AIUpscalePage from './pages/ai/AIUpscalePage'

// Collage View (for viewing saved collages)
import CollageView from './features/collage/pages/CollageView'

// Route map
import { ROUTES } from './routes'

// Components
import ErrorBoundary from './components/ErrorBoundary'
import UploadModal from './components/UploadModal'
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

              {/* Function Worlds - Phase 1 */}
              <Route path={ROUTES.TOOLS} element={<ToolsPage />} />
              <Route
                path={ROUTES.COLLAGE_TEMPLATES}
                element={<CollageTemplatesPage />}
              />
              <Route path={ROUTES.COLLAGE_NEW} element={<CollageNewPage />} />
              <Route path={ROUTES.COLLAGE_EDIT} element={<CollageEditPage />} />
              <Route path={ROUTES.PHOTO} element={<PhotoPage />} />
              <Route path={ROUTES.SLIDESHOW} element={<SlideshowPage />} />

              {/* AI Tools - Phase 5 */}
              <Route path={ROUTES.AI_TOOLS} element={<AIToolsPage />} />
              <Route path={ROUTES.AI_ENHANCE} element={<AIEnhancePage />} />
              <Route path={ROUTES.AI_REMOVE_BG} element={<AIRemoveBgPage />} />
              <Route path={ROUTES.AI_PORTRAIT} element={<AIPortraitPage />} />
              <Route path={ROUTES.AI_COLOR} element={<AIColorPage />} />
              <Route path={ROUTES.AI_UPSCALE} element={<AIUpscalePage />} />

              {/* Collage view route (for viewing saved collages) */}
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
  const navigate = useNavigate()
  const location = useLocation()

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

  // Determine user plan (FREE by default)
  const plan = userProfile?.plan || user?.plan || 'free'
  const isFreeUser = plan === 'free'

  // Security context
  const { isLocked, pinEnabled } = useSecurityContext()

  // Zustand store
  const uploadModalOpen = useStore((state) => state.uploadModalOpen)
  const albumModalOpen = useStore((state) => state.albumModalOpen)
  const confirmModal = useStore((state) => state.confirmModal)
  const notification = useStore((state) => state.notification)
  const editingAlbum = useStore((state) => state.editingAlbum)
  const selectedPhotoIndex = useStore((state) => state.selectedPhotoIndex)
  const isDarkMode = useStore((state) => state.isDarkMode)
  const selectedAlbum = useStore((state) => state.selectedAlbum)
  const storageUsed = useStore((state) => state.storageUsed)
  const storageLimit = useStore((state) => state.storageLimit)
  const isFullscreen = useStore((state) => state.isFullscreen)
  const isWorldView = useStore((state) => state.isWorldView)

  const setUploadModalOpen = useStore((state) => state.setUploadModalOpen)
  const setAlbumModalOpen = useStore((state) => state.setAlbumModalOpen)
  const setEditingAlbum = useStore((state) => state.setEditingAlbum)
  const setConfirmModal = useStore((state) => state.setConfirmModal)
  const clearNotification = useStore((state) => state.clearNotification)
  const setSelectedAlbum = useStore((state) => state.setSelectedAlbum)
  const setTheme = useStore((state) => state.setTheme)

  // Photo context setters - Phase 2A
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId)
  const setPhotoContext = useStore((state) => state.setPhotoContext)
  const setPhotoOrder = useStore((state) => state.setPhotoOrder)
  const setPhotoIndex = useStore((state) => state.setPhotoIndex)

  // Context-aware photo source state
  const [photoSourceList, setPhotoSourceList] = React.useState([])
  const [photoSourceIndex, setPhotoSourceIndex] = React.useState(0)

  // Phase 2A: Handle photo click - Navigate to PhotoPage
  const handlePhotoClick = (photo, sourceList) => {
    const list = Array.isArray(sourceList) ? sourceList : photos
    const index = list.findIndex((p) => p.id === photo.id)
    const photoIndex = index >= 0 ? index : 0
    const photoIds = list.map((p) => p.id)

    // Determine context based on current page
    const currentPath = location.pathname
    let context = 'all'
    if (currentPath.startsWith('/albums') || currentPath.startsWith('/album/') || selectedAlbum) {
      context = 'album'
    } else if (currentPath === '/search') {
      context = 'search'
    } else if (currentPath === '/') {
      // Check if it's favorites by seeing if sourceList is favoritePhotos
      const isFavorites = list.every((p) => p.favorite)
      context = isFavorites ? 'favorites' : 'all'
    }

    // Set global photo context state
    setCurrentPhotoId(photo.id)
    setPhotoContext(context)
    setPhotoOrder(photoIds)
    setPhotoIndex(photoIndex)

    // Keep legacy state for backward compatibility
    setPhotoSourceList(list)
    setPhotoSourceIndex(photoIndex)

    // Navigate to PhotoPage instead of opening modal
    navigate(`/photo/${photo.id}`, { state: { from: location } })
  }

  // Handle album click
  const handleAlbumClick = (album) => {
    setSelectedAlbum(album)
    navigate(`/album/${album.id}`)
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

  // Save metadata on window unload (Phase 1)
  React.useEffect(() => {
    if (!user) return

    const saveMetadata = useStore.getState().saveMetadata

    const handleBeforeUnload = (e) => {
      // Force immediate save before page closes
      console.log('🔄 [App] Saving metadata before page unload...')
      saveMetadata(true) // immediate save
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user])

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
  // Phase 1: Hide bottom nav when in any "world view"
  const currentPath = location.pathname
  const showBottomNav =
    !isWorldView &&
    !isFullscreen &&
    !currentPath.startsWith('/album/') &&
    currentPath !== '/admin' &&
    currentPath !== '/security' &&
    currentPath !== '/vault' &&
    currentPath !== '/profile' &&
    currentPath !== '/subscription' &&
    !currentPath.startsWith('/collage/')

  return (
    <div className="min-h-screen relative">
      <Particles />

      {/* Main content - React Router based rendering */}
      <main className="relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <HomeDashboard
                albums={albums}
                photos={photos}
                user={userProfile || user}
                refreshData={refreshData}
                onPhotoClick={handlePhotoClick}
                onUpload={handleUpload}
              />
            }
          />

          <Route
            path="/albums"
            element={
              <AlbumsPage
                user={userProfile || user}
                albums={albums}
                photos={photos}
                onAlbumClick={handleAlbumClick}
                onPhotoClick={handlePhotoClick}
                toggleFavorite={toggleFavorite}
                refreshData={refreshData}
              />
            }
          />

          <Route
            path="/search"
            element={
              <SearchPage
                photos={photos}
                albums={albums}
                onPhotoClick={handlePhotoClick}
                toggleFavorite={toggleFavorite}
                refreshData={refreshData}
              />
            }
          />

          <Route
            path="/more"
            element={
              <MorePage
                user={userProfile || user}
                storageUsed={storageUsed}
                storageLimit={storageLimit}
                photos={photos}
                albums={albums}
                isDarkMode={isDarkMode}
                setIsDarkMode={setTheme}
                onLogout={handleLogout}
              />
            }
          />

          <Route
            path="/security"
            element={<SecuritySettings />}
          />

          <Route
            path="/vault"
            element={<VaultPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/subscription"
            element={<SubscriptionPage user={userProfile || user} />}
          />

          <Route
            path="/album/:albumId"
            element={
              <AlbumPage
                albums={albums}
                user={userProfile || user}
                photos={photos}
                refreshData={refreshData}
                onDeletePhoto={handleDeletePhoto}
                onSetAlbumCover={handleSetAlbumCover}
                onUpload={handleUpload}
                onSaveAlbum={handleAlbumSave}
                onUpdatePhotoCount={handleUpdatePhotoCount}
                onToggleFavorite={toggleFavorite}
              />
            }
          />

          {isAdmin && (
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />
          )}
        </Routes>
      </main>

      {/* Floating Notification Bell - Bottom left */}
      {!isFreeUser && (
        <div className="fixed bottom-24 left-4 z-30">
          <NotificationPanel onNavigateToPhoto={handleNavigateToPhoto} />
        </div>
      )}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="bottom-nav-float">
          <div className="flex justify-around items-center gap-2">
            {/* Home */}
            <button
              onClick={() => navigate('/')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/' ? 'active' : ''
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:home')}</span>
            </button>

            {/* Albums */}
            <button
              onClick={() => navigate('/albums')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/albums' ? 'active' : ''
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
              onClick={() => navigate('/search')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/search' ? 'active' : ''
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:search')}</span>
            </button>

            {/* More */}
            <button
              onClick={() => navigate('/more')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/more' ? 'active' : ''
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
        <Notification notification={notification} onClose={clearNotification} />
      )}
    </div>
  )
}

export default App
