import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAuth from '../hooks/useAuth'
import usePhotoData from '../hooks/usePhotoData'
import useStore from '../state/store'
import {
  UserCircle,
  Settings,
  Moon,
  Sun,
  Languages,
  Bell,
  ShieldCheck,
  Server,
  LogOut,
  Trash2,
  FileText,
  Mail,
  Info,
  ChevronRight
} from 'lucide-react'

const SettingsPage = () => {
  const { t, i18n } = useTranslation()
  const { user, userProfile, handleLogout } = useAuth()
  const { photos } = usePhotoData()

  // ✅ P2 FIX: Use Zustand store for theme instead of local state
  const isDarkMode = useStore((state) => state.isDarkMode)
  const setTheme = useStore((state) => state.setTheme)

  const [language, setLanguage] = useState(i18n.language)
  const [notifications, setNotifications] = useState({
    uploads: true,
    favorites: true,
    albums: false
  })

  const accountCreated = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('no-NO')
    : t('settings:unknown')

  const storageUsed = photos.reduce((sum, p) => sum + (p.size || 0), 0)
  const storageUsedMB = (storageUsed / (1024 * 1024)).toFixed(1)

  // ✅ P2 FIX: Use Zustand setTheme which correctly manages dark-mode/light-mode classes on body
  const handleThemeChange = (newTheme) => {
    if (newTheme === 'dark') {
      setTheme(true)
    } else if (newTheme === 'light') {
      setTheme(false)
    } else {
      // Auto mode - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark)
    }
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const handleLogoutClick = async () => {
    if (window.confirm(t('settings:logoutConfirm'))) {
      await handleLogout()
    }
  }

  const handleDeleteAccount = async () => {
    alert(t('settings:deleteAccountError'))
  }

  return (
    <div className="settings-page max-w-2xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('settings:title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('settings:subtitle')}
        </p>
      </div>

      <section className="mb-6">
        <div className="glass card-premium p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('settings:profile')}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  loading="lazy"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
              )}

              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {user?.displayName || t('settings:anonymous')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('settings:accountCreated')}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {accountCreated}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('settings:storageUsed')}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {storageUsedMB} MB
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('settings:tier')}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                  {userProfile?.subscriptionTier || user?.plan || 'GRATIS'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="glass card-premium p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('settings:appearance')}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings:theme')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    !isDarkMode
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sun className="w-6 h-6 mx-auto mb-1 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {t('settings:light')}
                  </span>
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isDarkMode
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Moon className="w-6 h-6 mx-auto mb-1 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {t('settings:dark')}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Languages className="w-4 h-4 inline mr-1" />
                {t('settings:language')}
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="no">Norsk (Bokmål)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="glass card-premium p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('settings:notifications')}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings:notifyUploads')}
              </span>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, uploads: !prev.uploads }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.uploads ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications.uploads ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings:notifyFavorites')}
              </span>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, favorites: !prev.favorites }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.favorites ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications.favorites ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings:notifyAlbums')}
              </span>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, albums: !prev.albums }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.albums ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications.albums ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="glass card-premium p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('settings:privacy')}
            </h2>
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings:changePassword')}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings:exportData')}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="glass card-premium p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('settings:about')}
            </h2>
          </div>

          <div className="space-y-2">
            <a
              href="/terms"
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 inline mr-2" />
                {t('settings:terms')}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>

            <a
              href="/privacy"
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-4 h-4 inline mr-2" />
                {t('settings:privacyPolicy')}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>

            <a
              href="mailto:support@pixtr.cloud"
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4 inline mr-2" />
                {t('settings:contact')}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>

            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pixtr v1.0.0
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="glass card-premium p-6 rounded-2xl border-2 border-red-200 dark:border-red-900/30">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            {t('settings:dangerZone')}
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">
                {t('settings:logout')}
              </span>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">
                {t('settings:deleteAccount')}
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SettingsPage
