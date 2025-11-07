import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Image, Video, HardDrive } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export default function AdminDashboard({ onBack }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalStorageBytes: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)

      // Count users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const totalUsers = usersSnapshot.size

      // Count photos and videos
      let totalPhotos = 0
      let totalVideos = 0
      let totalStorageBytes = 0

      for (const userDoc of usersSnapshot.docs) {
        const photosSnapshot = await getDocs(
          collection(db, `users/${userDoc.id}/photos`)
        )

        photosSnapshot.forEach((photoDoc) => {
          const data = photoDoc.data()

          // Count photo vs video
          if (data.isVideo) {
            totalVideos++
          } else {
            totalPhotos++
          }

          // Sum storage
          totalStorageBytes += data.size || 0
        })
      }

      setStats({
        totalUsers,
        totalPhotos,
        totalVideos,
        totalStorageBytes,
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      alert('Error loading admin data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading admin data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* DEBUG TEST - Remove this after fixing */}
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center p-4 z-[9999]">
        🔴 ADMIN DASHBOARD IS RENDERING 🔴
      </div>

      {/* Header with Back Button */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Tilbake til More</span>
        </button>

        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          PhotoVault System Overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Total Photos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Photos
              </p>
              <p className="text-3xl font-bold">
                {stats.totalPhotos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Videos
              </p>
              <p className="text-3xl font-bold">
                {stats.totalVideos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Storage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Storage
              </p>
              <p className="text-3xl font-bold">
                {formatBytes(stats.totalStorageBytes)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-4xl mx-auto mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 Additional admin features (user management, database tools) can be
          added later.
        </p>
      </div>
    </div>
  )
}
