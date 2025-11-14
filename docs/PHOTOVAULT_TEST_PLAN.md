# PhotoVault - Komplett Testplan

**Versjon:** MVP Pre-Launch
**Dato:** 2025-01-09
**Tester:** Roger

---

## 📋 Testinstruksjoner

### Før du starter:

1. Åpne appen i Chrome/Edge (desktop)
2. Åpne Developer Tools (F12)
3. Ha både norsk og engelsk språk klart for testing
4. Test først i desktop, deretter i mobil (responsive mode)
5. Test både dark mode og light mode for hver side
6. Sjekk console for errors underveis

### Hvordan bruke denne listen:

- [ ] = Ikke testet
- [x] = Testet og OK
- [!] = Feil funnet (noter under seksjonen)

---

## 🏠 1. HOME / DASHBOARD

### Desktop - Dark Mode

#### Visuell Test

- [ ] Logo vises øverst til venstre
- [ ] Bottom navigation synlig med 5 ikoner (Home, Albums, +, Search, More)
- [ ] "Home" har gylden glow (active state)
- [ ] Skeleton screens vises mens data laster
- [ ] Smooth fade-in når bilder laster

#### Recent Photos Section

- [ ] "Recent Photos" tittel vises
- [ ] Viser siste opplastede bilder i vannrett scroll
- [ ] Kan scrolle horisontalt
- [ ] Bilder har ripple effect når klikket
- [ ] Klikk på bilde åpner PhotoModal
- [ ] Hover viser subtle scale-up

#### Favorites Section

- [ ] "Favorites" tittel vises
- [ ] Viser favorittbilder i vannrett scroll
- [ ] Tom hvis ingen favoritter (viser empty state)
- [ ] Kan scrolle horisontalt
- [ ] Bilder har ripple effect

#### Albums Section

- [ ] "My Albums" tittel vises med antall
- [ ] Album cards i grid layout (3-4 kolonner)
- [ ] Album cover vises korrekt
- [ ] Album navn vises
- [ ] Photo count vises ("X photos")
- [ ] Staggered animation når siden laster
- [ ] Ripple effect på album cards
- [ ] 3D tilt effect on hover (desktop)
- [ ] Klikk åpner album

#### Smart Albums

- [ ] "Smart Albums" seksjon vises
- [ ] "Last 30 Days" album
- [ ] "With Faces" album (hvis AI aktivert)
- [ ] "Unassigned" album (bilder uten album)
- [ ] Riktig antall bilder i hvert smart album

#### Interaksjoner

- [ ] Scroll er smooth
- [ ] Ingen layout shift
- [ ] Ingen console errors
- [ ] Loading state vises korrekt
- [ ] Empty states vises hvis ingen data

---

### Desktop - Light Mode

#### Visuell Test

- [ ] Bakgrunn er lys/hvit
- [ ] Tekst har god kontrast (lett lesbar)
- [ ] Bottom nav har lys bakgrunn
- [ ] Active state gylden glow synlig
- [ ] Album cards har lys styling
- [ ] Glass-morphism synlig på modals

#### Funksjonalitet

- [ ] Alle funksjoner fra dark mode fungerer
- [ ] Ingen visuell bug ved tema-bytte
- [ ] Smooth transition mellom themes

---

### Mobile (375px - 768px)

#### Layout

- [ ] Bottom navigation floater over innhold
- [ ] Correct spacing fra bunn (12-16px)
- [ ] Touch targets minimum 44px
- [ ] Album grid justerer til 2 kolonner
- [ ] Horizontal scroll fungerer smooth
- [ ] Ingen horizontal overflow

#### Interaksjoner

- [ ] Tap på album card fungerer
- [ ] Ripple effect synlig on tap
- [ ] Swipe i horizontal lists fungerer
- [ ] Pull to refresh (hvis implementert)
- [ ] Bottom nav ikke skjult av keyboard

#### Performance

- [ ] Smooth scrolling (60fps)
- [ ] Bilder laster progressivt
- [ ] Ingen lag ved interaksjoner

---

### i18n Test (Home)

#### Norsk (NO)

- [ ] "Hjem" i navigation
- [ ] "Nylige Bilder" / "Siste bilder"
- [ ] "Favoritter"
- [ ] "Mine Album" med riktig flertall
- [ ] "Smart album" tekster
- [ ] "X bilder" (flertall korrekt)
- [ ] Empty states på norsk

#### Engelsk (EN)

- [ ] "Home" in navigation
- [ ] "Recent Photos"
- [ ] "Favorites"
- [ ] "My Albums" with correct plural
- [ ] "Smart albums" texts
- [ ] "X photos" (plural correct)
- [ ] Empty states in English

#### Språkbytte

- [ ] Bytte fra NO til EN oppdaterer alle tekster
- [ ] Ingen hardkodet tekst synlig
- [ ] Dato-format endres (DD.MM.YYYY vs MM/DD/YYYY)
- [ ] Tall-format korrekt (1.000 vs 1,000)

---

### Feil funnet (Home):

```
[Beskrive feil her]
-
```

---

## 📂 2. ALBUMS PAGE

### Desktop - Dark Mode

#### Visuell Test

- [ ] "Albums" tittel øverst
- [ ] Album grid layout (3-4 kolonner)
- [ ] Hver album card viser:
  - [ ] Cover image
  - [ ] Album navn
  - [ ] Photo count
  - [ ] Opprettet dato
- [ ] Ripple effect på cards
- [ ] Glass-morphism on hover overlay
- [ ] Staggered animation on load

#### Toolbar

- [ ] "Create Album" knapp synlig
- [ ] View toggle (grid/list) fungerer
- [ ] Sort dropdown (dato, navn, størrelse)
- [ ] Filter options synlige
- [ ] Ripple effect på alle knapper

#### Album Operations

- [ ] Klikk album → åpner AlbumPage
- [ ] Hover viser edit/delete knapper
- [ ] Edit knapp åpner AlbumModal
- [ ] Delete knapp viser confirm modal
- [ ] 3D tilt effect on hover

#### Empty State

- [ ] Vises når ingen album
- [ ] "Create your first album" melding
- [ ] Call-to-action knapp
- [ ] Illustrasjon/ikon synlig

---

### Create Album Modal

#### Visuell

- [ ] Glass-morphism bakgrunn
- [ ] Modal sentrert på skjerm
- [ ] Backdrop blur synlig
- [ ] X-knapp øverst høyre
- [ ] Ripple effect på X-knapp

#### Form Fields

- [ ] "Album Name" input
  - [ ] Premium focus animation (scale up)
  - [ ] Purple glow on focus
  - [ ] Placeholder synlig
- [ ] "Description" textarea
  - [ ] Premium focus animation
  - [ ] Auto-resize ved typing
- [ ] "Cover Image URL" input (optional)
  - [ ] Premium focus animation

#### Buttons

- [ ] "Cancel" knapp (grå)
  - [ ] Ripple effect
  - [ ] Lukker modal
- [ ] "Create Album" knapp (gradient purple/pink)
  - [ ] Ripple effect
  - [ ] Disabled hvis navn tomt
  - [ ] Loading spinner mens oppretter

#### Funksjonalitet

- [ ] ESC-taste lukker modal
- [ ] Klikk utenfor lukker modal
- [ ] Validering: navn required
- [ ] Success toast etter opprettelse
- [ ] Nytt album vises i listen

---

### Edit Album Modal

- [ ] Pre-fylt med eksisterende data
- [ ] Samme validering som create
- [ ] "Save Changes" knapp i stedet for "Create"
- [ ] Success toast etter lagring
- [ ] Endringer reflekteres umiddelbart

---

### Delete Confirmation Modal

- [ ] Glass-morphism bakgrunn
- [ ] Tydelig warning tekst
- [ ] Album navn vises i teksten
- [ ] "Cancel" og "Delete" knapper
- [ ] Delete knapp er rød
- [ ] Ripple effect på begge knapper
- [ ] Success toast etter sletting
- [ ] Album forsvinner fra listen

---

### AlbumPage (Inside an Album)

#### Header

- [ ] Back arrow (← til Albums page)
- [ ] Album navn som tittel
- [ ] Edit knapp (blyant-ikon)
- [ ] Delete knapp (søppelbøtte)
- [ ] Share knapp (hvis implementert)
- [ ] Ripple effect på alle knapper

#### Photo Grid

- [ ] Photos i responsive grid
- [ ] Skeleton loading mens laster
- [ ] Staggered fade-in animation
- [ ] Hover viser overlay
  - [ ] Favorite ikon (hjerte)
  - [ ] Info ikon
  - [ ] Delete ikon (edit mode)
- [ ] Ripple effect på photo cards

#### Toolbar

- [ ] "Upload" knapp
- [ ] "Edit Mode" toggle
- [ ] Sort dropdown
- [ ] Filter options
- [ ] Search input
- [ ] Ripple effects

#### Edit Mode

- [ ] Photos får checkboxes
- [ ] Select multiple photos
- [ ] "Delete Selected" knapp
- [ ] "Move to Album" knapp
- [ ] "Set as Cover" knapp
- [ ] Bulk operations fungerer

#### Photo Modal (når photo klikkes)

- [ ] Photo vises fullskjerm
- [ ] Navigation arrows (prev/next)
- [ ] Favorite knapp (toggle)
- [ ] Download knapp
- [ ] Edit knapp → PhotoEditor
- [ ] Info knapp → metadata panel
- [ ] Close knapp (X)
- [ ] ESC lukker modal
- [ ] Arrow keys navigerer
- [ ] Ripple på alle knapper

#### Empty Album

- [ ] Empty state melding
- [ ] "Upload Photos" call-to-action
- [ ] Illustrasjon

---

### Desktop - Light Mode

- [ ] Alle elementer synlige
- [ ] God kontrast på all tekst
- [ ] Glass effect synlig
- [ ] Buttons lesbare
- [ ] Modals har lys styling

---

### Mobile - Albums Page

#### Layout

- [ ] Album grid → 2 kolonner
- [ ] Touch-friendly card size
- [ ] Bottom nav ikke overlapper
- [ ] Toolbar buttons stack vertically (hvis nødvendig)

#### Interaksjoner

- [ ] Tap album → åpner album
- [ ] Long press → viser context menu (optional)
- [ ] Swipe gestures (hvis implementert)
- [ ] Modal tar full bredde
- [ ] Keyboard lukkes etter submit

#### AlbumPage Mobile

- [ ] Photo grid → 3 kolonner
- [ ] Header compact (smaller buttons)
- [ ] Edit mode: checkboxes bigger (44px)
- [ ] Modal fullscreen on small devices
- [ ] Touch targets minimum 44px

---

### i18n Test (Albums)

#### Norsk

- [ ] "Album" / "Album"
- [ ] "Opprett album" / "Lag nytt album"
- [ ] "Rediger album"
- [ ] "Slett album"
- [ ] "X bilder" (flertall)
- [ ] "Ingen bilder" / "Tomt album"
- [ ] Form labels på norsk
- [ ] Error messages på norsk
- [ ] Success toasts på norsk

#### Engelsk

- [ ] "Albums"
- [ ] "Create Album"
- [ ] "Edit Album"
- [ ] "Delete Album"
- [ ] "X photos" (plural)
- [ ] "No photos" / "Empty album"
- [ ] Form labels in English
- [ ] Error messages in English
- [ ] Success toasts in English

---

### Feil funnet (Albums):

```
[Beskrive feil her]
-
```

---

## ⬆️ 3. UPLOAD MODAL

### Desktop - Dark Mode

#### Modal Åpning

- [ ] Åpnes fra "+" knapp i bottom nav
- [ ] Åpnes fra "Upload" knapp i album
- [ ] Glass-morphism bakgrunn
- [ ] Smooth slide-in animation
- [ ] Backdrop blur

#### File Selection Methods

##### 1. Browse Files Button

- [ ] "Browse Files" knapp synlig
- [ ] Folder-ikon synlig
- [ ] Ripple effect
- [ ] Åpner file picker
- [ ] Supports multiple selection
- [ ] Accepts JPG, PNG, GIF, WebP

##### 2. Drag & Drop Zone

- [ ] Dashed border synlig
- [ ] "Drag and drop images here" tekst
- [ ] Hover state når dragging
- [ ] Border blir solid purple ved drag over
- [ ] Drop fungerer
- [ ] Visual feedback ved invalid file type

##### 3. Native Camera (hvis mobile/native)

- [ ] Camera knapp synlig (grønn)
- [ ] Opens native camera
- [ ] Can take photo
- [ ] Photo appears in preview

##### 4. Native Gallery (hvis mobile/native)

- [ ] Gallery knapp synlig (purple)
- [ ] Opens native gallery
- [ ] Can select multiple
- [ ] Selected photos appear in preview

#### File Preview

- [ ] Valgte filer vises i grid
- [ ] Thumbnail for hver fil
- [ ] File name synlig
- [ ] File size synlig
- [ ] Remove button (X) per fil
- [ ] Ripple on remove button

#### Album Selection

- [ ] "Select Album" dropdown
- [ ] Alle album listet
- [ ] "No Album" option
- [ ] "Create New Album" option inline
- [ ] Selected album highlighted
- [ ] Custom styled dropdown (not native)

#### Upload Progress

- [ ] Progress bar per fil
- [ ] Percentage synlig
- [ ] Overall progress
- [ ] Cancel button fungerer
- [ ] Success checkmark ved ferdig
- [ ] Error indicator ved feil

#### Compression Options (hvis implementert)

- [ ] Compression toggle
- [ ] Quality slider
- [ ] Preview file size reduction
- [ ] "Original" vs "Compressed" toggle

#### Buttons

- [ ] "Cancel" button
  - [ ] Ripple effect
  - [ ] Lukker modal
  - [ ] Clears selected files
- [ ] "Upload" button
  - [ ] Ripple effect
  - [ ] Disabled hvis ingen filer
  - [ ] Shows count: "Upload (5)"
  - [ ] Loading state mens uploader
  - [ ] Success toast ved ferdig

#### Success Flow

- [ ] Success toast vises
- [ ] Modal lukkes automatisk
- [ ] Photos vises i album/home umiddelbart
- [ ] Loading state (skeleton) → real photos

#### Error Handling

- [ ] File too large → error message
- [ ] Invalid file type → error message
- [ ] Network error → retry option
- [ ] Upload failed → shows which files failed
- [ ] Error toast med clear melding

---

### Desktop - Light Mode

- [ ] All text readable
- [ ] Dropzone border visible
- [ ] Buttons have good contrast
- [ ] Progress bars visible
- [ ] Glass effect works

---

### Mobile - Upload Modal

#### Layout

- [ ] Modal takes full screen
- [ ] Header with title and close
- [ ] File selection buttons stack vertically
- [ ] Native camera/gallery prominent
- [ ] Drop zone hidden/smaller on mobile
- [ ] Preview grid → 2 columns

#### Native Features

- [ ] Camera button works
- [ ] Gallery button works
- [ ] Can select from both
- [ ] Photos appear immediately
- [ ] Compress on mobile by default

#### Touch Interactions

- [ ] All buttons touch-friendly
- [ ] Easy to remove files
- [ ] Easy to scroll file list
- [ ] Keyboard doesn't cover buttons

---

### i18n Test (Upload)

#### Norsk

- [ ] "Last opp bilder"
- [ ] "Bla gjennom filer"
- [ ] "Dra og slipp bilder her"
- [ ] "Kamera" / "Galleri" (native)
- [ ] "Velg album"
- [ ] "Ingen album"
- [ ] "Last opp (X)"
- [ ] "Laster opp..."
- [ ] Success: "Bilder lastet opp!"
- [ ] Error: "Kunne ikke laste opp"
- [ ] "Filtype støttes ikke"
- [ ] "Filen er for stor"

#### Engelsk

- [ ] "Upload Photos"
- [ ] "Browse Files"
- [ ] "Drag and drop images here"
- [ ] "Camera" / "Gallery"
- [ ] "Select Album"
- [ ] "No Album"
- [ ] "Upload (X)"
- [ ] "Uploading..."
- [ ] Success: "Photos uploaded!"
- [ ] Error: "Could not upload"
- [ ] "File type not supported"
- [ ] "File is too large"

---

### Feil funnet (Upload):

```
[Beskrive feil her]
-
```

---

## 🔍 4. SEARCH PAGE

### Desktop - Dark Mode

#### Visuell Test

- [ ] "Search" tittel øverst
- [ ] Search input prominent
  - [ ] Premium focus animation
  - [ ] Purple glow on focus
  - [ ] Magnifying glass ikon
  - [ ] Clear button (X) når typing
- [ ] Placeholder text synlig

#### Search Input

- [ ] Real-time search (debounced)
- [ ] Searches in:
  - [ ] Photo names
  - [ ] Album names
  - [ ] AI tags (hvis aktivert)
  - [ ] Categories
- [ ] Results update instantly
- [ ] Clear button fjerner søk
- [ ] ESC clears input

#### Filters Section

- [ ] "Filters" knapp/toggle
- [ ] Filter panel expandable
- [ ] Glass-morphism panel

##### Filter Options

- [ ] **Albums Filter:**
  - [ ] All Albums
  - [ ] Specific album dropdown
  - [ ] "No Album" option
- [ ] **Date Range Filter:**
  - [ ] Today
  - [ ] Last Week
  - [ ] Last Month
  - [ ] Last Year
  - [ ] Custom range picker
- [ ] **Category Filter:**
  - [ ] All Categories
  - [ ] People, Nature, Food, etc.
- [ ] **AI Tags Filter** (hvis aktivert):
  - [ ] Popular tags as chips
  - [ ] Click tag to filter
- [ ] **Other Filters:**
  - [ ] Favorites Only toggle
  - [ ] With Faces toggle
  - [ ] AI Analyzed toggle

#### Active Filters Display

- [ ] Shows active filters as chips
- [ ] Each chip has X to remove
- [ ] "Clear All Filters" button
- [ ] Filter count badge on Filters button

#### Results Section

- [ ] Photo grid results
- [ ] Shows count: "X results"
- [ ] Empty state hvis ingen match
  - [ ] "No results found" message
  - [ ] Suggestion to adjust filters
  - [ ] Clear filters button
- [ ] Staggered animation on new results

#### Popular Searches/Tags

- [ ] Shows when search empty
- [ ] Clickable tag chips
- [ ] Based on AI tags frequency
- [ ] Ripple effect on chips

---

### Search Results Interactions

#### Photo Grid

- [ ] Same as album photo grid
- [ ] Click → opens PhotoModal
- [ ] Hover shows overlay
- [ ] Favorite button
- [ ] Ripple effects

#### Sorting

- [ ] Sort dropdown
- [ ] Date (newest/oldest)
- [ ] Name (A-Z/Z-A)
- [ ] Size (largest/smallest)
- [ ] Relevance

---

### Desktop - Light Mode

- [ ] Search input readable
- [ ] Filter panel visible
- [ ] Results grid clear
- [ ] Good text contrast
- [ ] Filter chips visible

---

### Mobile - Search Page

#### Layout

- [ ] Search input full width
- [ ] Filter button in header
- [ ] Filters slide up as bottom sheet
- [ ] Results → 3 column grid
- [ ] Touch-friendly filter toggles

#### Interactions

- [ ] Keyboard shows on focus
- [ ] Can scroll while keyboard open
- [ ] Filter sheet dismissable
- [ ] Touch-friendly clear buttons
- [ ] Easy to tap photos

---

### i18n Test (Search)

#### Norsk

- [ ] "Søk"
- [ ] "Søk i bilder..."
- [ ] "Filtre"
- [ ] "Aktive filtre"
- [ ] "Nullstill filtre"
- [ ] "X resultater" (flertall)
- [ ] "Ingen resultater"
- [ ] "Prøv et annet søk"
- [ ] "Populære tags"
- [ ] Date range options på norsk
- [ ] Category names på norsk

#### Engelsk

- [ ] "Search"
- [ ] "Search photos..."
- [ ] "Filters"
- [ ] "Active filters"
- [ ] "Clear filters"
- [ ] "X results" (plural)
- [ ] "No results"
- [ ] "Try a different search"
- [ ] "Popular tags"
- [ ] Date range options in English
- [ ] Category names in English

---

### Feil funnet (Search):

```
[Beskrive feil her]
-
```

---

## ⚙️ 5. MORE PAGE (Settings)

### Desktop - Dark Mode

#### Visuell Test

- [ ] "More" / "Settings" tittel
- [ ] Grouped settings sections
- [ ] Icons for each section
- [ ] Ripple effect on menu items
- [ ] Glass cards for sections

#### Settings Sections

##### 1. Account Section

- [ ] Profile picture
- [ ] User name
- [ ] Email address
- [ ] "Edit Profile" button
  - [ ] Opens profile modal
  - [ ] Can change name
  - [ ] Can change profile pic
  - [ ] Save button
- [ ] "Change Password" button (hvis email auth)
- [ ] Storage usage display
  - [ ] Progress bar
  - [ ] "X MB of Y GB used"
- [ ] "Sign Out" button
  - [ ] Confirmation modal
  - [ ] Logs out correctly

##### 2. Appearance Section

- [ ] **Theme Toggle**
  - [ ] Dark Mode
  - [ ] Light Mode
  - [ ] Auto (system)
  - [ ] Smooth transition ved bytte
- [ ] Preview av valgt theme

##### 3. Language Section

- [ ] Language selector
  - [ ] Norwegian (NO) 🇳🇴
  - [ ] English (EN) 🇬🇧
- [ ] Changes immediately
- [ ] All text updates

##### 4. Privacy & Security

- [ ] "Vault" section (hvis implementert)
  - [ ] Enable/disable vault
  - [ ] Set password
  - [ ] Biometric toggle
- [ ] "Delete Account" button
  - [ ] Warning modal
  - [ ] Confirmation required
  - [ ] Deletes all data

##### 5. Notifications (hvis implementert)

- [ ] Push notifications toggle
- [ ] Email notifications toggle
- [ ] Upload complete notifications
- [ ] Sharing notifications

##### 6. AI Settings (hvis AI aktivert)

- [ ] Auto-analyze toggle
- [ ] Monthly quota display
- [ ] "Analyze All" button
- [ ] AI features explanation

##### 7. About Section

- [ ] App version number
- [ ] "Terms of Service" link
- [ ] "Privacy Policy" link
- [ ] "Help & Support" link
- [ ] "Report a Bug" button

##### 8. Admin Section (hvis admin)

- [ ] "Admin Dashboard" button
- [ ] User management link
- [ ] System stats link

---

### Modals & Flows

#### Edit Profile Modal

- [ ] Glass-morphism
- [ ] Profile picture upload
  - [ ] Click to upload
  - [ ] Preview
  - [ ] Crop tool (optional)
- [ ] Name input
  - [ ] Premium focus animation
- [ ] Email (read-only)
- [ ] Save button
  - [ ] Loading state
  - [ ] Success toast
  - [ ] Updates everywhere

#### Change Password Modal

- [ ] Current password input
- [ ] New password input
- [ ] Confirm password input
- [ ] Password strength indicator
- [ ] Show/hide toggle per field
- [ ] Validation:
  - [ ] Current password correct
  - [ ] New password requirements met
  - [ ] Passwords match
- [ ] Success toast

#### Delete Account Modal

- [ ] Large warning text
- [ ] "Type DELETE to confirm" input
- [ ] Lists what will be deleted:
  - [ ] All photos
  - [ ] All albums
  - [ ] All data
- [ ] Cancel button
- [ ] Delete button (red, disabled until typed)
- [ ] Final confirmation step

---

### Desktop - Light Mode

- [ ] All sections readable
- [ ] Good contrast
- [ ] Toggle switches visible
- [ ] Links clearly visible
- [ ] Cards have light styling

---

### Mobile - More Page

#### Layout

- [ ] Full screen layout
- [ ] Settings grouped logically
- [ ] Large touch targets
- [ ] Profile section at top
- [ ] Sections collapsible (optional)

#### Interactions

- [ ] Easy to toggle switches
- [ ] Modals fullscreen
- [ ] Can scroll settings
- [ ] Sign out easily accessible

---

### i18n Test (More)

#### Norsk

- [ ] "Mer" / "Innstillinger"
- [ ] "Profil"
- [ ] "Rediger profil"
- [ ] "Endre passord"
- [ ] "Logg ut"
- [ ] "Utseende"
- [ ] "Mørkt modus" / "Lyst modus"
- [ ] "Språk"
- [ ] "Personvern og sikkerhet"
- [ ] "Slett konto"
- [ ] "Om"
- [ ] "Versjon"
- [ ] "Bruksvilkår"
- [ ] "Personvernerklæring"
- [ ] Confirmation dialogs på norsk

#### Engelsk

- [ ] "More" / "Settings"
- [ ] "Profile"
- [ ] "Edit Profile"
- [ ] "Change Password"
- [ ] "Sign Out"
- [ ] "Appearance"
- [ ] "Dark Mode" / "Light Mode"
- [ ] "Language"
- [ ] "Privacy & Security"
- [ ] "Delete Account"
- [ ] "About"
- [ ] "Version"
- [ ] "Terms of Service"
- [ ] "Privacy Policy"
- [ ] Confirmation dialogs in English

---

### Feil funnet (More):

```
[Beskrive feil her]
-
```

---

## 🎨 6. PHOTO EDITOR

### Opening Editor

- [ ] Can open from PhotoModal "Edit" button
- [ ] Can open from album edit mode
- [ ] Loads photo correctly
- [ ] Fullscreen editor

### Desktop - Dark Mode

#### Editor UI

- [ ] Photo displays centered
- [ ] Tools sidebar on left
- [ ] Canvas responsive
- [ ] Top bar with:
  - [ ] "Back" button
  - [ ] Photo name
  - [ ] "Save" button
  - [ ] "Reset" button

#### Tab 1: Crop & Rotate

- [ ] **Crop Tool:**
  - [ ] Aspect ratio presets:
    - [ ] Free (no constraint)
    - [ ] 1:1 (square)
    - [ ] 4:3
    - [ ] 16:9
    - [ ] 3:4 (portrait)
  - [ ] Draggable crop box
  - [ ] Maintains aspect ratio
  - [ ] Preview updates in real-time
- [ ] **Rotate Tool:**
  - [ ] Rotate 90° button
  - [ ] Preview updates
  - [ ] Can rotate multiple times

#### Tab 2: Filters & Adjustments

- [ ] **Preset Filters:**
  - [ ] None (original)
  - [ ] Grayscale
  - [ ] Sepia
  - [ ] Vintage
  - [ ] Cold
  - [ ] Warm
  - [ ] High Contrast
  - [ ] Fade
  - [ ] Instant preview on click
  - [ ] Ripple effect on filter chips
- [ ] **Manual Adjustments:**
  - [ ] Brightness slider (-100 to +100)
  - [ ] Contrast slider (0.5x to 2.0x)
  - [ ] Saturation slider (0.0x to 2.0x)
  - [ ] Real-time preview
  - [ ] Reset button per slider

#### Tab 3: Text Overlay

- [ ] **Add Text Button:**
  - [ ] Creates new text layer
  - [ ] Multiple layers supported
- [ ] **Text Input:**
  - [ ] Multi-line textarea
  - [ ] Premium focus animation
- [ ] **Font Options:**
  - [ ] Font family dropdown (8 fonts)
  - [ ] Font size slider (12-120px)
  - [ ] Bold toggle
  - [ ] Italic toggle
- [ ] **Color Options:**
  - [ ] Color picker
  - [ ] Hex input
  - [ ] Recent colors
- [ ] **Alignment:**
  - [ ] Left
  - [ ] Center
  - [ ] Right
- [ ] **Position:**
  - [ ] X position slider
  - [ ] Y position slider
  - [ ] Draggable on canvas (optional)
- [ ] **Effects:**
  - [ ] Text shadow toggle
  - [ ] Shadow blur slider
  - [ ] Stroke/outline toggle
  - [ ] Stroke width slider
  - [ ] Stroke color picker
- [ ] **Layer Management:**
  - [ ] Delete text layer button
  - [ ] Multiple layers visible
  - [ ] Each layer editable

#### Save Flow

- [ ] "Save" button click
- [ ] Loading spinner
- [ ] Uploads to Firebase Storage
- [ ] Creates Firestore document
- [ ] Links to original photo (`editedFrom` field)
- [ ] Non-destructive (original preserved)
- [ ] Success toast
- [ ] Editor closes
- [ ] Photo list refreshes
- [ ] Edited photo appears in album

#### Toolbar Buttons

- [ ] All buttons have ripple effect
- [ ] Tooltips on hover (optional)
- [ ] Disabled states clear
- [ ] Loading states for async actions

---

### Desktop - Light Mode

- [ ] All tools visible
- [ ] Good contrast on controls
- [ ] Sliders clearly visible
- [ ] Text readable
- [ ] Color picker works

---

### Mobile - Photo Editor

#### Layout

- [ ] Tools move to bottom tabs
- [ ] Canvas takes most of screen
- [ ] Touch-friendly controls
- [ ] Sliders easy to adjust
- [ ] Text input works with keyboard

#### Interactions

- [ ] Pinch to zoom canvas (optional)
- [ ] Two-finger rotate (optional)
- [ ] Touch to position text
- [ ] Easy to switch between tools

---

### i18n Test (Photo Editor)

#### Norsk

- [ ] "Rediger bilde"
- [ ] "Beskjær og roter"
- [ ] "Filtre og justeringer"
- [ ] "Tekstoverlegg"
- [ ] "Lagre"
- [ ] "Tilbakestill"
- [ ] "Tilbake"
- [ ] All tool labels på norsk
- [ ] Error messages på norsk
- [ ] Success toast på norsk

#### Engelsk

- [ ] "Edit Photo"
- [ ] "Crop & Rotate"
- [ ] "Filters & Adjustments"
- [ ] "Text Overlay"
- [ ] "Save"
- [ ] "Reset"
- [ ] "Back"
- [ ] All tool labels in English
- [ ] Error messages in English
- [ ] Success toast in English

---

### Feil funnet (Photo Editor):

```
[Beskrive feil her]
-
```

---

## 🖼️ 7. COLLAGE BUILDER (hvis implementert)

### Opening Collage Builder

- [ ] Opens from "Create Collage" button
- [ ] Can select photos first
- [ ] Or select photos after

### Desktop - Dark Mode

#### Step 1: Select Layout

- [ ] Layout options displayed:
  - [ ] 2 photos (horizontal)
  - [ ] 2 photos (vertical)
  - [ ] 3 photos (vertical)
  - [ ] 3 photos (mixed)
  - [ ] 4 photos (grid)
  - [ ] Custom layouts
- [ ] Layout preview for each
- [ ] Ripple effect on selection
- [ ] Selected layout highlighted

#### Step 2: Add Photos

- [ ] "Change Photos" button
- [ ] Shows photo slots
- [ ] Click slot to add/change photo
- [ ] Opens photo picker modal
- [ ] Can select from albums
- [ ] Preview in slot
- [ ] Can remove photo

#### Step 3: Customize

- [ ] **Spacing slider:**
  - [ ] Adjusts gap between photos
  - [ ] Real-time preview
- [ ] **Border toggle:**
  - [ ] Enable/disable borders
  - [ ] Border color picker
  - [ ] Border width slider
- [ ] **Background:**
  - [ ] Color picker
  - [ ] Gradient options
  - [ ] Pattern options (optional)
- [ ] Preview updates in real-time

#### Step 4: Add Text (optional)

- [ ] Title input
- [ ] Subtitle input
- [ ] Font options
- [ ] Color options
- [ ] Position options

#### Save Collage

- [ ] "Save Collage" button
- [ ] Renders final image
- [ ] Uploads to Firebase
- [ ] Saves as new photo
- [ ] Success toast
- [ ] Closes builder
- [ ] Collage appears in albums

---

### Desktop - Light Mode

- [ ] All controls visible
- [ ] Good contrast
- [ ] Layout previews clear
- [ ] Color pickers work

---

### Mobile - Collage Builder

#### Layout

- [ ] Steps at top
- [ ] Preview prominent
- [ ] Tools at bottom
- [ ] Easy to select layouts
- [ ] Touch-friendly controls

---

### i18n Test (Collage Builder)

#### Norsk

- [ ] "Lag collage"
- [ ] "Velg layout"
- [ ] "Legg til bilder"
- [ ] "Tilpass"
- [ ] "Lagre collage"
- [ ] All layout names på norsk
- [ ] All tool labels på norsk

#### Engelsk

- [ ] "Create Collage"
- [ ] "Select Layout"
- [ ] "Add Photos"
- [ ] "Customize"
- [ ] "Save Collage"
- [ ] All layout names in English
- [ ] All tool labels in English

---

### Feil funnet (Collage Builder):

```
[Beskrive feil her]
-
```

---

## 📅 8. TIMELINE (hvis implementert)

### Opening Timeline

- [ ] Opens from navigation/menu
- [ ] Shows all photos chronologically

### Desktop - Dark Mode

#### Timeline View

- [ ] Photos grouped by date
- [ ] Date headers:
  - [ ] "Today"
  - [ ] "Yesterday"
  - [ ] "Last Week"
  - [ ] Month/Year headers
- [ ] Smooth scroll
- [ ] Infinite scroll / pagination

#### Date Navigation

- [ ] Month/year picker at top
- [ ] Jump to date button
- [ ] Scroll to top button
- [ ] Navigation arrows (prev/next month)

#### On This Day Widget

- [ ] Shows photos from same date in past years
- [ ] "X years ago" label
- [ ] Click to view full size
- [ ] Carousel if multiple

#### Photo Interactions

- [ ] Click photo → PhotoModal
- [ ] Hover shows metadata
- [ ] Ripple effect
- [ ] Same interactions as album grid

---

### Desktop - Light Mode

- [ ] Date headers visible
- [ ] Good contrast
- [ ] Photos clear
- [ ] Navigation works

---

### Mobile - Timeline

#### Layout

- [ ] Date headers sticky
- [ ] Photos → 3 column grid
- [ ] Easy to scroll
- [ ] Date picker touch-friendly

---

### i18n Test (Timeline)

#### Norsk

- [ ] "Tidslinje"
- [ ] "I dag"
- [ ] "I går"
- [ ] "Siste uke"
- [ ] Month names på norsk
- [ ] "X år siden"
- [ ] "Samme dag"

#### Engelsk

- [ ] "Timeline"
- [ ] "Today"
- [ ] "Yesterday"
- [ ] "Last Week"
- [ ] Month names in English
- [ ] "X years ago"
- [ ] "On This Day"

---

### Feil funnet (Timeline):

```
[Beskrive feil her]
-
```

---

## 🌐 9. CROSS-CUTTING TESTS

### Performance

#### Desktop

- [ ] App loads < 3 seconds
- [ ] Navigation transitions < 300ms
- [ ] Smooth scrolling (60fps)
- [ ] No janky animations
- [ ] Large albums (100+ photos) perform well
- [ ] No memory leaks (open/close modals 10x)

#### Mobile

- [ ] App loads < 5 seconds (3G)
- [ ] Touch responses < 100ms
- [ ] Scrolling smooth
- [ ] No lag on low-end devices
- [ ] Battery drain acceptable

### Accessibility

#### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter/Space activates buttons
- [ ] ESC closes modals
- [ ] Arrow keys work where appropriate

#### Screen Reader (optional)

- [ ] All images have alt text
- [ ] Buttons have aria-labels
- [ ] Form inputs have labels
- [ ] Modals announce correctly

#### Reduced Motion

- [ ] System setting "Reduce motion" respected
- [ ] Animations disabled/simplified
- [ ] App still usable

#### High Contrast Mode

- [ ] App readable in high contrast
- [ ] Borders visible
- [ ] Interactive elements clear

### Browser Compatibility

#### Chrome/Edge (Chromium)

- [ ] All features work
- [ ] Backdrop-filter works
- [ ] Animations smooth

#### Firefox

- [ ] All features work
- [ ] Backdrop-filter works (or fallback)
- [ ] Animations smooth

#### Safari (Desktop)

- [ ] All features work
- [ ] Backdrop-filter works
- [ ] No webkit-specific bugs

#### Mobile Browsers

- [ ] iOS Safari
  - [ ] All features work
  - [ ] Touch gestures work
  - [ ] No 300ms tap delay
- [ ] Android Chrome
  - [ ] All features work
  - [ ] Touch gestures work
  - [ ] Back button works

### Security

#### Authentication

- [ ] Can't access app without login
- [ ] Session expires correctly
- [ ] Logout works completely
- [ ] Password requirements enforced

#### Data Access

- [ ] Can only see own photos
- [ ] Can't access other users' data
- [ ] Firebase rules enforced
- [ ] No data leaks in console

#### File Upload

- [ ] File type validation works
- [ ] File size limits enforced
- [ ] Malicious files rejected
- [ ] Proper error messages

---

## 📊 10. DATA CONSISTENCY

### Across Views

- [ ] Photo count matches everywhere
- [ ] Album count correct
- [ ] Favorites sync across views
- [ ] Changes reflect immediately

### After Operations

- [ ] Upload → photos appear everywhere
- [ ] Delete → photos removed everywhere
- [ ] Edit → changes show everywhere
- [ ] Move → photo moves correctly

### Offline/Online

- [ ] Graceful degradation when offline
- [ ] Queue actions when offline (optional)
- [ ] Sync when back online
- [ ] Clear error messages

---

## 🎉 11. OVERALL USER EXPERIENCE

### First Impressions

- [ ] App feels premium
- [ ] Smooth and polished
- [ ] Intuitive to use
- [ ] Visually appealing

### Micro-interactions

- [ ] Ripple effects satisfying
- [ ] Animations smooth
- [ ] Feedback clear
- [ ] Loading states informative

### Error Handling

- [ ] All errors have clear messages
- [ ] No cryptic technical errors
- [ ] Recovery options provided
- [ ] Errors don't break app

### Empty States

- [ ] All empty states have:
  - [ ] Clear message
  - [ ] Illustration/icon
  - [ ] Call-to-action
  - [ ] Helpful guidance

---

## 📝 12. FINAL CHECKLIST

### Before Launch

- [ ] All critical bugs fixed
- [ ] All features working
- [ ] Both languages complete
- [ ] Both themes working
- [ ] Mobile optimized
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Privacy policy in place
- [ ] Terms of service in place
- [ ] Help/support available

### Testing Summary

- [ ] Home page: ✅
- [ ] Albums page: ✅
- [ ] Upload flow: ✅
- [ ] Search page: ✅
- [ ] More page: ✅
- [ ] Photo Editor: ✅
- [ ] Collage Builder: ✅
- [ ] Timeline: ✅
- [ ] Cross-cutting: ✅
- [ ] UX polish: ✅

---

## 🐛 ALLE FEIL FUNNET

### Kritiske (må fikses før launch):

```
1.
2.
3.
```

### Viktige (bør fikses før launch):

```
1.
2.
3.
```

### Nice-to-have (kan fikses etter launch):

```
1.
2.
3.
```

---

## 📈 TEST RESULTAT SAMMENDRAG

**Totalt antall tester:** ~500+
**Gjennomført:** **_
**Bestått:** _**
**Feilet:** **_
**Hoppet over:** _**

**Overall vurdering:** \_\_\_ / 10

**Klar for launch?** ☐ Ja ☐ Nei ☐ Nesten

---

**Testet av:** Roger
**Dato:** ******\_******
**Versjon:** MVP Pre-Launch
**Byggnummer:** ******\_******
