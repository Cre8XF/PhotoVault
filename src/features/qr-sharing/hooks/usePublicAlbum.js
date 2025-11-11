import { useState, useEffect } from 'react'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  doc,
} from 'firebase/firestore'

export const usePublicAlbum = (slug) => {
  const [album, setAlbum] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchPublicAlbum = async () => {
      try {
        const db = getFirestore()

        // Finn album basert på slug
        const albumsRef = collection(db, 'albums')
        const q = query(albumsRef, where('publicSlug', '==', slug))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          console.log('❌ [usePublicAlbum] Album not found for slug:', slug)
          setError('Album ikke funnet')
          setLoading(false)
          return
        }

        const albumDoc = querySnapshot.docs[0]
        const albumData = { id: albumDoc.id, ...albumDoc.data() }

        // Sjekk om albumet er offentlig
        if (!albumData.isPublic) {
          console.log('❌ [usePublicAlbum] Album is not public')
          setError('Dette albumet er ikke lenger offentlig tilgjengelig')
          setLoading(false)
          return
        }

        // Sjekk om delingen er utløpt
        if (albumData.publicSettings?.expiresAt) {
          const expiryDate = new Date(albumData.publicSettings.expiresAt)
          if (expiryDate < new Date()) {
            console.log('❌ [usePublicAlbum] Album has expired')
            setError('Denne delingslenken har utløpt')
            setLoading(false)
            return
          }
        }

        setAlbum(albumData)

        // Verify userId exists
        if (!albumData.userId) {
          console.error('❌ [usePublicAlbum] Album has no userId field!')
          setError('Albumdata mangler bruker-ID')
          setLoading(false)
          return
        }

        // Set up real-time listener for album changes (deletion, privacy, expiry)
        const albumDocRef = doc(db, 'albums', albumDoc.id)
        const unsubscribeAlbum = onSnapshot(
          albumDocRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              console.log('❌ [usePublicAlbum] Album deleted')
              setError('Dette albumet eksisterer ikke lenger')
              setAlbum(null)
              setPhotos([])
              return
            }

            const updatedAlbumData = { id: snapshot.id, ...snapshot.data() }

            // Check if album is still public
            if (!updatedAlbumData.isPublic) {
              console.log('❌ [usePublicAlbum] Album made private')
              setError('Eieren har gjort dette albumet privat')
              setAlbum(null)
              setPhotos([])
              return
            }

            // Check expiry date
            if (updatedAlbumData.publicSettings?.expiresAt) {
              const expiryDate = new Date(updatedAlbumData.publicSettings.expiresAt)
              if (expiryDate < new Date()) {
                console.log('❌ [usePublicAlbum] Album expired')
                setError('Denne delingslenken har utløpt')
                setAlbum(null)
                setPhotos([])
                return
              }
            }

            // Update album data if still valid
            setAlbum(updatedAlbumData)
          },
          (error) => {
            console.error('❌ [usePublicAlbum] Album snapshot error:', error)
          }
        )

        // Hent bilder fra brukerens photos basert på albumId
        const photosPath = `users/${albumData.userId}/photos`
        console.log('🔍 [usePublicAlbum] Querying photos at path:', photosPath)
        console.log('🔍 [usePublicAlbum] Filter: albumId ==', albumData.id)

        const photosRef = collection(db, photosPath)
        const photosQuery = query(
          photosRef,
          where('albumId', '==', albumData.id),
          orderBy('createdAt', 'desc')
        )

        // Lytt i sanntid for photos
        const unsubscribePhotos = onSnapshot(
          photosQuery,
          (snapshot) => {
            console.log('✅ [usePublicAlbum] Query returned', snapshot.docs.length, 'photos')

            const photosData = snapshot.docs.map((doc) => {
              const data = doc.data()
              console.log('📷 [usePublicAlbum] Photo:', {
                id: doc.id,
                albumId: data.albumId,
                userId: data.userId,
                hasUrl: !!data.url,
                createdAt: data.createdAt
              })
              return { id: doc.id, ...data }
            })

            console.log('✅ [usePublicAlbum] Setting', photosData.length, 'photos in state')
            setPhotos(photosData)
            setLoading(false)
          },
          (error) => {
            console.error('❌ [usePublicAlbum] Snapshot error:', error)
            console.error('Error code:', error.code)
            console.error('Error message:', error.message)

            if (error.code === 'permission-denied') {
              setError('Ingen tilgang til bilder. Sjekk Firestore-regler.')
            } else {
              setError('Kunne ikke laste bilder: ' + error.message)
            }
            setLoading(false)
          }
        )

        return () => {
          console.log('🔍 [usePublicAlbum] Cleaning up snapshot listeners')
          unsubscribeAlbum()
          unsubscribePhotos()
        }
      } catch (err) {
        console.error('❌ [usePublicAlbum] Fetch error:', err)
        console.error('Error code:', err.code)
        console.error('Error message:', err.message)
        setError('Kunne ikke laste album: ' + err.message)
        setLoading(false)
      }
    }

    fetchPublicAlbum()
  }, [slug])

  return { album, photos, loading, error }
}
