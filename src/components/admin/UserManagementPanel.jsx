import { useState } from 'react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { Search, Ban, Trash2, CheckCircle } from 'lucide-react'

export default function UserManagementPanel({ users, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  // Safely handle missing fields
  const filteredUsers = users.filter((user) => {
    const email = user.email?.toLowerCase() || ''
    const name = user.displayName?.toLowerCase() || ''
    return (
      email.includes(searchTerm.toLowerCase()) ||
      name.includes(searchTerm.toLowerCase())
    )
  })

  const handleToggleActive = async (userId, currentStatus) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${
        currentStatus ? 'disable' : 'enable'
      } this user?`
    )
    if (!confirmed) return

    try {
      await updateDoc(doc(db, 'users', userId), { isActive: !currentStatus })
      alert(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`)
      onUpdate()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user: ' + error.message)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    const confirmed = window.confirm(
      `⚠️ DANGER: Delete user ${userEmail}? This will delete all their photos and data. This action cannot be undone.`
    )
    if (!confirmed) return

    const confirmText = window.prompt('Type "DELETE" to confirm:')
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled')
      return
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      alert(`User ${userEmail} deleted successfully`)
      onUpdate()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user: ' + error.message)
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Photos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Storage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{user.photoCount}</td>
                <td className="px-6 py-4 text-sm">
                  {formatBytes(user.storageUsed)}
                </td>
                <td className="px-6 py-4">
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                      <Ban className="w-3 h-3" />
                      Disabled
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.createdAt?.toLocaleDateString?.() || '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`p-2 rounded-lg ${
                        user.isActive
                          ? 'hover:bg-red-100 text-red-600'
                          : 'hover:bg-green-100 text-green-600'
                      }`}
                      title={user.isActive ? 'Disable user' : 'Enable user'}
                    >
                      {user.isActive ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No users found matching "{searchTerm}"
        </div>
      )}
    </div>
  )
}
