import { useState, useEffect } from 'react'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
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

        // 🔹 Hent bilder fra brukerens photos basert på albumId
        const photosRef = collection(db, `users/${albumData.userId}/photos`)
        const photosQuery = query(
          photosRef,
          where('albumId', '==', albumData.id),
          orderBy('createdAt', 'desc')
        )

        // Lytt i sanntid
        const unsubscribe = onSnapshot(
          photosQuery,
          (snapshot) => {
            const photosData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            setPhotos(photosData)
            setLoading(false)
          },
          (error) => {
            console.error('❌ [usePublicAlbum] Snapshot error:', error)
            if (error.code === 'permission-denied') {
              setError('Ingen tilgang til bilder. Sjekk Firestore-regler.')
            } else {
              setError('Kunne ikke laste bilder: ' + error.message)
            }
            setLoading(false)
          }
        )

        return () => {
          console.log('🔍 [usePublicAlbum] Cleaning up snapshot listener')
          unsubscribe()
        }
      } catch (err) {
        console.error('❌ [usePublicAlbum] Fetch error:', err)
        setError('Kunne ikke laste album: ' + err.message)
        setLoading(false)
      }
    }

    fetchPublicAlbum()
  }, [slug])

  return { album, photos, loading, error }
}
