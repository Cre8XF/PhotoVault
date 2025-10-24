// ============================================================================
// PAGE: AdminDashboard.jsx – MED I18N
// ============================================================================
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

const AdminDashboard = ({ colors, setNotification }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [users, setUsers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);

  // 🔄 Hent alle data fra Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userSnap, albumSnap, photoSnap] = await Promise.all([
          getDocs(collection(db, 'users')), 
          getDocs(collection(db, 'albums')), 
          getDocs(collection(db, 'photos'))
        ]);

        setUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAlbums(albumSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPhotos(photoSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Feil ved lasting av admin-data:', err);
        setNotification({
          message: 'Kunne ikke laste data fra Firestore.',
          type: 'error'
        });
      }
    };
    loadData();
  }, [setNotification]);

  // 📊 Kombiner data – tell album og bilder per bruker
  const userStats = useMemo(() => {
    return users.map(u => {
      const userAlbums = albums.filter(a => a.userId === u.id);
      const userPhotos = photos.filter(p => p.userId === u.id);
      return {
        ...u,
        albumCount: userAlbums.length,
        photoCount: userPhotos.length
      };
    });
  }, [users, albums, photos]);

  // 🟢 Toggle Pro-status
  const handleTogglePro = async email => {
    try {
      const ref = doc(db, 'users', email);
      const user = users.find(u => u.id === email);
      const newStatus = !user?.isPro;
      await setDoc(ref, { isPro: newStatus }, { merge: true });
      setUsers(prev => prev.map(u => (u.id === email ? { ...u, isPro: newStatus } : u)));
      setNotification({
        message: t('notifications.proUpdated', { email }),
        type: 'success'
      });
    } catch (err) {
      console.error('Feil ved Pro-endring:', err);
      setNotification({
        message: t('notifications.couldNotChangePro'),
        type: 'error'
      });
    }
  };

  // 🔴 Slett bruker
  const handleDeleteUser = async email => {
    const confirmed = window.confirm(t('confirmDelete', { email }));
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'users', email));
      setUsers(prev => prev.filter(u => u.id !== email));
      setNotification({
        message: t('notifications.userDeleted', { email }),
        type: 'success'
      });
    } catch (err) {
      console.error('Feil ved sletting:', err);
      setNotification({
        message: t('notifications.couldNotDelete'),
        type: 'error'
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold flex items-center gap-2 ${colors.text}`}>
          <Shield className="w-7 h-7 text-purple-500" />
          {t('title')}
        </h1>
        <p className={`text-sm ${colors.textSecondary}`}>
          {t('totalUsers', { count: users.length })}
        </p>
      </div>

      {/* Brukertabell */}
      {users.length === 0 ? (
        <p className="text-gray-400 italic">{t('noUsers')}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-700/50 bg-gray-900/40 shadow-lg">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-800/60 text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left p-3">{t('table.name')}</th>
                <th className="text-left p-3">{t('table.email')}</th>
                <th className="text-center p-3">{t('table.albums')}</th>
                <th className="text-center p-3">{t('table.photos')}</th>
                <th className="text-center p-3">{t('table.proStatus')}</th>
                <th className="text-center p-3">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((u, i) => (
                <tr 
                  key={u.id} 
                  className={`border-t border-gray-800/70 hover:bg-gray-800/40 ${i % 2 === 0 ? 'bg-gray-900/30' : ''}`}
                >
                  <td className="p-3 font-medium text-gray-100">
                    {u.name || u.displayName || u.id}
                  </td>
                  <td className="p-3 text-gray-400">{u.id}</td>
                  <td className="p-3 text-center text-gray-300">{u.albumCount}</td>
                  <td className="p-3 text-center text-gray-300">{u.photoCount}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleTogglePro(u.id)}
                      className={`ripple-effect px-3 py-1 rounded-full text-xs font-semibold ${
                        u.isPro 
                          ? 'bg-green-600/80 text-white hover:bg-green-700' 
                          : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {u.isPro ? t('proStatus.pro') : t('proStatus.free')}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="ripple-effect p-2 rounded-full bg-gray-800/70 hover:bg-red-600/70 text-gray-200 hover:text-white transition"
                      title={t('actions.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;