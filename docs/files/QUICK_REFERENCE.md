# Quick Reference - PhotoVault Funksjoner

Hurtigoversikt over de mest brukte funksjonene og hvordan du henviser til dem.

---

## 🏠 Home Dashboard

**Fil:** `src/pages/HomeDashboard.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| Statistikk-visning | "stats-visningen på home" | `stats` useMemo (linje ~28) |
| Recent photos grid | "nylige bilder-grid" | `recentPhotos` (linje ~46) |
| Favorites grid | "favoritter-seksjonen" | `favoritePhotos` (linje ~39) |
| Smart albums | "smarte album-kortene" | Smart Albums section (linje ~90) |
| Upload-knapp | "upload-knappen på home" | Upload button (linje ~139) |
| Quick stats | "quick stats-panelet" | Quick stats section (linje ~145) |

### Vanlige issues:
- **"Stats viser feil tall"** → Sjekk `stats` useMemo dependency array
- **"Recent photos ikke sortert riktig"** → Verifiser `.sort()` i `recentPhotos`
- **"Upload modal åpner ikke"** → Sjekk `isUploadOpen` state

---

## 📁 Albums Page

**Fil:** `src/pages/AlbumsPage.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| Grid/List toggle | "view mode toggle" | `viewMode` state |
| Album-kort | "album cards" | AlbumCard component |
| Edit/Delete knapper | "album hover-knappene" | Hover buttons (linje ~120) |
| Photo grid view | "alle bilder-visningen" | PhotoGridOptimized |
| Smart filters | "smart album-filtrene" | Smart filters section |
| Bulk select | "velg flere-funksjonen" | `selectedPhotos` state |

### Vanlige issues:
- **"Edit-knapper vises ikke"** → Sjekk hover-state på album card
- **"Kan ikke slette album"** → Verifiser `handleDeleteAlbum` i App.js
- **"Photo count feil"** → Sjekk `onUpdatePhotoCount` prop

---

## 🖼️ Album Page (Detaljvisning)

**Fil:** `src/pages/AlbumPage.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| Edit mode | "edit-modus i album-visningen" | `editMode` state (linje ~25) |
| Set cover | "sett som cover-funksjonen" | `handleSetCover` (linje ~150) |
| Grid size | "grid-størrelse toggle" | `gridSize` state (2-5) |
| View mode | "list/grid visning" | `viewMode` state |
| Sortering | "sorteringsknappen" | `sortBy` state + dropdown |
| Filtrering | "filter-panelet" | Filter section med toggles |
| Bulk delete | "slett flere-knappen" | `handleBulkDelete` |
| Move photos | "flytt bilder-funksjonen" | MoveModal integration |

### Vanlige issues:
- **"Cover ikke oppdateres"** → Sjekk `onSetAlbumCover` prop + Firestore update
- **"Sortering fungerer ikke"** → Verifiser `filteredPhotos` useMemo
- **"Filtrer resetter seg"** → Sjekk state persistence

---

## 📤 Upload Modal

**Fil:** `src/components/UploadModal.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| Drag & drop | "drag-drop området" | Drop zone area |
| File selector | "fil-velgeren" | File input |
| Album dropdown | "album-velgeren i upload" | Album select |
| Create album | "opprett album fra upload" | Create album button |
| Progress bar | "upload-progress" | Progress indicator |
| AI toggle | "AI-analyse checkbox" (deaktivert) | Commented out |

### Vanlige issues:
- **"Filer ikke lastes opp"** → Sjekk `onUpload` prop + Firebase rules
- **"Progress stuck"** → Verifiser uploadProgress state updates
- **"Album ikke valgt riktig"** → Sjekk `selectedAlbum` prop

---

## 🔍 Search Page

**Fil:** `src/pages/SearchPage.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| Søkefelt | "search input-feltet" | Search input (linje ~190) |
| Quick filters | "quick filter-knappene" | Quick filters section |
| Advanced filters | "avanserte filtre" | Advanced filters dropdown |
| Album filter | "album-filteret" | Album select filter |
| Category filter | "kategori-filteret" | Category select |
| Date filter | "dato-filteret" | Date range select |
| Popular tags | "populære tags-seksjonen" | Popular tags pills |
| Edit mode | "edit-modus i søk" | `editMode` state |
| Results grid | "søkeresultat-grid" | Results section |

### Vanlige issues:
- **"Søk gir ingen resultater"** → Sjekk `filteredPhotos` filter-logikk
- **"Filtre ikke brukes"** → Verifiser `activeFilters` state + filter application
- **"Popular tags tomme"** → Sjekk `popularTags` useMemo

---

## ⚙️ More Page

**Fil:** `src/pages/MorePage.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| Profile section | "profil-seksjonen" | Profile card section |
| Storage bar | "lagrings-indikatoren" | Storage progress bar |
| Account buttons | "konto-knappene" | Account section |
| Security settings | "sikkerhets-innstillingene" | Security section |
| Language picker | "språk-velgeren" | Language dropdown |
| Theme toggle | "tema-bryteren" | Theme toggle |
| Admin section | "admin-panelet" (kun admin) | Admin section |
| Delete account | "slett konto-knappen" | Delete button |
| Logout | "logg ut-knappen" | Logout button |
| AI functions | "AI-funksjoner (coming soon)" | AI modal |
| Vault | "vault-knappen (coming soon)" | Vault modal |

### Vanlige issues:
- **"Lagring viser 0%"** → Sjekk `storageUsed` prop fra `useStorageCalc`
- **"Språk endres ikke"** → Verifiser i18n.changeLanguage() + localStorage
- **"Tema persisterer ikke"** → Sjekk localStorage save/load
- **"Admin-seksjonen vises ikke"** → Verifiser `isAdmin` prop

---

## 🔐 Security Settings

**Fil:** `src/pages/SecuritySettings.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| PIN setup | "PIN-oppsett" | PIN setup section |
| Biometric toggle | "biometrisk-bryteren" | Biometric switch |
| Auto-lock | "auto-lock innstillingen" | Auto-lock dropdown |
| Change PIN | "endre PIN" | Change PIN modal |
| Disable PIN | "deaktiver PIN" | Disable button |

---

## 📊 Admin Dashboard

**Fil:** `src/pages/AdminDashboard.jsx`

### Referanser til funksjoner:

| Funksjon | Hvordan referere | Kode-referanse |
|----------|------------------|----------------|
| User stats | "bruker-statistikken" | User stats cards |
| Storage stats | "lagrings-statistikk" | Storage overview |
| Database tools | "database-verktøyene" | Database section |
| Migration tools | "migrerings-verktøyet" | Migration buttons |

---

## 🔄 Vanlige interaksjoner mellom sider

### Navigasjonsflyt:
```
Home → Albums (via nav bar)
Home → Album Detail (via recent photos)
Albums → Album Detail (via album card)
Album Detail → Photo Modal (via photo click)
Search → Photo Modal (via result click)
More → Security Settings (via security button)
More → Profile (via profile button)
More → Subscription (via subscription button)
```

### Data-refresh flow:
```
Upload Complete → refreshData() → All pages update
Delete Photo → refreshData() → Album photoCount updates
Move Photo → refreshData() → Source/Target albums update
Create Album → refreshData() → Albums list updates
```

---

## 🛠️ Debugging Quick Reference

### State-relaterte issues:

**"Data ikke oppdateres"**
1. Sjekk `refreshData` kalles etter operasjon
2. Verifiser Firestore listeners
3. Sjekk component re-render med React DevTools

**"Props undefined"**
1. Sjekk prop drilling fra App.js
2. Verifiser prop names matcher
3. Sjekk conditional rendering (`&&` operator)

**"Modal ikke lukker"**
1. Sjekk `isOpen` state
2. Verifiser `onClose` kalles
3. Sjekk event.stopPropagation() på nested clicks

### Firebase-relaterte issues:

**"Permission denied"**
1. Sjekk Firestore Security Rules
2. Verifiser bruker er autentisert
3. Sjekk userId matcher document path

**"Upload fails"**
1. Verifiser Storage Rules
2. Sjekk filstørrelse (<10MB bilder, <100MB video)
3. Sjekk nettverk-tilkobling

**"Data not syncing"**
1. Verifiser onSnapshot listener setup
2. Sjekk unsubscribe ikke kalles for tidlig
3. Sjekk Firestore index for complex queries

---

## 📋 Kodemønstre for vanlige operasjoner

### Legge til ny funksjon på en side:

```javascript
// 1. Legg til state
const [newFeature, setNewFeature] = useState(false)

// 2. Lag handler-funksjon
const handleNewFeature = async () => {
  try {
    setLoading(true)
    // Din kode her
    await refreshData()
    showNotification('Success!', 'success')
  } catch (error) {
    console.error('Error:', error)
    showNotification('Error occurred', 'error')
  } finally {
    setLoading(false)
  }
}

// 3. Legg til UI
<button onClick={handleNewFeature}>
  New Feature
</button>
```

### Legge til ny filter på search:

```javascript
// 1. Legg til i activeFilters state
const [activeFilters, setActiveFilters] = useState({
  // ... existing filters
  newFilter: false
})

// 2. Oppdater filteredPhotos useMemo
const filteredPhotos = useMemo(() => {
  return safePhotos.filter(photo => {
    // ... existing filter logic
    if (activeFilters.newFilter && !photo.newProperty) return false
    return true
  })
}, [safePhotos, activeFilters])

// 3. Legg til toggle button
<button
  onClick={() => setActiveFilters(f => ({ ...f, newFilter: !f.newFilter }))}
  className={activeFilters.newFilter ? 'active' : ''}
>
  New Filter
</button>
```

### Legge til ny modal:

```javascript
// 1. Import modal component
import NewModal from '../components/NewModal'

// 2. Legg til state
const [isNewModalOpen, setNewModalOpen] = useState(false)

// 3. Render modal
<NewModal
  isOpen={isNewModalOpen}
  onClose={() => setNewModalOpen(false)}
  onConfirm={handleConfirm}
/>
```

---

## 🎯 Testing Checklist

### For hver ny funksjon, test:

- [ ] Desktop view (Chrome, Firefox, Safari)
- [ ] Mobile view (iOS Safari, Chrome Android)
- [ ] Tablet view (iPad, Android tablet)
- [ ] Dark mode
- [ ] Light mode
- [ ] Med data (normale brukere)
- [ ] Uten data (nye brukere)
- [ ] Med stor datamengde (1000+ bilder)
- [ ] Error states
- [ ] Loading states
- [ ] Edge cases (tomme strenger, null values, etc.)

---

**Opprettet:** 10. november 2025  
**Til bruk ved:** Referanse under debugging og utvikling  
**Oppdateres:** Ved nye funksjoner eller endringer
