import { useState, useEffect, useRef } from 'react'
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
  const triedRootRef = useRef(false) // hindrer evig fallback-loop

  useEffect(() => {
    if (!slug) return
    let unsubscribe = () => {}

    const fetchPublicAlbum = async () => {
      try {
        const db = getFirestore()

        // 🔹 1) Finn album via slug
        const qAlbum = query(
          collection(db, 'albums'),
          where('publicSlug', '==', slug)
        )
        const snap = await getDocs(qAlbum)
        if (snap.empty) {
          console.warn('❌ [usePublicAlbum] Album not found for slug:', slug)
          setError('Album ikke funnet')
          setLoading(false)
          return
        }

        const albumDoc = snap.docs[0]
        const albumData = { id: albumDoc.id, ...albumDoc.data() }

        // 🔹 2) Sjekk offentlighet og utløp
        if (!albumData.isPublic) {
          console.warn('❌ [usePublicAlbum] Album is not public')
          setError('Dette albumet er ikke lenger offentlig tilgjengelig')
          setLoading(false)
          return
        }

        if (albumData.publicSettings?.expiresAt) {
          const expiry = new Date(albumData.publicSettings.expiresAt)
          if (expiry < new Date()) {
            console.warn('❌ [usePublicAlbum] Album link expired')
            setError('Denne delingslenken har utløpt')
            setLoading(false)
            return
          }
        }

        setAlbum(albumData)

        // 🔹 3) Lytt mot users/{userId}/photos
        const listenNested = () => {
          const nestedRef = collection(db, `users/${albumData.userId}/photos`)
          const nestedQ = query(
            nestedRef,
            where('albumId', '==', albumData.id),
            orderBy('createdAt', 'desc')
          )

          unsubscribe = onSnapshot(
            nestedQ,
            (snapshot) => {
              if (snapshot.empty && !triedRootRef.current) {
                console.log(
                  '⚠️ [usePublicAlbum] No photos under user, trying root/photos'
                )
                triedRootRef.current = true
                unsubscribe()
                listenRoot()
                return
              }

              const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
              console.log(
                '✅ [usePublicAlbum] Loaded',
                rows.length,
                'photos (nested)'
              )
              setPhotos(rows)
              setLoading(false)
            },
            (e) => {
              console.error('❌ [usePublicAlbum] Nested snapshot error:', e)
              if (!triedRootRef.current) {
                triedRootRef.current = true
                listenRoot()
                return
              }
              setError('Kunne ikke laste bilder: ' + e.message)
              setLoading(false)
            }
          )
        }

        // 🔹 4) Fallback til toppnivå photos
        const listenRoot = () => {
          const rootRef = collection(db, 'photos')
          const rootQ = query(
            rootRef,
            where('albumId', '==', albumData.id),
            orderBy('createdAt', 'desc')
          )

          unsubscribe = onSnapshot(
            rootQ,
            (snapshot) => {
              const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
              console.log(
                '✅ [usePublicAlbum] Loaded',
                rows.length,
                'photos (root)'
              )
              setPhotos(rows)
              setLoading(false)
            },
            (e) => {
              console.error('❌ [usePublicAlbum] Root snapshot error:', e)
              setError('Kunne ikke laste bilder: ' + e.message)
              setLoading(false)
            }
          )
        }

        listenNested()
      } catch (err) {
        console.error('❌ [usePublicAlbum] Fetch error:', err)
        setError('Kunne ikke laste album: ' + (err?.message || String(err)))
        setLoading(false)
      }
    }

    fetchPublicAlbum()

    // Rydd opp lytter ved unmount
    return () => {
      try {
        unsubscribe()
      } catch (_) {}
    }
  }, [slug])

  return { album, photos, loading, error }
}
