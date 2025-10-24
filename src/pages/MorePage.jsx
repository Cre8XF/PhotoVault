// ============================================================================
// PAGE: MorePage.jsx – v7.0 FULL API INTEGRATION
// ============================================================================
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Settings,
  Shield,
  Globe,
  Bell,
  HardDrive,
  CreditCard,
  LogOut,
  Trash2,
  HelpCircle,
  FileText,
  Info,
  Wand2,
  Scan,
  ImagePlus,
  Users,
  Sparkles,
  Copy,
  CheckCircle,
  Crown,
  ChevronRight,
  Languages,
  Download,
  Share2,
  Heart,
  Zap,
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
  Moon,
  Sun,
  Upload,
  Check,
} from "lucide-react";
import { useSecurityContext } from "../contexts/SecurityContext";
import { 
  getStorage, 
  ref as storageRef, 
  listAll, 
  getMetadata 
} from "firebase/storage";
import { 
  getFirestore, 
  doc, 
  deleteDoc, 
  collection, 
  getDocs 
} from "firebase/firestore";
import { 
  getAuth, 
  deleteUser as deleteAuthUser 
} from "firebase/auth";

const MorePage = ({ 
  user, 
  storageUsed: propStorageUsed, 
  storageLimit: propStorageLimit, 
  photos,
  albums,
  isDarkMode, 
  setIsDarkMode, 
  onLogout,
  onNavigate 
}) => {
  const { t, i18n } = useTranslation(['translation', 'common', 'albums']);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [storageUsed, setStorageUsed] = useState(propStorageUsed || 0);
  const [storageLimit] = useState(propStorageLimit || 524288000); // 500 MB default
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const { pinEnabled, biometricEnabled } = useSecurityContext();

  const isPro = user?.isPro || false;
  const isAdmin = user?.role === "admin";

  // ============================================================================
  // === STORAGE CALCULATION ===
  // ============================================================================
  useEffect(() => {
    const calculateStorageUsage = async () => {
      if (!user?.uid) return;

      try {
        const storage = getStorage();
        const userStorageRef = storageRef(storage, `users/${user.uid}/photos`);
        
        const listResult = await listAll(userStorageRef);
        let totalBytes = 0;

        await Promise.all(
          listResult.items.map(async (item) => {
            try {
              const metadata = await getMetadata(item);
              totalBytes += metadata.size || 0;
            } catch (error) {
              console.error("Error getting metadata for:", item.fullPath, error);
            }
          })
        );

        setStorageUsed(totalBytes);
      } catch (error) {
        console.error("Error calculating storage:", error);
        // Fallback to prop value
        setStorageUsed(propStorageUsed || 0);
      }
    };

    calculateStorageUsage();
  }, [user?.uid, propStorageUsed]);

  const storagePercent = Math.round((storageUsed / storageLimit) * 100);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = [
      t('common:units.bytes'),
      t('common:units.kb'),
      t('common:units.mb'),
      t('common:units.gb')
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // ============================================================================
  // === STATISTICS ===
  // ============================================================================
  const stats = {
    totalPhotos: photos?.length || 0,
    totalAlbums: albums?.length || 0,
    favorites: photos?.filter(p => p.favorite).length || 0,
    aiAnalyzed: photos?.filter(p => p.aiAnalyzed).length || 0,
    recentUploads: photos?.filter(p => {
      if (!p.createdAt) return false;
      const uploadDate = new Date(p.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length || 0,
  };

  // ============================================================================
  // === NOTIFICATION SYSTEM ===
  // ============================================================================
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ============================================================================
  // === STRIPE INTEGRATION ===
  // ============================================================================
  const handleUpgradeToPro = async () => {
    const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
    const stripeCheckoutUrl = process.env.REACT_APP_STRIPE_CHECKOUT_URL;

    if (!stripePublicKey || !stripeCheckoutUrl) {
      console.warn("Stripe keys not configured");
      showNotification("Oppgradering er ikke tilgjengelig for øyeblikket", "error");
      return;
    }

    try {
      setLoading(true);
      
      // Redirect to Stripe Checkout
      const checkoutUrl = `${stripeCheckoutUrl}?client_reference_id=${user.uid}&customer_email=${user.email}`;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error initiating Stripe checkout:", error);
      showNotification("Kunne ikke starte betalingsprosess", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // === AI FUNCTIONS ===
  // ============================================================================
  const callAIFunction = async (feature, payload = {}) => {
    const aiProxyUrl = process.env.REACT_APP_AI_PROXY_URL;
    const apiKey = process.env.REACT_APP_GEMINI_KEY || 
                   process.env.REACT_APP_GOOGLE_VISION_KEY;

    if (!aiProxyUrl || !apiKey) {
      console.warn(`AI function '${feature}' called but API keys not configured`);
      showNotification("AI-funksjoner krever API-nøkler", "error");
      return null;
    }

    try {
      setLoading(true);
      console.log("AI function called:", feature, payload);

      const response = await fetch(aiProxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          feature,
          userId: user.uid,
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      showNotification(`${feature} fullført!`, "success");
      return data;
    } catch (error) {
      console.error(`Error in AI function '${feature}':`, error);
      showNotification(`Feil i ${feature}`, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSort = () => callAIFunction('autoSort', { photos });
  const handleImageEnhancement = () => callAIFunction('imageEnhancement', { photos });
  const handleFaceRecognition = () => callAIFunction('faceRecognition', { photos });
  const handleSmartTagging = () => callAIFunction('smartTagging', { photos });
  const handleDuplicateDetection = () => callAIFunction('duplicateDetection', { photos });

  // ============================================================================
  // === EXPORT FUNCTION ===
  // ============================================================================
  const exportUserData = async () => {
    const exportUrl = process.env.REACT_APP_EXPORT_URL;

    if (!exportUrl) {
      console.warn("Export URL not configured");
      showNotification("Eksport er ikke tilgjengelig", "error");
      return;
    }

    try {
      setLoading(true);
      console.log("Exporting user data for:", user.uid);

      const response = await fetch(exportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photovault-export-${user.uid}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showNotification("Data eksportert!", "success");
    } catch (error) {
      console.error("Error exporting data:", error);
      showNotification("Eksport feilet", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // === IMPORT FUNCTION ===
  // ============================================================================
  const handleImportData = async (event) => {
    const importUrl = process.env.REACT_APP_IMPORT_URL;
    const file = event.target.files?.[0];

    if (!file) return;

    if (!importUrl) {
      console.warn("Import URL not configured");
      showNotification("Import er ikke tilgjengelig", "error");
      return;
    }

    try {
      setLoading(true);
      console.log("Importing user data:", file.name);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);
      formData.append('email', user.email);

      const response = await fetch(importUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Import result:", result);

      showNotification("Data importert!", "success");
      
      // Reload page to show imported data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error importing data:", error);
      showNotification("Import feilet", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // === SHARE FUNCTION ===
  // ============================================================================
  const handleShareProfile = async () => {
    const shareBaseUrl = process.env.REACT_APP_SHARE_BASE_URL || 'https://photovault.app/u/';
    const shareLink = `${shareBaseUrl}${user.uid}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      showNotification("Lenke kopiert!", "success");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      showNotification("Kunne ikke kopiere lenke", "error");
    }
  };

  // ============================================================================
  // === DELETE ACCOUNT ===
  // ============================================================================
  const deleteAccount = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      console.log("Deleting account for:", user.uid);

      const auth = getAuth();
      const db = getFirestore();
      const storage = getStorage();

      // Delete all Firestore data
      const collections = ['photos', 'albums', 'shared', 'favorites'];
      
      for (const collectionName of collections) {
        const collectionRef = collection(db, 'users', user.uid, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        await Promise.all(
          snapshot.docs.map(doc => deleteDoc(doc.ref))
        );
      }

      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete Storage files
      try {
        const userStorageRef = storageRef(storage, `users/${user.uid}`);
        const listResult = await listAll(userStorageRef);
        
        await Promise.all(
          listResult.items.map(item => item.delete())
        );
      } catch (storageError) {
        console.warn("Storage deletion error:", storageError);
      }

      // Delete Auth user
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteAuthUser(currentUser);
      }

      showNotification("Konto slettet", "success");
      
      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error("Error deleting account:", error);
      showNotification("Kunne ikke slette konto", "error");
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // === EXTERNAL LINKS ===
  // ============================================================================
  const openExternalLink = (type) => {
    const links = {
      help: 'https://photovault.app/help',
      privacy: 'https://photovault.app/privacy',
      terms: 'https://photovault.app/terms',
    };

    const url = links[type] || links.help;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ============================================================================
  // === UI HELPERS ===
  // ============================================================================
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    showNotification(`Språk endret til ${lng === 'no' ? 'Norsk' : 'English'}`, "success");
  };

  // ============================================================================
  // === RENDER ===
  // ============================================================================
  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 animate-fade-in max-w-6xl mx-auto">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 glass rounded-xl p-4 shadow-lg animate-slide-in-right flex items-center gap-3 ${
          notification.type === 'success' ? 'border-green-500/50' : 'border-red-500/50'
        } border-2`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="glass rounded-2xl p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="font-medium">Behandler...</span>
          </div>
        </div>
      )}

      {/* === PROFILE HEADER === */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                {(pinEnabled || biometricEnabled) && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">
                    {user?.displayName || user?.email?.split('@')[0] || t('profile.user')}
                  </h2>
                  {isAdmin && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
                      <Crown className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-sm">{user?.email}</p>
              </div>
            </div>
            {!isPro && (
              <button 
                onClick={handleUpgradeToPro}
                disabled={loading}
                className="ripple-effect bg-white/20 backdrop-blur-xl hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 border border-white/30 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Oppgrader
              </button>
            )}
            {isPro && (
              <div className="bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="font-semibold">Pro</span>
              </div>
            )}
          </div>

          {/* === QUICK STATS === */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <ImagePlus className="w-3 h-3" />
                Album
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalAlbums}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <ImagePlus className="w-3 h-3" />
                Bilder
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPhotos}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Heart className="w-3 h-3" />
                Favoritter
              </div>
              <p className="text-2xl font-bold text-white">{stats.favorites}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Sparkles className="w-3 h-3" />
                AI
              </div>
              <p className="text-2xl font-bold text-white">{stats.aiAnalyzed}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Clock className="w-3 h-3" />
                Nye (7d)
              </div>
              <p className="text-2xl font-bold text-white">{stats.recentUploads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => onNavigate('security')}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center"
        >
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-sm font-medium">{t('settings.security')}</span>
        </button>
        
        <button 
          onClick={exportUserData}
          disabled={loading}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center disabled:opacity-50"
        >
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <Download className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-sm font-medium">Eksporter</span>
        </button>
        
        <button 
          onClick={handleShareProfile}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center"
        >
          <div className="p-3 bg-pink-600/20 rounded-xl">
            <Share2 className="w-6 h-6 text-pink-400" />
          </div>
          <span className="text-sm font-medium">Del</span>
        </button>
        
        <button 
          onClick={() => openExternalLink('help')}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center"
        >
          <div className="p-3 bg-green-600/20 rounded-xl">
            <HelpCircle className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-sm font-medium">{t('info.help')}</span>
        </button>
      </div>

      {/* === MAIN CONTENT GRID === */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* === LEFT COLUMN === */}
        <div className="space-y-6">
          {/* === STORAGE === */}
          <section className="glass rounded-2xl p-6 border-2 border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <HardDrive className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('common:storage.title')}</h3>
              </div>
              {storagePercent > 80 && (
                <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Nesten fullt
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{formatBytes(storageUsed)}</p>
                  <p className="text-sm opacity-70 mt-1">av {formatBytes(storageLimit)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    storagePercent > 90 ? 'text-red-400' : 
                    storagePercent > 70 ? 'text-orange-400' : 
                    'text-purple-400'
                  }`}>
                    {storagePercent}%
                  </p>
                  <p className="text-xs opacity-70">{t('common:storage.used')}</p>
                </div>
              </div>
              
              <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    storagePercent > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                    storagePercent > 70 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 
                    'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(storagePercent, 100)}%` }}
                >
                  <div className="h-full w-full bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {!isPro && storagePercent > 70 && (
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">Trenger mer plass?</p>
                      <p className="text-xs opacity-70 mb-3">
                        Oppgrader til Pro og få 100GB lagring og AI-funksjoner
                      </p>
                      <button 
                        onClick={handleUpgradeToPro}
                        disabled={loading}
                        className="ripple-effect w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4" />
                        {t('subscription.upgrade')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* === LANGUAGE & THEME === */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Tilpasning</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm opacity-70 mb-2 block flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t('language.title')}
                </label>
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  <option value="no">🇳🇴 Norsk</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-400" />
                  )}
                  <div>
                    <p className="font-medium">{t('theme.title')}</p>
                    <p className="text-xs opacity-70">
                      {isDarkMode ? 'Mørkt tema' : 'Lyst tema'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDarkMode(!isDarkMode);
                    showNotification(`${!isDarkMode ? 'Mørkt' : 'Lyst'} tema aktivert`, "success");
                  }}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    isDarkMode ? 'bg-purple-600' : 'bg-gray-400'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform flex items-center justify-center ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    {isDarkMode ? (
                      <Moon className="w-3 h-3 text-purple-600" />
                    ) : (
                      <Sun className="w-3 h-3 text-orange-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* === SETTINGS === */}
          <section className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('settings')}
              className="w-full p-6 hover:bg-white/5 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-600/20 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('settings.title')}</h3>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                expandedSection === 'settings' ? 'rotate-90' : ''
              }`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${
              expandedSection === 'settings' ? 'max-h-96' : 'max-h-0'
            }`}>
              <div className="px-6 pb-6 space-y-2">
                <button 
                  onClick={() => onNavigate('security')}
                  className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
                >
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t('settings.security')}</p>
                      {(pinEnabled || biometricEnabled) && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs opacity-70">PIN-kode og biometri</p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <button className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="font-medium">{t('settings.notifications')}</p>
                    <p className="text-xs opacity-70">Push-varsler og e-post</p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <label className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10 cursor-pointer">
                  <Upload className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="font-medium">Importer data</p>
                    <p className="text-xs opacity-70">Last opp backup-fil</p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                  <input 
                    type="file" 
                    accept=".zip,.json" 
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-6">
          {/* === AI FEATURES === */}
          <section className="glass rounded-2xl overflow-hidden border-2 border-purple-500/20">
            <button
              onClick={() => toggleSection('ai')}
              className="w-full p-6 hover:bg-white/5 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{t('aiFunctions.title')}</h3>
                    <p className="text-xs opacity-70">Smart bildebehandling</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                  expandedSection === 'ai' ? 'rotate-90' : ''
                }`} />
              </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${
              expandedSection === 'ai' ? 'max-h-[600px]' : 'max-h-0'
            }`}>
              <div className="px-6 pb-6 space-y-2">
                <button 
                  onClick={handleAutoSort}
                  disabled={loading}
                  className="ripple-effect w-full bg-purple-600/10 hover:bg-purple-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-purple-500/30 disabled:opacity-50"
                >
                  <div className="p-2 bg-purple-600/30 rounded-lg">
                    <Scan className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('aiFunctions.autoSort')}</p>
                    <p className="text-xs opacity-70">{t('aiFunctions.autoSortDesc')}</p>
                  </div>
                </button>

                <button 
                  onClick={handleImageEnhancement}
                  disabled={loading}
                  className="ripple-effect w-full bg-blue-600/10 hover:bg-blue-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-blue-500/30 disabled:opacity-50"
                >
                  <div className="p-2 bg-blue-600/30 rounded-lg">
                    <ImagePlus className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('aiFunctions.imageEnhancement')}</p>
                    <p className="text-xs opacity-70">{t('aiFunctions.imageEnhancementDesc')}</p>
                  </div>
                </button>

                <button 
                  onClick={handleFaceRecognition}
                  disabled={loading}
                  className="ripple-effect w-full bg-pink-600/10 hover:bg-pink-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-pink-500/30 disabled:opacity-50"
                >
                  <div className="p-2 bg-pink-600/30 rounded-lg">
                    <Users className="w-5 h-5 text-pink-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('aiFunctions.faceRecognition')}</p>
                    <p className="text-xs opacity-70">{t('aiFunctions.faceRecognitionDesc')}</p>
                  </div>
                </button>

                <button 
                  onClick={handleSmartTagging}
                  disabled={loading}
                  className="ripple-effect w-full bg-green-600/10 hover:bg-green-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-green-500/30 disabled:opacity-50"
                >
                  <div className="p-2 bg-green-600/30 rounded-lg">
                    <Sparkles className="w-5 h-5 text-green-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('aiFunctions.smartTagging')}</p>
                    <p className="text-xs opacity-70">{t('aiFunctions.smartTaggingDesc')}</p>
                  </div>
                </button>

                <button 
                  onClick={handleDuplicateDetection}
                  disabled={loading}
                  className="ripple-effect w-full bg-yellow-600/10 hover:bg-yellow-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-yellow-500/30 disabled:opacity-50"
                >
                  <div className="p-2 bg-yellow-600/30 rounded-lg">
                    <Copy className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('aiFunctions.duplicateDetection')}</p>
                    <p className="text-xs opacity-70">{t('aiFunctions.duplicateDetectionDesc')}</p>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* === ACCOUNT === */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg">{t('account.title')}</h3>
            </div>

            <div className="space-y-2">
              <button className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium">{t('account.profile')}</p>
                  <p className="text-xs opacity-70">Rediger profil og innstillinger</p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>

              <button className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{t('account.subscription')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isPro 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {isPro ? t('subscription.pro') : t('subscription.free')}
                    </span>
                  </div>
                  <p className="text-xs opacity-70">Administrer abonnement</p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>

              <button
                onClick={onLogout}
                className="ripple-effect w-full bg-red-500/10 hover:bg-red-500/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-red-500/30 text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{t('account.logout')}</p>
                  <p className="text-xs opacity-70">Logg ut fra kontoen</p>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="ripple-effect w-full bg-red-500/10 hover:bg-red-500/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-red-500/30 text-red-400 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{t('account.deleteAccount')}</p>
                  <p className="text-xs opacity-70">Permanent slett konto og data</p>
                </div>
              </button>
            </div>
          </section>

          {/* === INFO & HELP === */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-teal-600/20 rounded-lg">
                <Info className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-semibold text-lg">{t('info.title')}</h3>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => openExternalLink('help')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.help')}</p>
                <ExternalLink className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <button 
                onClick={() => openExternalLink('privacy')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.privacy')}</p>
                <ExternalLink className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <button 
                onClick={() => openExternalLink('terms')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.terms')}</p>
                <ExternalLink className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-400" />
                  <p className="font-medium text-sm">{t('info.about')}</p>
                </div>
                <span className="text-xs opacity-70 font-mono">
                  {process.env.REACT_APP_VERSION || 'v7.0'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* === ADMIN PANEL === */}
      {isAdmin && (
        <section className="glass rounded-2xl p-6 mt-6 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-600/5 to-orange-600/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-lg">{t('admin.title')}</h3>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full ml-auto">
              Admin tilgang
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('admin')}
              className="ripple-effect bg-yellow-600/10 hover:bg-yellow-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-yellow-500/30"
            >
              <Users className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="font-medium">{t('admin.userManagement')}</p>
                <p className="text-xs opacity-70">Administrer brukere</p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>

            <button className="ripple-effect bg-yellow-600/10 hover:bg-yellow-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-yellow-500/30">
              <HardDrive className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="font-medium">{t('admin.databaseTools')}</p>
                <p className="text-xs opacity-70">Database verktøy</p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>
          </div>
        </section>
      )}

      {/* === DELETE CONFIRMATION MODAL === */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-red-500/30 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Slett konto</h3>
            </div>
            <p className="opacity-70 mb-6">
              Er du sikker på at du vil slette kontoen din permanent? Alle bilder, 
              album og data vil bli slettet og kan ikke gjenopprettes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="ripple-effect flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={deleteAccount}
                disabled={loading}
                className="ripple-effect flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Slett permanent
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorePage;
