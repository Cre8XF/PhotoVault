// ============================================================================
// PAGE: AdminDashboard.jsx – v7.0 FULL ADMIN PANEL WITH REAL-TIME UPDATES
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Users,
  Crown,
  FolderOpen,
  Image as ImageIcon,
  HardDrive,
  Trash2,
  Search,
  Activity,
  Clock,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

const AdminDashboard = ({ onBack, colors = {} }) => {
  const { t } = useTranslation(['admin', 'common']);

  // State
  const [users, setUsers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'pro', 'free'
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // === REAL-TIME DATA LISTENERS ===
  // ============================================================================

  // Users listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Albums listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'albums'),
      (snapshot) => {
        const albumsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlbums(albumsData);
      },
      (error) => {
        console.error('Error fetching albums:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Photos listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'photos'),
      (snapshot) => {
        const photosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPhotos(photosData);
      },
      (error) => {
        console.error('Error fetching photos:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Recent activity listener (last 20 photos ordered by createdAt)
  useEffect(() => {
    const q = query(
      collection(db, 'photos'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activity = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'upload',
          ...doc.data(),
        }));
        setRecentActivity(activity);
      },
      (error) => {
        console.error('Error fetching recent activity:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // === COMPUTED STATISTICS ===
  // ============================================================================

  const stats = useMemo(() => {
    const proUsers = users.filter(
      (u) => u.isPro === true || u.role === 'pro' || u.role === 'admin'
    ).length;

    const adminUsers = users.filter(
      (u) => u.role === 'admin' || u.isAdmin === true
    ).length;

    const totalStorage = photos.reduce((acc, photo) => {
      return acc + (photo.size || 0);
    }, 0);

    const storageGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(2);

    return {
      totalUsers: users.length,
      proUsers,
      adminUsers,
      totalAlbums: albums.length,
      totalPhotos: photos.length,
      totalStorage: storageGB,
    };
  }, [users, albums, photos]);

  // ============================================================================
  // === USER STATS WITH COUNTS ===
  // ============================================================================

  const userStats = useMemo(() => {
    return users.map((u) => {
      const userAlbums = albums.filter((a) => a.userId === u.id);
      const userPhotos = photos.filter((p) => p.userId === u.id);
      const userStorage = userPhotos.reduce((acc, p) => acc + (p.size || 0), 0);

      return {
        ...u,
        albumCount: userAlbums.length,
        photoCount: userPhotos.length,
        storageUsed: userStorage,
        storageMB: (userStorage / (1024 * 1024)).toFixed(2),
      };
    });
  }, [users, albums, photos]);

  // ============================================================================
  // === FILTERING & SEARCH ===
  // ============================================================================

  const filteredUsers = useMemo(() => {
    let result = userStats;

    // Filter by role
    if (filterRole === 'admin') {
      result = result.filter((u) => u.role === 'admin' || u.isAdmin === true);
    } else if (filterRole === 'pro') {
      result = result.filter(
        (u) =>
          (u.isPro === true || u.role === 'pro') &&
          u.role !== 'admin' &&
          u.isAdmin !== true
      );
    } else if (filterRole === 'free') {
      result = result.filter(
        (u) =>
          !u.isPro &&
          u.role !== 'pro' &&
          u.role !== 'admin' &&
          !u.isAdmin
      );
    }

    // Search by email or display name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((u) => {
        const email = u.email?.toLowerCase() || u.id.toLowerCase();
        const name = u.displayName?.toLowerCase() || '';
        return email.includes(query) || name.includes(query);
      });
    }

    return result;
  }, [userStats, filterRole, searchQuery]);

  // ============================================================================
  // === ROLE MANAGEMENT ACTIONS ===
  // ============================================================================

  const handleTogglePro = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = !(user?.isPro === true || user?.role === 'pro');

      await updateDoc(doc(db, 'users', userId), {
        isPro: newStatus,
      });

      console.log(`✅ Pro status updated for ${userId}: ${newStatus}`);
    } catch (err) {
      console.error('Error toggling Pro status:', err);
      alert(t('notifications.couldNotChangePro'));
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      const currentRole = user?.role;
      const newRole = currentRole === 'admin' ? 'user' : 'admin';

      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        isAdmin: newRole === 'admin',
      });

      console.log(`✅ Admin status updated for ${userId}: ${newRole}`);
    } catch (err) {
      console.error('Error toggling Admin status:', err);
      alert(t('notifications.couldNotChangeAdmin'));
    }
  };

  const handleDeleteUser = async (userId, email) => {
    const confirmed = window.confirm(
      t('confirmDelete', { email: email || userId })
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      console.log(`✅ User ${userId} deleted`);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(t('notifications.couldNotDelete'));
    }
  };

  // ============================================================================
  // === FORMAT HELPERS ===
  // ============================================================================

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const now = Date.now();
      const then = new Date(timestamp).getTime();
      const diffMs = now - then;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t('timeAgo.justNow', 'Just now');
      if (diffMins < 60) return t('timeAgo.minutesAgo', '{{count}}m ago', { count: diffMins });
      if (diffHours < 24) return t('timeAgo.hoursAgo', '{{count}}h ago', { count: diffHours });
      if (diffDays < 7) return t('timeAgo.daysAgo', '{{count}}d ago', { count: diffDays });
      return formatDate(timestamp);
    } catch {
      return 'N/A';
    }
  };

  // ============================================================================
  // === RENDER ===
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white/70">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8">
      {/* === HEADER === */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="ripple-effect p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-500" />
            {t('title')}
          </h1>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-xl">
          <p className="text-yellow-400 text-sm font-semibold">
            {t('stats.totalUsers', { count: stats.totalUsers })}
          </p>
        </div>
      </div>

      {/* === STATISTICS CARDS === */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Total Users */}
        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
            <Users className="w-4 h-4" />
            {t('stats.users')}
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
        </div>

        {/* Pro Users */}
        <div className="glass rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-400 text-xs mb-2">
            <Crown className="w-4 h-4" />
            {t('stats.proUsers')}
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.proUsers}</p>
        </div>

        {/* Admin Users */}
        <div className="glass rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 text-xs mb-2">
            <Shield className="w-4 h-4" />
            {t('stats.adminUsers')}
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.adminUsers}</p>
        </div>

        {/* Total Albums */}
        <div className="glass rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-2 text-blue-400 text-xs mb-2">
            <FolderOpen className="w-4 h-4" />
            {t('stats.albums')}
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.totalAlbums}</p>
        </div>

        {/* Total Photos */}
        <div className="glass rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-400 text-xs mb-2">
            <ImageIcon className="w-4 h-4" />
            {t('stats.photos')}
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.totalPhotos}</p>
        </div>

        {/* Total Storage */}
        <div className="glass rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-2 text-orange-400 text-xs mb-2">
            <HardDrive className="w-4 h-4" />
            {t('stats.storage')}
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.totalStorage} GB</p>
        </div>
      </div>

      {/* === MAIN CONTENT GRID === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === LEFT: USER MANAGEMENT === */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 border border-white/10">
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder', 'Search users...')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRole('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterRole === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {t('filters.all', 'All')}
                </button>
                <button
                  onClick={() => setFilterRole('admin')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterRole === 'admin'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {t('filters.admin', 'Admin')}
                </button>
                <button
                  onClick={() => setFilterRole('pro')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterRole === 'pro'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {t('filters.pro', 'Pro')}
                </button>
                <button
                  onClick={() => setFilterRole('free')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterRole === 'free'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {t('filters.free', 'Free')}
                </button>
              </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-white/40 text-center py-8">
                  {t('noUsers')}
                </p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-xs text-white/70 font-medium">
                        {t('table.email')}
                      </th>
                      <th className="text-center py-3 px-2 text-xs text-white/70 font-medium">
                        {t('table.isPro')}
                      </th>
                      <th className="text-center py-3 px-2 text-xs text-white/70 font-medium">
                        {t('table.isAdmin')}
                      </th>
                      <th className="text-center py-3 px-2 text-xs text-white/70 font-medium">
                        {t('table.albums')}
                      </th>
                      <th className="text-center py-3 px-2 text-xs text-white/70 font-medium">
                        {t('table.photos')}
                      </th>
                      <th className="text-center py-3 px-2 text-xs text-white/70 font-medium">
                        {t('table.storage')}
                      </th>
                      <th className="text-center py-3 px-2 text-xs text-white/70 font-medium">
                        {t('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const isPro =
                        user.isPro === true ||
                        user.role === 'pro' ||
                        user.role === 'admin';
                      const isAdmin =
                        user.role === 'admin' || user.isAdmin === true;

                      return (
                        <tr
                          key={user.id}
                          className={`border-b border-white/5 hover:bg-white/5 transition ${
                            index % 2 === 0 ? 'bg-white/[0.02]' : ''
                          }`}
                        >
                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-medium">
                                {user.displayName || user.email || user.id}
                              </span>
                              <span className="text-white/50 text-xs">
                                {user.email || user.id}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => handleTogglePro(user.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition ${
                                isPro
                                  ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                                  : 'bg-gray-700/30 text-gray-400 hover:bg-gray-600/30'
                              }`}
                            >
                              {isPro ? (
                                <Crown className="w-3 h-3" />
                              ) : (
                                <ToggleLeft className="w-3 h-3" />
                              )}
                              {isPro ? t('proStatus.pro') : t('proStatus.free')}
                            </button>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => handleToggleAdmin(user.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition ${
                                isAdmin
                                  ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                                  : 'bg-gray-700/30 text-gray-400 hover:bg-gray-600/30'
                              }`}
                            >
                              {isAdmin ? (
                                <Shield className="w-3 h-3" />
                              ) : (
                                <ToggleLeft className="w-3 h-3" />
                              )}
                              {isAdmin ? 'Admin' : 'User'}
                            </button>
                          </td>
                          <td className="py-3 px-2 text-center text-white/70 text-sm">
                            {user.albumCount}
                          </td>
                          <td className="py-3 px-2 text-center text-white/70 text-sm">
                            {user.photoCount}
                          </td>
                          <td className="py-3 px-2 text-center text-white/70 text-sm">
                            {user.storageMB} MB
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() =>
                                handleDeleteUser(user.id, user.email)
                              }
                              className="ripple-effect p-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 transition"
                              title={t('actions.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Results count */}
            <div className="mt-4 text-center text-sm text-white/50">
              {t('resultsCount', {
                count: filteredUsers.length,
                total: users.length,
                defaultValue: 'Showing {{count}} of {{total}} users',
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT: RECENT ACTIVITY === */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              {t('recentActivity.title', 'Recent Activity')}
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {recentActivity.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">
                  {t('recentActivity.noActivity', 'No recent activity')}
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-600/20">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {activity.name || 'Untitled'}
                        </p>
                        <p className="text-white/50 text-xs">
                          {t('recentActivity.upload', 'Photo uploaded')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-white/30" />
                          <span className="text-white/40 text-xs">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
