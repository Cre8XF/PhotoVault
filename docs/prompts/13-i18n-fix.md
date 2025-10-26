# 🌍 Quick i18n Fix for Claude Code

## COPY-PASTE THIS INTO CLAUDE CODE:

```
Perform complete i18n audit and fix for PhotoVault.

FILES TO CHECK:
@src/pages/HomeDashboard.jsx
@src/pages/AlbumsPage.jsx
@src/pages/AlbumPage.jsx
@src/pages/SearchPage.jsx
@src/pages/MorePage.jsx
@src/pages/SecuritySettings.jsx
@src/pages/AISettingsPage.jsx
@src/pages/AdminDashboard.jsx
@src/pages/LoginPage.jsx

@src/components/UploadModal.jsx
@src/components/MoveModal.jsx
@src/components/ConfirmModal.jsx
@src/components/PhotoModal.jsx
@src/components/Navbar.jsx

TASK:
1. Find ALL hardcoded Norwegian strings in these files
2. Replace with proper t() calls using react-i18next
3. Add missing keys to @public/locales/no/translation.json
4. Add English translations to @public/locales/en/translation.json

PATTERNS TO FIND:
- Buttons: "Last opp", "Slett", "Avbryt", "Lagre", "Lukk", "Rediger", "Ferdig"
- Labels: "Bilder", "Album", "Favoritter", "Søk", "Innstillinger"
- Messages: "Laster...", "Ingen bilder", "Vil du slette?"
- Placeholders: placeholder="Søk..."
- Alerts: alert("..."), confirm("...")

IGNORE:
- Brand names (Google Vision, Picsart)
- Technical terms already in English
- Comments in code

TESTING:
After fixing, verify language switching works for ALL text.

COMMIT:
"fix(i18n): complete Norwegian to English translation support

- Found and fixed [X] hardcoded strings
- Added [Y] new translation keys
- Tested language switching on all pages
- All UI text now properly translates"
```

---

## 📋 EXPECTED OUTPUT

Claude will:

1. **Scan all files** and list every hardcoded Norwegian string found
2. **Create translation keys** with proper namespacing
3. **Update translation files** with Norwegian and English versions
4. **Replace strings** in components with `t()` calls
5. **Test** that everything translates correctly
6. **Commit** the changes

---

## 🎯 EXAMPLE FIXES

### Before:

```jsx
<button onClick={handleUpload}>Last opp bilder</button>
<p>Ingen bilder i dette albumet</p>
<input placeholder="Søk i bilder..." />
```

### After:

```jsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation(['album']);

  return (
    <>
      <button onClick={handleUpload}>{t('album:actions.upload')}</button>
      <p>{t('album:empty.noPhotos')}</p>
      <input placeholder={t('album:search.placeholder')} />
    </>
  );
}
```

### Translation files updated:

```json
// no/translation.json
{
  "album": {
    "actions": {
      "upload": "Last opp bilder"
    },
    "empty": {
      "noPhotos": "Ingen bilder i dette albumet"
    },
    "search": {
      "placeholder": "Søk i bilder..."
    }
  }
}

// en/translation.json
{
  "album": {
    "actions": {
      "upload": "Upload photos"
    },
    "empty": {
      "noPhotos": "No photos in this album"
    },
    "search": {
      "placeholder": "Search in photos..."
    }
  }
}
```

---

## ⚡ ALTERNATIVE: Quick Detection Only

If you just want to see what's missing first:

```
Scan these files and LIST all hardcoded Norwegian strings:

@src/pages/*.jsx
@src/components/*.jsx

For each string found, show:
1. File path
2. Line number
3. The hardcoded string
4. Suggested translation key

Don't fix yet, just report findings.
```

Then you can review the list before running the full fix.

---

## 🔍 MANUAL VERIFICATION

After Claude finishes, test manually:

1. Run app: `npm start`
2. Open settings
3. Switch language to English
4. Go through every page:
   - Home
   - Albums
   - Album view
   - Search
   - More/Settings
   - Security
   - AI Settings
   - Admin (if applicable)
5. Check that ALL text is in English
6. Switch back to Norwegian
7. Verify everything is Norwegian again

---

## 🐛 COMMON ISSUES

### Issue: Some text still Norwegian

**Solution:** Run detection script to find remaining strings:

```bash
grep -r "Last opp\|Slett\|Avbryt\|Lagre" src/
```

### Issue: Translation key not found

**Solution:** Check that key exists in both NO and EN files

### Issue: Language doesn't switch

**Solution:** Check that useTranslation hook is imported and used

### Issue: Pluralization not working

**Solution:** Use translation with count:

```jsx
t('photos', { count: 5 }); // "5 bilder" / "5 photos"
```

---

## 📚 TRANSLATION KEY STRUCTURE

Use this consistent structure:

```
{namespace}:{section}.{subsection}.{key}

Examples:
home:sections.favorites
album:actions.upload
search:filters.withFaces
more:storage.used
security:pin.create
```

**Namespaces:**

- `home` - HomeDashboard
- `album` / `albums` - Album pages
- `search` - SearchPage
- `more` - MorePage
- `security` - SecuritySettings
- `aiSettings` - AISettingsPage
- `admin` - AdminDashboard
- `auth` - LoginPage
- `common` - Shared across all pages

---

## ✅ DONE CHECKLIST

- [ ] Claude scanned all files
- [ ] All Norwegian strings replaced
- [ ] Translation files updated (NO & EN)
- [ ] Tested language switching
- [ ] All pages translate correctly
- [ ] No console warnings about missing keys
- [ ] Changes committed
- [ ] Documentation updated

---

END OF QUICK i18n FIX
