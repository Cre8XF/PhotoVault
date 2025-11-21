// AlbumsPage.jsx
// Rewritten and cleaned version

import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Folder,
  Grid as GridIcon,
  List,
  Move,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react'
import AlbumCard from '../components/AlbumCard'
import { SkeletonCard } from '../components/SkeletonCard'
import PhotoGridOptimized from '../components/PhotoGridOptimized'
import MoveModal from '../components/MoveModal'
import { updatePhotoAlbum, updatePhoto } from '../firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import useStore from '../state/store'
import { useCollageData } from '../hooks/useCollageData'

const AlbumsPage = ({
  user,
  albums = [],
  photos = [],
  onAlbumClick = () => {},
  onPhotoClick = () => {},
  refreshData = null,
  onDeleteAlbum = null,
  onEditAlbum = null,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'albums', 'collage'])

  // Plan detection
  const plan = user?.plan || 'free'
  const isFreeUser = plan === 'free'

  const [viewMode, setViewMode] = useState('albums') // 'albums' | 'photos'
  const [albumViewMode, setAlbumViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isMoveOpen, setMoveOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Collage state
  const [collages, setCollages] = useState([])
  const { getCollagesByUser, deleteCollage } = useCollageData()

  // Store actions
  const setConfirmModal = useStore((s) => s.setConfirmModal)
  const setNotification = useStore((s) => s.setNotification)
  const setAlbumModalOpen = useStore((s) => s.setAlbumModalOpen)
  const setEditingAlbum = useStore((s) => s.setEditingAlbum)
  const setCurrentPage = useStore((s) => s.setCurrentPage)

  // Load collages once
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const userCollages = await getCollagesByUser()
        if (mounted)
          setCollages(Array.isArray(userCollages) ? userCollages : [])
      } catch (err) {
        console.error('Failed to load collages', err)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [getCollagesByUser])

  // initial loading guard
  useEffect(() => {
    if ((albums && albums.length > 0) || (photos && photos.length > 0)) {
      setIsInitialLoading(false)
    } else {
      const tmr = setTimeout(() => setIsInitialLoading(false), 2000)
      return () => clearTimeout(tmr)
    }
  }, [albums, photos])

  // Derived values
  const safeAlbums = Array.isArray(albums) ? albums : []
  const safePhotos = Array.isArray(photos) ? photos : []

  const albumPhotos = useMemo(() => {
    // photos without albumId (unassigned photos)
    return safePhotos.filter((p) => !p.albumId)
  }, [safePhotos])

  const totalAlbums = safeAlbums.length
  const totalPhotos = safeAlbums.reduce(
    (sum, a) => sum + (a.photoCount || 0),
    0
  )
  const totalSizeMB = (
    safePhotos.reduce((sum, p) => sum + (p.size || 0), 0) /
    (1024 * 1024)
  ).toFixed(1)

  // Delete album handler
  const handleDeleteAlbum = (album) => {
    const albumPhotosList = safePhotos.filter((p) => p.albumId === album.id)
    const photosNote =
      albumPhotosList.length > 0
        ? t('common:notifications.deleteAlbumPhotosNote', {
            count: albumPhotosList.length,
          })
        : t('common:notifications.deleteAlbumEmptyNote')

    setConfirmModal({
      title: t('common:notifications.deleteAlbumTitle'),
      message: t('albums:confirmDeleteAlbum', { name: album.name, photosNote }),
      onConfirm: async () => {
        setLoading(true)
        try {
          // Debug info
          console.log('Deleting album', {
            id: album.id,
            name: album.name,
            userId: album.userId,
            currentUser: auth.currentUser?.uid,
          })

          if (!album.userId) {
            console.warn('Album missing userId; migrating recommended')
          }

          if (album.userId && album.userId !== auth.currentUser?.uid) {
            throw new Error('You do not own this album')
          }

          // Remove albumId from photos
          for (const p of albumPhotosList) {
            await updatePhoto(p.id, { albumId: null })
          }

          // Delete album doc
          await deleteDoc(doc(db, 'albums', album.id))

          if (refreshData) await refreshData()

          setNotification({
            message: t('common:deleted') || 'Slettet',
            type: 'success',
          })
        } catch (error) {
          console.error('Error deleting album', error)
          let errorMessage = t('common:errorOccurred')
          if (error.code === 'permission-denied') {
            errorMessage = t('albums:errors.permissionDenied')
          } else if (error.message) {
            errorMessage = error.message
          }
          setNotification({ message: errorMessage, type: 'error' })
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // Move photos confirm handler (passed to MoveModal)
  const handleMoveConfirm = async (albumId) => {
    if (!selectedPhotos || selectedPhotos.length === 0) return
    setLoading(true)
    try {
      for (const pid of selectedPhotos) {
        await updatePhotoAlbum(pid, albumId)
      }
      if (refreshData) await refreshData()
      setSelectedPhotos([])
      setNotification({
        message: t('albums:messages.movedPhotos') || 'Moved',
        type: 'success',
      })
    } catch (err) {
      console.error('Error moving photos', err)
      setNotification({
        message: t('albums:errors.couldNotMovePhotos'),
        type: 'error',
      })
    } finally {
      setLoading(false)
      setMoveOpen(false)
    }
  }

  // Render helpers
  const renderMetrics = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-sm text-gray-400">{t('common:albums')}</p>
        <p className="text-2xl font-bold">{totalAlbums}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-sm text-gray-400">{t('common:photos')}</p>
        <p className="text-2xl font-bold">{totalPhotos}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-sm text-gray-400">{t('common:storage')}</p>
        <p className="text-2xl font-bold">{totalSizeMB} MB</p>
      </div>
    </div>
  )

  const renderHeaderActions = () => (
    <div className="flex items-center gap-3">
      {selectedPhotos.length > 0 ? (
        <button
          onClick={() => setMoveOpen(true)}
          className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Move size={18} /> {t('common:moveToAlbum')}
        </button>
      ) : (
        <>
          <button
            onClick={() => setAlbumModalOpen(true)}
            className="ripple-effect px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common:album')}</span>
          </button>

          {!isFreeUser && (
            <button
              onClick={() => setCurrentPage('collage')}
              className="ripple-effect px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition"
            >
              <GridIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t('collage:createButton')}
              </span>
            </button>
          )}
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('common:albums')}</h1>
        {renderHeaderActions()}
      </div>

      {renderMetrics()}

      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Collages */}
          {!isFreeUser &&
            viewMode === 'albums' &&
            collages &&
            collages.length > 0 && (
              <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GridIcon className="w-5 h-5 text-purple-400" />
                {t('collage:myCollages')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collages.map((collage, idx) => (
                  <div
                    key={collage.id}
                    className={`relative group animate-fade-in-up stagger-${
                      (idx % 12) + 1
                    }`}
                  >
                    <div
                      onClick={() => navigate(`/collage/${collage.id}`)}
                      className="cursor-pointer glass-card rounded-xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all"
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center overflow-hidden">
                        {collage.thumbnailUrl ? (
                          <img
                            src={collage.thumbnailUrl}
                            alt={collage.title || 'Collage'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ display: collage.thumbnailUrl ? 'none' : 'flex' }}
                        >
                          <GridIcon className="w-16 h-16 opacity-30" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm truncate">
                          {collage.title}
                        </h3>
                        <p className="text-xs opacity-60 mt-1">
                          {collage.photoIds?.length || 0} photos •{' '}
                          {collage.createdAt
                            ? new Date(collage.createdAt).toLocaleDateString()
                            : ''}
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/collage/edit/${collage.id}`)
                        }}
                        className="p-2 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg shadow-lg transition"
                        title={t('common:edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmModal({
                            title: t('buttons:confirmDelete'),
                            message: `Are you sure you want to delete "${collage.title}"?`,
                            onConfirm: async () => {
                              await deleteCollage(collage.id)
                              const userCollages = await getCollagesByUser()
                              setCollages(userCollages)
                            },
                          })
                        }}
                        className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-lg transition"
                        title={t('common:delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Collage empty state */}
          {!isFreeUser &&
            viewMode === 'albums' &&
            (!collages || collages.length === 0) && (
              <div className="mb-8 p-8 bg-white/5 rounded-xl border border-white/10 text-center">
              <GridIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">
                {t('collage:emptyState.title')}
              </h3>
              <p className="text-sm opacity-60 mb-4">
                {t('collage:emptyState.description')}
              </p>
              <button
                onClick={() => setCurrentPage('collage')}
                className="ripple-effect px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
              >
                {t('collage:emptyState.createFirst')}
              </button>
            </div>
          )}

          {/* Albums list */}
          {viewMode === 'albums' && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-400" />
                  My Albums
                </h2>

                {/* View toggle buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlbumViewMode('grid')}
                    className={`p-2 rounded-lg transition ${
                      albumViewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                    title="Grid View"
                  >
                    <GridIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAlbumViewMode('list')}
                    className={`p-2 rounded-lg transition ${
                      albumViewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid view */}
              {albumViewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeAlbums.map((album, index) => (
                  <div
                    key={album.id}
                    className={`relative group animate-fade-in-up stagger-${
                      (index % 12) + 1
                    }`}
                  >
                    <AlbumCard
                      album={album}
                      photos={safePhotos}
                      onOpen={() => onAlbumClick(album)}
                    />

                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingAlbum(album)
                          setAlbumModalOpen(true)
                          if (onEditAlbum) onEditAlbum(album)
                        }}
                        className="p-2 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg shadow-lg transition"
                        title={t('common:edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAlbum(album)
                          if (onDeleteAlbum) onDeleteAlbum(album)
                        }}
                        className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-lg transition"
                        title={t('common:delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {/* List view */}
              {albumViewMode === 'list' && (
                <div className="flex flex-col gap-3">
                  {safeAlbums.map((album, index) => {
                    const albumPhotosList = safePhotos.filter(
                      (p) => p.albumId === album.id
                    )
                    const count = albumPhotosList.length

                    // Handle video thumbnails for album cover
                    const firstPhoto = albumPhotosList[0]
                    const fallbackUrl = firstPhoto?.type === 'video'
                      ? (firstPhoto.thumbnailUrl || firstPhoto.url)
                      : firstPhoto?.url
                    const coverUrl = album.cover || fallbackUrl || ''

                    let updatedStr = ''
                    const updatedAt = album.updatedAt || album.createdAt
                    if (updatedAt) {
                      const d = new Date(updatedAt)
                      if (!isNaN(d.getTime())) {
                        updatedStr = d.toLocaleDateString('no-NO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      }
                    }

                    return (
                      <div
                        key={album.id}
                        className={`relative group animate-fade-in-up stagger-${
                          (index % 12) + 1
                        } glass-card rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition`}
                        onClick={() => onAlbumClick(album)}
                      >
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-900">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={album.name || 'Album'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Folder className="w-8 h-8 opacity-30" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">
                            {typeof album.name === 'object'
                              ? album.name.name || JSON.stringify(album.name)
                              : album.name || t('common:noName')}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {t('common:photoCount', { count })}
                            {updatedStr ? ' · ' + updatedStr : ''}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingAlbum(album)
                              setAlbumModalOpen(true)
                              if (onEditAlbum) onEditAlbum(album)
                            }}
                            className="p-2 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg shadow-lg transition"
                            title={t('common:edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAlbum(album)
                              if (onDeleteAlbum) onDeleteAlbum(album)
                            }}
                            className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-lg transition"
                            title={t('common:delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Photos view (unassigned photos) */}
          {viewMode === 'photos' && (
            <section>
              <PhotoGridOptimized
                photos={albumPhotos}
                onPhotoClick={onPhotoClick}
                selectedPhotos={selectedPhotos}
                setSelectedPhotos={setSelectedPhotos}
              />
            </section>
          )}
        </>
      )}

      {/* Move modal */}
      <MoveModal
        isOpen={isMoveOpen}
        onClose={() => setMoveOpen(false)}
        albums={safeAlbums}
        onConfirm={handleMoveConfirm}
      />
    </div>
  )
}

export default AlbumsPage
