// ============================================================================
// PAGE: MorePage.jsx – v5.5 FASE 3.5: Med i18n
// ============================================================================
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Settings,
  Shield,
  Palette,
  Globe,
  Bell,
  HardDrive,
  Star,
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
  Lock,
  Languages
} from "lucide-react";
import { useSecurityContext } from "../contexts/SecurityContext";

const MorePage = ({ 
  user, 
  storageUsed, 
  storageLimit, 
  photos,
  albums,
  isDarkMode, 
  setIsDarkMode, 
  onLogout,
  onNavigate 
}) => {
  const { t, i18n } = useTranslation(['translation', 'common', 'albums']);
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Security context
  const { pinEnabled, biometricEnabled } = useSecurityContext();

  const storagePercent = Math.round((storageUsed / storageLimit) * 100);
  const isPro = user?.isPro || false;
  const isAdmin = user?.role === "admin";

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

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 animate-fade-in">
      {/* Profil header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                {user?.displayName || user?.email?.split('@')[0] || t('profile.user')}
              </h2>
              {isAdmin && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Admin
                </span>
              )}
              {isPro && (
                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
            <p className="text-sm opacity-70">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <p className="font-semibold">{albums.length}</p>
            <p className="opacity-70">{t('albums:albums.title')}</p>
          </div>
          <div>
            <p className="font-semibold">{photos.length}</p>
            <p className="opacity-70">{t('profile.photoCount')}</p>
          </div>
          <div>
            <p className="font-semibold">{photos.filter(p => p.favorite).length}</p>
            <p className="opacity-70">{t('albums:albums.favorites')}</p>
          </div>
        </div>
      </div>

      {/* Sikkerhet status */}
      {(pinEnabled || biometricEnabled) && (
        <div className="glass rounded-2xl p-4 mb-6 border-2 border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t('settings.security')}</p>
              <div className="flex gap-2 text-xs opacity-70 mt-1">
                {pinEnabled && (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    PIN
                  </span>
                )}
                {biometricEnabled && (
                  <span className="flex items-center gap-1">
                    <Scan className="w-3 h-3" />
                    Biometri
                  </span>
                )}
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        </div>
      )}

      {/* Lagring */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-lg">{t('common:storage.title')}</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{formatBytes(storageUsed)} {t('common:storage.used')}</span>
            <span className="opacity-70">{formatBytes(storageLimit)} {t('common:storage.total')}</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                storagePercent > 90 ? 'bg-red-500' : 
                storagePercent > 70 ? 'bg-yellow-500' : 
                'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>

          <p className="text-xs opacity-70">{t('common:storage.percentUsed', { percent: storagePercent })}</p>

          {!isPro && (
            <button className="ripple-effect w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              {t('subscription.upgrade')}
            </button>
          )}
        </div>
      </section>

      {/* Språk (NY SEKSJON) */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-lg">{t('language.title')}</h3>
        </div>

        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="no">🇳🇴 Norsk</option>
          <option value="en">🇬🇧 English</option>
        </select>
        
        <p className="text-xs opacity-70 mt-2">
          {t('language.select')}
        </p>
      </section>

      {/* AI-funksjoner */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('ai')}>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-lg">{t('aiFunctions.title')}</h3>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSection === 'ai' ? 'rotate-90' : ''}`} />
        </div>

        {expandedSection === 'ai' && (
          <div className="space-y-2 mt-4">
            <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-purple-600/30 rounded-lg">
                <Scan className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('aiFunctions.autoSort')}</p>
                <p className="text-xs opacity-70">{t('aiFunctions.autoSortDesc')}</p>
              </div>
            </button>

            <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-blue-600/30 rounded-lg">
                <ImagePlus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('aiFunctions.imageEnhancement')}</p>
                <p className="text-xs opacity-70">{t('aiFunctions.imageEnhancementDesc')}</p>
              </div>
            </button>

            <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-pink-600/30 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('aiFunctions.faceRecognition')}</p>
                <p className="text-xs opacity-70">{t('aiFunctions.faceRecognitionDesc')}</p>
              </div>
            </button>

            <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-green-600/30 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('aiFunctions.smartTagging')}</p>
                <p className="text-xs opacity-70">{t('aiFunctions.smartTaggingDesc')}</p>
              </div>
            </button>

            <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-yellow-600/30 rounded-lg">
                <Copy className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('aiFunctions.duplicateDetection')}</p>
                <p className="text-xs opacity-70">{t('aiFunctions.duplicateDetectionDesc')}</p>
              </div>
            </button>
          </div>
        )}
      </section>

      {/* Innstillinger */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('settings')}>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-lg">{t('settings.title')}</h3>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSection === 'settings' ? 'rotate-90' : ''}`} />
        </div>

        {expandedSection === 'settings' && (
          <div className="space-y-2 mt-4">
            {/* Sikkerhet & PIN-kode */}
            <button 
              onClick={() => onNavigate('security')}
              className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left"
            >
              <Shield className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{t('settings.security')}</p>
                  {(pinEnabled || biometricEnabled) && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      {t('common:navigation.enabled', { defaultValue: 'Aktivert' })}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-70">{t('settings.security')}</p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>

            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5" />
                <p className="font-medium">{t('theme.title')}</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative w-14 h-7 rounded-full transition ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <Bell className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium">{t('settings.notifications')}</p>
                <p className="text-xs opacity-70">Push-varsler</p>
              </div>
            </button>
          </div>
        )}
      </section>

      {/* Konto */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-lg">{t('account.title')}</h3>
        </div>

        <div className="space-y-2">
          <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <User className="w-5 h-5" />
            <p className="font-medium">{t('account.profile')}</p>
          </button>

          <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <CreditCard className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-medium">{t('account.subscription')}</p>
              <p className="text-xs opacity-70">{isPro ? t('subscription.pro') : t('subscription.free')}</p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="ripple-effect w-full glass p-4 rounded-xl hover:bg-red-500/20 transition flex items-center gap-3 text-left text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <p className="font-medium">{t('account.logout')}</p>
          </button>

          <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-red-500/20 transition flex items-center gap-3 text-left text-red-400">
            <Trash2 className="w-5 h-5" />
            <p className="font-medium">{t('account.deleteAccount')}</p>
          </button>
        </div>
      </section>

      {/* Info */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-lg">{t('info.title')}</h3>
        </div>

        <div className="space-y-2">
          <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <HelpCircle className="w-5 h-5" />
            <p className="font-medium">{t('info.help')}</p>
          </button>

          <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <FileText className="w-5 h-5" />
            <p className="font-medium">{t('info.privacy')}</p>
          </button>

          <button className="ripple-effect w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <FileText className="w-5 h-5" />
            <p className="font-medium">{t('info.terms')}</p>
          </button>

          <div className="glass p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5" />
              <p className="font-medium">{t('info.about')}</p>
            </div>
            <span className="text-xs opacity-70">{t('common:app.version')}</span>
          </div>
        </div>
      </section>

      {/* Admin (kun hvis admin) */}
      {isAdmin && (
        <section className="glass rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-lg">{t('admin.title')}</h3>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('admin')}
              className="ripple-effect w-full bg-purple-600/20 hover:bg-purple-600/30 p-4 rounded-xl transition flex items-center gap-3 text-left"
            >
              <Users className="w-5 h-5" />
              <p className="font-medium">{t('admin.userManagement')}</p>
            </button>

            <button className="ripple-effect w-full bg-purple-600/20 hover:bg-purple-600/30 p-4 rounded-xl transition flex items-center gap-3 text-left">
              <HardDrive className="w-5 h-5" />
              <p className="font-medium">{t('admin.databaseTools')}</p>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default MorePage;
