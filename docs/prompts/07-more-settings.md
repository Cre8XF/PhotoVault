# MorePage - Settings Reorganization

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat(more): reorganize settings with collapsible sections"

## FILES TO MODIFY

- @src/pages/MorePage.jsx
- Create @src/components/SettingsSection.jsx
- Create @src/components/SearchableSettings.jsx

## CURRENT STATE ANALYSIS

MorePage currently has:

- Flat list of settings
- No search functionality
- Hard to find specific settings
- Poor mobile organization

## TARGET STATE

Enhanced settings interface with:

- Collapsible sections
- Settings search
- Keyboard shortcuts
- Quick actions
- Better organization

## IMPLEMENTATION STEPS

### 1. Create SettingsSection Component

**File:** `src/components/SettingsSection.jsx`

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const SettingsSection = ({ title, icon: Icon, children, defaultExpanded = false, badge = null }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div className="glass rounded-2xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold flex items-center gap-2">
              {title}
              {badge && <span className="px-2 py-0.5 text-xs bg-purple-600/20 text-purple-400 rounded-full">{badge}</span>}
            </h3>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 opacity-50" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-t border-white/10">
            <div className="p-5 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

### 2. Create SearchableSettings Component

**File:** `src/components/SearchableSettings.jsx`

```jsx
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchableSettings = ({ sections, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all settings for search
  const allSettings = useMemo(() => {
    return sections.flatMap(section =>
      section.items.map(item => ({
        ...item,
        section: section.title
      }))
    );
  }, [sections]);

  // Filter settings based on search
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allSettings.filter(setting => setting.title.toLowerCase().includes(query) || setting.description?.toLowerCase().includes(query) || setting.section.toLowerCase().includes(query));
  }, [searchQuery, allSettings]);

  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
        <input
          type="text"
          placeholder="Søk i innstillinger..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl 
                     focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                     transition-all outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 
                       rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {searchQuery && filteredSettings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full max-w-2xl glass rounded-xl overflow-hidden 
                       shadow-xl border border-white/10"
          >
            <div className="max-h-96 overflow-y-auto">
              {filteredSettings.map((setting, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (setting.onClick) setting.onClick();
                    setSearchQuery('');
                  }}
                  className="w-full p-4 hover:bg-white/10 transition flex items-start gap-3 
                             text-left border-b border-white/5 last:border-0"
                >
                  {setting.icon && (
                    <div className="p-2 bg-purple-600/20 rounded-lg flex-shrink-0">
                      <setting.icon className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{setting.title}</div>
                    {setting.description && <div className="text-sm opacity-70 mt-1">{setting.description}</div>}
                    <div className="text-xs opacity-50 mt-1">{setting.section}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {searchQuery && filteredSettings.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-sm opacity-70">
          Ingen resultater for "{searchQuery}"
        </motion.div>
      )}
    </div>
  );
};
```

### 3. Update MorePage.jsx

Replace the settings section with organized, collapsible sections:

```jsx
import { SettingsSection } from '../components/SettingsSection';
import { SearchableSettings } from '../components/SearchableSettings';
import { Settings, Bell, Globe, Shield, Palette, Database, Zap, HelpCircle, Info, FileText, Users, Download } from 'lucide-react';

// Define settings structure
const settingsSections = [
  {
    id: 'general',
    title: t('settings:general'),
    icon: Settings,
    defaultExpanded: true,
    items: [
      {
        title: t('settings:language'),
        description: t('settings:languageDesc'),
        icon: Globe,
        onClick: () => {
          /* Handle language change */
        }
      },
      {
        title: t('settings:theme'),
        description: t('settings:themeDesc'),
        icon: Palette,
        onClick: () => {
          /* Handle theme change */
        }
      }
    ]
  },
  {
    id: 'notifications',
    title: t('settings:notifications'),
    icon: Bell,
    badge: '3 new',
    items: [
      {
        title: t('settings:pushNotifications'),
        description: t('settings:pushDesc'),
        icon: Bell,
        type: 'toggle',
        value: notificationsEnabled
      }
    ]
  },
  {
    id: 'security',
    title: t('settings:security'),
    icon: Shield,
    items: [
      {
        title: t('settings:twoFactor'),
        description: t('settings:twoFactorDesc'),
        icon: Shield,
        onClick: () => onNavigate('security')
      }
    ]
  },
  {
    id: 'storage',
    title: t('settings:storage'),
    icon: Database,
    items: [
      {
        title: t('settings:manageStorage'),
        description: t('settings:storageDesc'),
        icon: Database,
        onClick: () => handleStorageManagement()
      }
    ]
  }
];

// In component render:
<section className="mb-8">
  <motion.h2 className="text-2xl font-bold mb-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
    {t('settings:title')}
  </motion.h2>

  {/* Search */}
  <SearchableSettings sections={settingsSections} onNavigate={onNavigate} />

  {/* Collapsible Sections */}
  <div className="space-y-4">
    {settingsSections.map(section => (
      <SettingsSection key={section.id} title={section.title} icon={section.icon} defaultExpanded={section.defaultExpanded} badge={section.badge}>
        {section.items.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between p-3 hover:bg-white/5 
                       rounded-lg transition cursor-pointer"
            onClick={item.onClick}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center gap-3 flex-1">
              {item.icon && (
                <div className="p-2 bg-white/5 rounded-lg">
                  <item.icon className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.title}</div>
                {item.description && <div className="text-sm opacity-70 mt-0.5">{item.description}</div>}
              </div>
            </div>

            {item.type === 'toggle' && (
              <button
                className={`relative w-12 h-6 rounded-full transition-colors ${item.value ? 'bg-purple-600' : 'bg-white/10'}`}
                onClick={e => {
                  e.stopPropagation();
                  item.onToggle?.(!item.value);
                }}
              >
                <motion.div className="absolute top-1 w-4 h-4 bg-white rounded-full" animate={{ x: item.value ? 26 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
            )}

            {!item.type && <ChevronRight className="w-5 h-5 opacity-30" />}
          </motion.div>
        ))}
      </SettingsSection>
    ))}
  </div>
</section>;
```

### 4. Add Keyboard Shortcuts Panel

```jsx
<SettingsSection title="Hurtigtaster" icon={Zap} defaultExpanded={false}>
  <div className="space-y-3">
    {[
      { keys: ['⌘', 'K'], action: 'Søk' },
      { keys: ['⌘', 'N'], action: 'Nytt album' },
      { keys: ['⌘', 'U'], action: 'Last opp' },
      { keys: ['⌘', ','], action: 'Innstillinger' },
      { keys: ['ESC'], action: 'Lukk modal' }
    ].map((shortcut, i) => (
      <div key={i} className="flex items-center justify-between p-2">
        <span className="text-sm opacity-70">{shortcut.action}</span>
        <div className="flex gap-1">
          {shortcut.keys.map((key, j) => (
            <kbd
              key={j}
              className="px-2 py-1 bg-white/10 border border-white/20 rounded 
                         text-xs font-mono"
            >
              {key}
            </kbd>
          ))}
        </div>
      </div>
    ))}
  </div>
</SettingsSection>
```

### 5. Add Quick Actions Footer

```jsx
<motion.div className="mt-8 p-4 glass rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {[
      { icon: Download, label: 'Eksporter data', onClick: handleExport },
      { icon: FileText, label: 'Personvern', onClick: () => onNavigate('privacy') },
      { icon: HelpCircle, label: 'Hjelp', onClick: handleHelp },
      { icon: Info, label: 'Om appen', onClick: handleAbout }
    ].map((action, i) => (
      <motion.button
        key={i}
        onClick={action.onClick}
        className="p-3 hover:bg-white/10 rounded-lg transition flex flex-col 
                   items-center gap-2 text-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <action.icon className="w-5 h-5 opacity-70" />
        <span className="text-xs opacity-70">{action.label}</span>
      </motion.button>
    ))}
  </div>
</motion.div>
```

## TESTING CHECKLIST

- [ ] All sections collapse/expand smoothly
- [ ] Search finds settings across all sections
- [ ] Keyboard shortcuts display correctly
- [ ] Toggles work without page reload
- [ ] Mobile: sections stack properly
- [ ] Animations 60fps
- [ ] No layout shift when expanding
- [ ] Search clears on selection
- [ ] Quick actions functional
- [ ] i18n works (NO/EN)

## PERFORMANCE REQUIREMENTS

- Section expand/collapse: <200ms
- Search results: <100ms debounced
- Smooth 60fps animations
- No re-renders on unrelated changes

## COMMIT MESSAGE

```
feat(more): reorganize settings with collapsible sections

- Add collapsible settings sections with smooth animations
- Implement searchable settings with instant results
- Add keyboard shortcuts reference panel
- Create quick actions footer
- Improve mobile organization and accessibility

All interactions under 200ms with 60fps animations
```

## NEXT SESSION

After this is complete and committed, proceed to: `@docs/prompts/08-albums.md`

---

END OF PROMPT
