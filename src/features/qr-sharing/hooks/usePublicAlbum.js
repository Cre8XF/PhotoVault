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
          setError('Album ikke funnet')
          setLoading(false)
          return
        }

        const albumDoc = querySnapshot.docs[0]
        const albumData = { id: albumDoc.id, ...albumDoc.data() }

        // Sjekk om albumet er offentlig
        if (!albumData.isPublic) {
          setError('Dette albumet er ikke lenger offentlig tilgjengelig')
          setLoading(false)
          return
        }

        // Sjekk om delingen er utløpt
        if (albumData.publicSettings?.expiresAt) {
          const expiryDate = new Date(albumData.publicSettings.expiresAt)
          if (expiryDate < new Date()) {
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
        const unsubscribe = onSnapshot(photosQuery, (snapshot) => {
          const photosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setPhotos(photosData)
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (err) {
        console.error('Error fetching public album:', err)
        setError('Kunne ikke laste album')
        setLoading(false)
      }
    }

    fetchPublicAlbum()
  }, [slug])

  return { album, photos, loading, error }
}
