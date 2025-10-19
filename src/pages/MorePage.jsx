// ============================================================================
// PAGE: MorePage.jsx – v4.0 Erstatter ProfilePage
// ============================================================================
import React, { useState } from "react";
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
  ChevronRight
} from "lucide-react";

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
  const [expandedSection, setExpandedSection] = useState(null);

  const storagePercent = Math.round((storageUsed / storageLimit) * 100);
  const isPro = user?.isPro || false;
  const isAdmin = user?.role === "admin";

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
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
                {user?.displayName || user?.email?.split('@')[0] || 'Bruker'}
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
            <p className="opacity-70">Album</p>
          </div>
          <div>
            <p className="font-semibold">{photos.length}</p>
            <p className="opacity-70">Bilder</p>
          </div>
          <div>
            <p className="font-semibold">{photos.filter(p => p.favorite).length}</p>
            <p className="opacity-70">Favoritter</p>
          </div>
        </div>
      </div>

      {/* Lagring */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-lg">Lagring</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{formatBytes(storageUsed)} brukt</span>
            <span className="opacity-70">{formatBytes(storageLimit)} totalt</span>
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

          <p className="text-xs opacity-70">{storagePercent}% brukt</p>

          {!isPro && (
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Oppgrader til Pro
            </button>
          )}
        </div>
      </section>

      {/* AI-funksjoner */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('ai')}>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-lg">AI-funksjoner</h3>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSection === 'ai' ? 'rotate-90' : ''}`} />
        </div>

        {expandedSection === 'ai' && (
          <div className="space-y-2 mt-4">
            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-purple-600/30 rounded-lg">
                <Scan className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Auto-sortering</p>
                <p className="text-xs opacity-70">Organiser bilder automatisk</p>
              </div>
            </button>

            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-blue-600/30 rounded-lg">
                <ImagePlus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Bildeforbedring</p>
                <p className="text-xs opacity-70">AI-forbedring av kvalitet</p>
              </div>
            </button>

            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-pink-600/30 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Ansiktsgjenkjenning</p>
                <p className="text-xs opacity-70">Grupper bilder etter person</p>
              </div>
            </button>

            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-green-600/30 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Smart tagging</p>
                <p className="text-xs opacity-70">Automatisk AI-tagger</p>
              </div>
            </button>

            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <div className="p-2 bg-yellow-600/30 rounded-lg">
                <Copy className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Duplikat-deteksjon</p>
                <p className="text-xs opacity-70">Finn og fjern duplikater</p>
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
            <h3 className="font-semibold text-lg">Innstillinger</h3>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSection === 'settings' ? 'rotate-90' : ''}`} />
        </div>

        {expandedSection === 'settings' && (
          <div className="space-y-2 mt-4">
            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <Shield className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium">Sikkerhet & PIN-kode</p>
                <p className="text-xs opacity-70">Konfigurer app-lås</p>
              </div>
            </button>

            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5" />
                <p className="font-medium">Tema</p>
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

            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <Globe className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium">Språk</p>
                <p className="text-xs opacity-70">Norsk</p>
              </div>
            </button>

            <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
              <Bell className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium">Notifikasjoner</p>
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
          <h3 className="font-semibold text-lg">Konto</h3>
        </div>

        <div className="space-y-2">
          <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <User className="w-5 h-5" />
            <p className="font-medium">Min profil</p>
          </button>

          <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <CreditCard className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-medium">Abonnement</p>
              <p className="text-xs opacity-70">{isPro ? 'Pro' : 'Gratis'}</p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full glass p-4 rounded-xl hover:bg-red-500/20 transition flex items-center gap-3 text-left text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <p className="font-medium">Logg ut</p>
          </button>

          <button className="w-full glass p-4 rounded-xl hover:bg-red-500/20 transition flex items-center gap-3 text-left text-red-400">
            <Trash2 className="w-5 h-5" />
            <p className="font-medium">Slett konto</p>
          </button>
        </div>
      </section>

      {/* Info */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-lg">Informasjon</h3>
        </div>

        <div className="space-y-2">
          <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <HelpCircle className="w-5 h-5" />
            <p className="font-medium">Hjelp og support</p>
          </button>

          <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <FileText className="w-5 h-5" />
            <p className="font-medium">Privacy policy</p>
          </button>

          <button className="w-full glass p-4 rounded-xl hover:bg-white/10 transition flex items-center gap-3 text-left">
            <FileText className="w-5 h-5" />
            <p className="font-medium">Terms of service</p>
          </button>

          <div className="glass p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5" />
              <p className="font-medium">Om PhotoVault</p>
            </div>
            <span className="text-xs opacity-70">v3.1</span>
          </div>
        </div>
      </section>

      {/* Admin (kun hvis admin) */}
      {isAdmin && (
        <section className="glass rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-lg">Admin</h3>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('admin')}
              className="w-full bg-purple-600/20 hover:bg-purple-600/30 p-4 rounded-xl transition flex items-center gap-3 text-left"
            >
              <Users className="w-5 h-5" />
              <p className="font-medium">Brukeradministrasjon</p>
            </button>

            <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 p-4 rounded-xl transition flex items-center gap-3 text-left">
              <HardDrive className="w-5 h-5" />
              <p className="font-medium">Database-verktøy</p>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default MorePage;
