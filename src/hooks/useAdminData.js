import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ref, listAll, getMetadata } from 'firebase/storage';
import { storage } from '../firebase';

export function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPhotos: 0,
    totalStorage: 0,
    activeUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      setLoading(true);

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      let totalPhotos = 0;
      let totalStorageBytes = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Count user's photos
        const photosSnapshot = await getDocs(
          collection(db, `users/${userDoc.id}/photos`)
        );
        const photoCount = photosSnapshot.size;
        totalPhotos += photoCount;

        // Calculate user's storage
        let userStorage = 0;
        photosSnapshot.forEach(photoDoc => {
          const photoData = photoDoc.data();
          userStorage += photoData.size || 0;
        });
        totalStorageBytes += userStorage;

        usersData.push({
          id: userDoc.id,
          email: userData.email,
          displayName: userData.displayName || 'N/A',
          createdAt: userData.createdAt?.toDate(),
          lastLogin: userData.lastLogin?.toDate(),
          photoCount: photoCount,
          storageUsed: userStorage,
          isActive: userData.isActive !== false,
          isAdmin: userData.isAdmin || false
        });
      }

      // Fetch recent photos (last 20)
      const recentPhotosQuery = query(
        collection(db, 'photos'), // If you have a global photos collection
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const recentPhotosSnapshot = await getDocs(recentPhotosQuery);
      const recentPhotosData = recentPhotosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setUsers(usersData);
      setRecentPhotos(recentPhotosData);
      setStats({
        totalUsers: usersData.length,
        totalPhotos: totalPhotos,
        totalStorage: totalStorageBytes,
        activeUsers: usersData.filter(u => u.isActive).length
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  return { stats, users, recentPhotos, loading, refetch: fetchAdminData };
}
