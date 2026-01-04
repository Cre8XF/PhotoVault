import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Users,
  Image,
  Video,
  HardDrive,
  DollarSign,
  AlertTriangle,
  Search,
  Power,
  UserX,
  Wrench,
  Shield,
} from 'lucide-react'
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// R2 Storage cost constant (USD per GB per month)
const R2_COST_PER_GB = 0.015

// Lite plan price (hardcoded for MVP)
const LITE_MONTHLY_PRICE = 2.99 // USD

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation(['admin', 'common'])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    gratisUsers: 0,
    liteUsers: 0,
    proUsers: 0,
    totalStorageBytes: 0,
    gratisStorageBytes: 0,
    liteStorageBytes: 0,
    proStorageBytes: 0,
    totalPhotos: 0,
    totalVideos: 0,
  })
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('storage') // 'storage' | 'created'
  const [killSwitches, setKillSwitches] = useState({
    pauseUploads: false,
    disableSignups: false,
    maintenanceMode: false,
  })
  const [switchesLoading, setSwitchesLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [searchQuery, sortBy, users])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = []
      let totalUsers = 0
      let gratisUsers = 0
      let liteUsers = 0
      let proUsers = 0
      let gratisStorageBytes = 0
      let liteStorageBytes = 0
      let proStorageBytes = 0

      usersSnapshot.forEach((doc) => {
        const data = doc.data()
        const tier = data.subscriptionTier || 'GRATIS'
        const storageUsed = data.storageUsed || 0

        totalUsers++

        // Count by tier
        if (tier === 'GRATIS') {
          gratisUsers++
          gratisStorageBytes += storageUsed
        } else if (tier === 'LITE') {
          liteUsers++
          liteStorageBytes += storageUsed
        } else if (tier === 'PRO') {
          proUsers++
          proStorageBytes += storageUsed
        }

        // Store user data for table
        usersData.push({
          id: doc.id,
          email: data.email || 'N/A',
          tier,
          storageUsed,
          createdAt: data.createdAt || null,
        })
      })

      // Fetch all photos (top-level collection)
      const photosSnapshot = await getDocs(collection(db, 'photos'))
      let totalPhotos = 0
      let totalVideos = 0

      photosSnapshot.forEach((doc) => {
        const data = doc.data()
        const type = data.type || data.mimeType || ''

        if (type.startsWith('video/')) {
          totalVideos++
        } else {
          totalPhotos++
        }
      })

      setStats({
        totalUsers,
        gratisUsers,
        liteUsers,
        proUsers,
        totalStorageBytes: gratisStorageBytes + liteStorageBytes + proStorageBytes,
        gratisStorageBytes,
        liteStorageBytes,
        proStorageBytes,
        totalPhotos,
        totalVideos,
      })

      setUsers(usersData)

      // Fetch kill-switches
      await fetchKillSwitches()
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error)
      // Don't block UI on error, show partial data
    } finally {
      setLoading(false)
    }
  }

  async function fetchKillSwitches() {
    try {
      const configRef = doc(db, 'systemConfig', 'killSwitches')
      const configSnap = await getDoc(configRef)

      if (configSnap.exists()) {
        setKillSwitches(configSnap.data())
      } else {
        // Initialize if doesn't exist
        const defaultConfig = {
          pauseUploads: false,
          disableSignups: false,
          maintenanceMode: false,
        }
        await setDoc(configRef, defaultConfig)
        setKillSwitches(defaultConfig)
      }
    } catch (error) {
      console.error('Error fetching kill-switches:', error)
    }
  }

  async function toggleKillSwitch(switchName) {
    try {
      setSwitchesLoading(true)
      const newValue = !killSwitches[switchName]

      const configRef = doc(db, 'systemConfig', 'killSwitches')
      await setDoc(
        configRef,
        {
          [switchName]: newValue,
        },
        { merge: true }
      )

      setKillSwitches((prev) => ({
        ...prev,
        [switchName]: newValue,
      }))

      console.log(`✅ Kill-switch "${switchName}" set to:`, newValue)
    } catch (error) {
      console.error('Error toggling kill-switch:', error)
      alert('Failed to toggle kill-switch: ' + error.message)
    } finally {
      setSwitchesLoading(false)
    }
  }

  function filterAndSortUsers() {
    let filtered = users

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'storage') {
      filtered = [...filtered].sort((a, b) => b.storageUsed - a.storageUsed)
    } else if (sortBy === 'created') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }

    setFilteredUsers(filtered)
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  // Calculate metrics
  const totalStorageGB = stats.totalStorageBytes / (1024 * 1024 * 1024)
  const estimatedR2Cost = totalStorageGB * R2_COST_PER_GB
  const estimatedRevenue = stats.liteUsers * LITE_MONTHLY_PRICE

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate('/more')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Admin Badge */}
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-red-600 font-semibold">
              INTERNAL USE ONLY
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: SYSTEM OVERVIEW */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">📊 System Overview</h2>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="blue"
            label="Total Users"
            value={stats.totalUsers}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-gray-600" />}
            color="gray"
            label="Free Users"
            value={stats.gratisUsers}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-green-600" />}
            color="green"
            label="Lite Users"
            value={stats.liteUsers}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-purple-600" />}
            color="purple"
            label="Pro Users"
            value={stats.proUsers}
          />
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            icon={<HardDrive className="w-6 h-6 text-orange-600" />}
            color="orange"
            label="Total Storage"
            value={formatBytes(stats.totalStorageBytes)}
          />
          <StatCard
            icon={<HardDrive className="w-6 h-6 text-gray-600" />}
            color="gray"
            label="Free Storage"
            value={formatBytes(stats.gratisStorageBytes)}
          />
          <StatCard
            icon={<HardDrive className="w-6 h-6 text-green-600" />}
            color="green"
            label="Lite Storage"
            value={formatBytes(stats.liteStorageBytes)}
          />
          <StatCard
            icon={<HardDrive className="w-6 h-6 text-purple-600" />}
            color="purple"
            label="Pro Storage"
            value={formatBytes(stats.proStorageBytes)}
          />
        </div>

        {/* File Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            icon={<Image className="w-6 h-6 text-blue-600" />}
            color="blue"
            label="Total Photos"
            value={stats.totalPhotos}
          />
          <StatCard
            icon={<Video className="w-6 h-6 text-red-600" />}
            color="red"
            label="Total Videos"
            value={stats.totalVideos}
          />
        </div>
      </div>

      {/* SECTION 2: REVENUE & COSTS */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">💰 Revenue & Costs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            color="green"
            label="Est. Monthly Revenue"
            value={`$${estimatedRevenue.toFixed(2)}`}
            subtitle={`${stats.liteUsers} Lite × $${LITE_MONTHLY_PRICE}`}
          />
          <StatCard
            icon={<HardDrive className="w-6 h-6 text-red-600" />}
            color="red"
            label="Est. R2 Storage Cost"
            value={`$${estimatedR2Cost.toFixed(2)}`}
            subtitle={`${totalStorageGB.toFixed(2)} GB × $${R2_COST_PER_GB}/GB`}
          />
        </div>
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Estimates only – not a billing statement.</strong> R2 costs don't include bandwidth. Revenue doesn't account for taxes, refunds, or churn.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: KILL-SWITCHES */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">🚨 Kill-Switches</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {/* Pause Uploads */}
            <KillSwitch
              icon={<Power className="w-5 h-5" />}
              label="Pause Uploads"
              description="Block all photo/video uploads. UI shows maintenance message."
              enabled={killSwitches.pauseUploads}
              onToggle={() => toggleKillSwitch('pauseUploads')}
              disabled={switchesLoading}
            />

            {/* Disable Signups */}
            <KillSwitch
              icon={<UserX className="w-5 h-5" />}
              label="Disable New Signups"
              description="Prevent new account creation. Existing users unaffected."
              enabled={killSwitches.disableSignups}
              onToggle={() => toggleKillSwitch('disableSignups')}
              disabled={switchesLoading}
            />

            {/* Maintenance Mode */}
            <KillSwitch
              icon={<Wrench className="w-5 h-5" />}
              label="Maintenance Mode"
              description="App becomes read-only. Uploads disabled. Admin still has access."
              enabled={killSwitches.maintenanceMode}
              onToggle={() => toggleKillSwitch('maintenanceMode')}
              disabled={switchesLoading}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: USER LIST */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">👥 User List</h2>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by email or UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('storage')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'storage'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Sort by Storage
              </button>
              <button
                onClick={() => setSortBy('created')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'created'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Sort by Date
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Storage Used
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'No users found matching your search.' : 'No users yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                        {user.id.substring(0, 12)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={user.tier} />
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatBytes(user.storageUsed)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTS
// ============================================================

function StatCard({ icon, color, label, value, subtitle }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-${color}-100 dark:bg-${color}-900/30`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function KillSwitch({ icon, label, description, enabled, onToggle, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-start gap-3 flex-1">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            enabled
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {label}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          enabled ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function TierBadge({ tier }) {
  const styles = {
    GRATIS: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    LITE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    PRO: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[tier] || styles.GRATIS
      }`}
    >
      {tier}
    </span>
  )
}
