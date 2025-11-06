import { Users, Image, HardDrive, Activity } from 'lucide-react';

export default function StatsPanel({ stats, users, recentPhotos }) {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      subtitle: `${stats.activeUsers} active`
    },
    {
      title: 'Total Photos',
      value: stats.totalPhotos.toLocaleString(),
      icon: Image,
      color: 'green',
      subtitle: 'across all users'
    },
    {
      title: 'Total Storage',
      value: formatBytes(stats.totalStorage),
      icon: HardDrive,
      color: 'purple',
      subtitle: 'used'
    },
    {
      title: 'Avg per User',
      value: Math.round(stats.totalPhotos / stats.totalUsers || 0),
      icon: Activity,
      color: 'orange',
      subtitle: 'photos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Top Users by Storage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top Users by Storage</h2>
        <div className="space-y-3">
          {users
            .sort((a, b) => b.storageUsed - a.storageUsed)
            .slice(0, 5)
            .map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.photoCount} photos</p>
                </div>
                <p className="font-semibold text-purple-600">{formatBytes(user.storageUsed)}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Photos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {recentPhotos.slice(0, 10).map(photo => (
            <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={photo.url}
                alt={photo.title || 'Photo'}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white truncate">{photo.title || 'Untitled'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
