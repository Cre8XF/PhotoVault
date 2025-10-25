# AdminDashboard - Enhanced Admin Panel

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat(admin): enhanced dashboard with real-time stats and charts"

## FILES TO MODIFY

- @src/pages/AdminDashboard.jsx
- Create @src/components/RealtimeStatsCard.jsx
- Create @src/components/ActivityFeed.jsx
- Create @src/components/UserManagementTable.jsx

## CURRENT STATE ANALYSIS

AdminDashboard currently has:

- Basic statistics
- Simple user list
- No real-time updates
- Limited charts

## TARGET STATE

Professional admin panel with:

- Real-time statistics
- Interactive charts
- Activity feed
- Advanced user management
- Bulk actions

## IMPLEMENTATION STEPS

### 1. Create RealtimeStatsCard Component

**File:** `src/components/RealtimeStatsCard.jsx`

```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const RealtimeStatsCard = ({ icon: Icon, title, value, change, color = 'purple', trend = 'up' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colorClasses = {
    purple: 'from-purple-600 to-purple-800',
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    pink: 'from-pink-600 to-pink-800'
  };

  return (
    <motion.div className="glass p-6 rounded-2xl relative overflow-hidden" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4 }}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-10`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
            <Icon className="w-6 h-6" />
          </div>

          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm opacity-70">{title}</p>
          <motion.p className="text-3xl font-bold" key={displayValue} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
            {displayValue.toLocaleString('no-NO')}
          </motion.p>
        </div>

        {/* Sparkline effect */}
        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(change + 50, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};
```

### 2. Create ActivityFeed Component

**File:** `src/components/ActivityFeed.jsx`

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, Upload, Download, Shield, AlertTriangle, Check, Clock } from 'lucide-react';

const activityIcons = {
  user_created: UserPlus,
  user_deleted: UserMinus,
  photo_uploaded: Upload,
  photo_downloaded: Download,
  security_alert: AlertTriangle,
  settings_changed: Shield,
  login_success: Check
};

export const ActivityFeed = ({ activities, maxItems = 10 }) => {
  const getActivityColor = type => {
    const colors = {
      user_created: 'text-green-400 bg-green-600/20',
      user_deleted: 'text-red-400 bg-red-600/20',
      photo_uploaded: 'text-blue-400 bg-blue-600/20',
      security_alert: 'text-yellow-400 bg-yellow-600/20',
      default: 'text-purple-400 bg-purple-600/20'
    };
    return colors[type] || colors.default;
  };

  const getTimeAgo = timestamp => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    if (seconds < 60) return `${seconds}s siden`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m siden`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}t siden`;
    return `${Math.floor(seconds / 86400)}d siden`;
  };

  return (
    <motion.div className="glass p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Sanntidsaktivitet
        </h3>
        <div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 bg-green-400 rounded-full" animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-sm text-green-400">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {activities.slice(0, maxItems).map((activity, i) => {
            const Icon = activityIcons[activity.type] || Clock;
            const colors = getActivityColor(activity.type);

            return (
              <motion.div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <div className={`p-2 rounded-lg ${colors} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.message}</p>
                  {activity.user && <p className="text-xs opacity-70 mt-0.5">{activity.user}</p>}
                  <p className="text-xs opacity-50 mt-1">{getTimeAgo(activity.timestamp)}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
```

### 3. Create UserManagementTable Component

**File:** `src/components/UserManagementTable.jsx`

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Edit2, Trash2, Shield, Ban, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

export const UserManagementTable = ({ users, onAction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortBy, setSortBy] = useState('created');
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleUserSelection = userId => {
    setSelectedUsers(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]));
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  return (
    <motion.div className="glass p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold">Brukerhåndtering</h3>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Søk brukere..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                       transition outline-none text-sm"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                     transition outline-none text-sm"
          >
            <option value="created">Nyeste først</option>
            <option value="name">Navn</option>
            <option value="photos">Bilder</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          className="mb-4 p-3 bg-purple-600/10 border border-purple-600/20 rounded-xl
                     flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm">{selectedUsers.length} bruker(e) valgt</span>
          <div className="flex gap-2">
            <button
              onClick={() => onAction?.('delete', selectedUsers)}
              className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30
                       rounded-lg text-sm transition"
            >
              Slett valgte
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg
                       text-sm transition"
            >
              Avbryt
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4">
                <input type="checkbox" checked={selectedUsers.length === filteredUsers.length} onChange={selectAll} className="rounded" />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">Bruker</th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">Bilder</th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">Lagring</th>
              <th className="text-left py-3 px-4 text-sm font-medium opacity-70">Opprettet</th>
              <th className="text-right py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <motion.tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <td className="py-3 px-4">
                  <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} className="rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600
                                  flex items-center justify-center font-semibold"
                    >
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs opacity-50">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {user.active ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Aktiv</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">Inaktiv</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{user.photoCount?.toLocaleString('no-NO')}</td>
                <td className="py-3 px-4 text-sm">{(user.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB</td>
                <td className="py-3 px-4 text-sm opacity-70">{new Date(user.createdAt).toLocaleDateString('no-NO')}</td>
                <td className="py-3 px-4 text-right">
                  <div className="relative">
                    <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} className="p-2 hover:bg-white/10 rounded-lg transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenu === user.id && (
                      <motion.div
                        className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden
                                 shadow-xl border border-white/10 z-10"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <button
                          onClick={() => onAction?.('edit', [user.id])}
                          className="w-full px-4 py-3 hover:bg-white/10 transition flex
                                   items-center gap-3 text-left text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Rediger
                        </button>
                        <button
                          onClick={() => onAction?.('toggle', [user.id])}
                          className="w-full px-4 py-3 hover:bg-white/10 transition flex
                                   items-center gap-3 text-left text-sm"
                        >
                          <Ban className="w-4 h-4" />
                          {user.active ? 'Deaktiver' : 'Aktiver'}
                        </button>
                        <button
                          onClick={() => onAction?.('permissions', [user.id])}
                          className="w-full px-4 py-3 hover:bg-white/10 transition flex
                                   items-center gap-3 text-left text-sm"
                        >
                          <Shield className="w-4 h-4" />
                          Tillatelser
                        </button>
                        <button
                          onClick={() => onAction?.('delete', [user.id])}
                          className="w-full px-4 py-3 hover:bg-white/10 transition flex
                                   items-center gap-3 text-left text-sm text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          Slett
                        </button>
                      </motion.div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        <span className="text-sm opacity-70">
          Viser {filteredUsers.length} av {users.length} brukere
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition">Forrige</button>
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition">Neste</button>
        </div>
      </div>
    </motion.div>
  );
};
```

### 4. Update AdminDashboard.jsx

```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RealtimeStatsCard } from '../components/RealtimeStatsCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { UserManagementTable } from '../components/UserManagementTable';
import { Users, Image, HardDrive, Activity, TrendingUp, Server, Database } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalPhotos: 45823,
    storageUsed: 234.5,
    activeNow: 67
  });

  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'user_created',
      message: 'Ny bruker registrert',
      user: 'john@example.com',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'photo_uploaded',
      message: '15 bilder lastet opp',
      user: 'sarah@example.com',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: 3,
      type: 'security_alert',
      message: 'Mislykket påloggingsforsøk',
      user: 'Ukjent IP',
      timestamp: new Date(Date.now() - 300000)
    }
  ]);

  const [users] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      photoCount: 1523,
      storageUsed: 5368709120,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      active: true,
      photoCount: 847,
      storageUsed: 2147483648,
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      active: false,
      photoCount: 234,
      storageUsed: 1073741824,
      createdAt: '2024-03-10'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Random stat updates
      setStats(prev => ({
        ...prev,
        activeNow: Math.max(1, prev.activeNow + Math.floor(Math.random() * 5) - 2)
      }));

      // Occasionally add new activity
      if (Math.random() > 0.7) {
        const newActivity = {
          id: Date.now(),
          type: ['user_created', 'photo_uploaded', 'login_success'][Math.floor(Math.random() * 3)],
          message: 'Ny aktivitet registrert',
          user: 'user@example.com',
          timestamp: new Date()
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 20));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleUserAction = (action, userIds) => {
    console.log(`Action: ${action} for users:`, userIds);
    // Implement actual actions here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm opacity-70">Oversikt over system og brukere</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RealtimeStatsCard icon={Users} title="Totale brukere" value={stats.totalUsers} change={12} trend="up" color="purple" />
        <RealtimeStatsCard icon={Image} title="Totale bilder" value={stats.totalPhotos} change={8} trend="up" color="blue" />
        <RealtimeStatsCard icon={HardDrive} title="Lagring brukt (GB)" value={stats.storageUsed} change={5} trend="up" color="green" />
        <RealtimeStatsCard icon={Activity} title="Aktive nå" value={stats.activeNow} change={-3} trend="down" color="pink" />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* System Health */}
        <motion.div className="glass p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            Systemhelse
          </h3>

          <div className="space-y-4">
            {[
              { label: 'CPU', value: 45, color: 'bg-blue-600' },
              { label: 'Minne', value: 68, color: 'bg-purple-600' },
              { label: 'Disk', value: 32, color: 'bg-green-600' },
              { label: 'Nettverk', value: 89, color: 'bg-pink-600' }
            ].map((metric, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-70">{metric.label}</span>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${metric.color}`} initial={{ width: 0 }} animate={{ width: `${metric.value}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} maxItems={8} />
        </div>
      </div>

      {/* User Management */}
      <UserManagementTable users={users} onAction={handleUserAction} />

      {/* Quick Actions */}
      <motion.div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        {[
          { icon: Database, label: 'Sikkerhetskopi', action: () => {} },
          { icon: TrendingUp, label: 'Rapporter', action: () => {} },
          { icon: Server, label: 'Innstillinger', action: () => {} },
          { icon: Activity, label: 'Logger', action: () => {} }
        ].map((action, i) => (
          <motion.button
            key={i}
            onClick={action.action}
            className="glass p-4 rounded-xl hover:bg-white/10 transition
                     flex flex-col items-center gap-2 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <action.icon className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
```

## TESTING CHECKLIST

- [ ] Real-time stats animate smoothly
- [ ] Activity feed updates live
- [ ] User table search works
- [ ] User selection (single & bulk) functional
- [ ] Context menus open/close correctly
- [ ] System health bars animate
- [ ] Pagination works
- [ ] Quick actions responsive
- [ ] Mobile responsive (stacks properly)
- [ ] All animations 60fps
- [ ] No console errors
- [ ] i18n works (NO/EN)

## PERFORMANCE REQUIREMENTS

- Stats counter animation: <1s
- Activity feed updates: instant
- Table filtering: <100ms
- Real-time updates don't block UI
- All animations 60fps

## COMMIT MESSAGE

```
feat(admin): enhanced dashboard with real-time stats and charts

- Add RealtimeStatsCard with animated counters
- Implement ActivityFeed with live updates
- Create UserManagementTable with search and bulk actions
- Add system health monitoring visualization
- Implement real-time data updates (5s interval)
- Add quick action buttons
- Improve mobile responsive design

All animations 60fps, real-time updates non-blocking
```

## FINAL VERIFICATION

After completing all 12 sessions:

1. Run full app in development mode
2. Test all pages on desktop (Chrome, Firefox)
3. Test all pages on mobile (Safari, Chrome)
4. Test on tablet (iPad)
5. Verify all animations are 60fps
6. Check for console errors
7. Test i18n switching (NO/EN)
8. Verify responsive breakpoints
9. Test touch interactions on mobile
10. Check performance (Lighthouse scores)

Document any issues in `@docs/progress/issues.md`

---

END OF PROMPT

## 🎉 ALL PROMPTS COMPLETE!

You now have:

- 12 detailed prompt files
- Complete implementation guides
- Testing checklists
- Performance requirements
- Commit message templates

Ready to start Session 1!
