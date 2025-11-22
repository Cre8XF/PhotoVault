1. Overordnede prinsipper for hele Pixtr “worlds”-arkitekturen

Disse skal Claude forholde seg til i ALLE faser.

1.1. Worlds – ikke modaler

Hver “tung” funksjon (Photo, Slideshow, Collage, Editor, AI) skal være en egen route/page, ikke en modal.

Worlds:

/photo/:photoId

/slideshow/:contextId (album, søk, favoritter osv.)

/tools/collage/...

/editor/:photoId

/tools/ai/...

Alle worlds:

Setter isWorldView = true on mount

Setter isWorldView = false on unmount

Har sin egen “atmosfære” (layout, toolbar, bakgrunn, kontroller).

1.2. Global state – enkel og stabil

I store.js:

Navigasjon/session:

currentPhotoId: string | null

currentAlbumId: string | null

slideshowActive: boolean

collageEditId: string | null

isWorldView: boolean

Senere (planlagt):

photoContext: 'album' | 'search' | 'favorites' | 'ai' | null

photoOrder: string[] (rekkefølge for swiping)

photoIndex: number (posisjon i rekkefølgen)

Prinsipp:
World-pages skal hente mest mulig fra URL + global state, ikke fra tilfeldige props.

1.3. URL som sannhet

PhotoPage: URL bærer photoId (/photo/abc123)

SlideshowPage: URL bærer context (/slideshow?source=album&albumId=xyz)

EditorPage: /editor/:photoId

CollageEdit: /tools/collage/edit/:id

State (zoom, filter, visning, sortering) kan senere mappes til query params, f.eks.:
/photo/abc123?zoom=fit&panel=info

1.4. Lazy loading av worlds

Alle world-pages skal lastes med React.lazy + Suspense slik som i Phase 1.

1.5. PageWrapper-standard

Alle worlds bruker PageWrapper:

Tittel (og eventuelt subtitle)

Loading/error/empty-håndtering

Ansvar for grunnlayout

World-specific UI ligger inni, ikke rundt

1.6. Bottom-nav-regel

showBottomNav = !isWorldView

Ingen andre steder skal prøve å styre bottom-nav direkte.
(Modaler og annet overlapp forsvinner etter hvert.)

2. Utvidet plan – Phase 2A: PhotoPage

Mål:
Bygge en fullverdig Photo-verden som erstatter PhotoModal-funksjonalitet (ikke nødvendigvis fjerner filen ennå), med:

Fullscreen visning

Auto-hide UI

Swipe venstre/høyre

Kontekstbevisst rekkefølge (album/søk/favoritter)

Clean design (Google Photos-inspirert)

Forberedt til senere Editor/AI

2.1. Data- og stateflyt

Kilder for foto-rekkefølge:

Brukeren kan komme til PhotoPage fra:

AlbumPage (album-grid)

SearchPage (filter/søkresultat)

FavoritesPage

Evt. AI/andre spesiallister senere

Plan:

Når brukeren klikker et bilde i et grid (f.eks. album):

Naviger til /photo/:photoId

Sett global state:

currentPhotoId = photoId

photoContext = 'album'

photoOrder = [liste over photoIds i det viste gridet]

photoIndex = index til photoId i denne listen

currentAlbumId = albumId (hvis relevant)

PhotoPage bruker:

useParams() → photoId

useStore() → photoOrder, photoIndex, photoContext, currentAlbumId

photoOrder + photoIndex brukes til swipe (next/prev) og til prefetch.

Hook-struktur:

usePhotoById(photoId)

Fetcher/metafor fra Firestore

Håndterer loading/error

usePhotoContext()

Pakker ut photoContext, photoOrder, photoIndex, setPhotoIndex, setCurrentPhotoId

usePrefetchAdjacentPhotos(photoOrder, photoIndex)

Prefetcher photoOrder[index-1] og photoOrder[index+1] i bakgrunnen

2.2. Komponenter og filer

Nye/oppdaterte filer:

src/pages/PhotoPage.jsx

Full implementasjon

src/hooks/usePhotoContext.js

src/hooks/usePhotoById.js

src/hooks/usePrefetchAdjacentPhotos.js (enkel versjon først)

Oppdaterte klikklister:

AlbumPage.jsx

SearchPage.jsx

FavoritesPage.jsx
slik at de navigerer til /photo/:id og setter global state.

PhotoPage layout:

Root:

<div className="fixed inset-0 bg-black z-[9999] flex flex-col">

Top-bar:

fixed top-0 inset-x-0 h-14 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-4 text-white

Innhold:

Venstre: back/close

Midt: liten label (dato / albumnavn)

Høyre: favorite, info, more (ellipsis)

Middle (canvas):

flex-1 flex items-center justify-center

Bilde:

<img
  src={url}
  className="max-w-full max-h-[100vh] object-contain transition-opacity duration-300"
  onClick={toggleUi}
/>

Bottom overlay (valgfritt i 2A):

F.eks. minitekst “X / Y”, “Rediger”-knapp, etc.

2.3. UI-state (auto-hide + visning)

PhotoPage har:

const [uiVisible, setUiVisible] = useState(true);

const uiTimerRef = useRef(null);

Funksjoner:

showUi() → setUiVisible(true) + restart timer (3 sek)

hideUi() → setUiVisible(false)

toggleUi() → hvis skjult → showUi(), hvis synlig → hideUi()

Eventer som trigger showUi():

Tap på bildet

Swipe

Tastatur-benyttelse (pil venstre/høyre)

Trykk på top-bar knapper

All UI (top-bar, evt. bottom overlay) styres med:

uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'

2.4. Navigasjon (next/prev) + swipes

State: photoIndex

handleNext():

Hvis photoIndex < photoOrder.length - 1:

setPhotoIndex(photoIndex + 1)

Oppdater currentPhotoId

navigate(/photo/${nextId}, { replace: true })

handlePrev() tilsvarende.

Swipe:

Bruk en simpel swipe-deteksjon:

onTouchStart, onTouchMove, onTouchEnd

Registrer deltaX, threshold f.eks. 50px

0 → prev, <0 → next

Tastatur:

useEffect for keydown:

ArrowLeft → prev

ArrowRight → next

Escape → back

2.5. Tilbake-knapp og integrasjon med resten

Back-knappen på PhotoPage:

Hvis photoContext === 'album' → navigate tilbake til album

Hvis photoContext === 'search' → navigate(-1) eller dedikert route

Evt. bruk location.state.from som fallback

På kort sikt kan vi bruke navigate(-1) for enkelhet, men planen bør være:

Lag en from-state når du navigerer inn (f.eks. navigate('/photo/123', { state: { from: location } }))

2.6. Testing for Phase 2A (checklist)

Etter at Claude har levert 2A:

Fra AlbumPage:

Klikk et bilde i midten av listen → PhotoPage åpnes

Bottom-nav skjules

Swipe:

Swipe venstre → neste bilde

Swipe høyre → forrige

Knapp for neste/forrige (evt. piltaster på tastatur) fungerer

Auto-hide:

Vent 3 sek uten å berøre → topp-UI forsvinner

Trykk på bildet → UI kommer tilbake

Back:

Trykk back-knapp i topp-bar → tilbake til album

Telefonens back-knapp → også tilbake til album

Edge-cases:

Første bilde → swipe venstre skal ikke gi feil

Siste bilde → swipe høyre skal ikke gi feil

Dark/light:

I begge modes skal bakgrunn være mørk og bildet i fokus

Ingen bunneny eller annen app-UI som “skinner gjennom”

3. Utvidet plan – Phase 2B: SlideshowPage

Mål:
Flytte slideshow bort fra modal og inn i en world-page, med ren logikk og ellipsen arkitektur lik PhotoPage.

3.1. Dataflyt

SlideshowPage trenger:

Kilde for bilder:

Album

Søk

Favoritter

Evt. “selected photos” senere

Den kan bruke samme photoOrder og photoContext som PhotoPage, eller et eget slideshowOrder.

Plan (enkel og robust):

Når brukeren starter slideshow:

Fra AlbumPage:

photoContext = 'album'

slideshowOrder = albumPhotoIds

currentAlbumId = albumId

Fra Search:

photoContext = 'search'

slideshowOrder = searchResultPhotoIds

Naviger til /slideshow?source=album&albumId=xyz

3.2. SlideshowPage layout

Fullscreen, ingen bottom-nav:

<div className="fixed inset-0 bg-black z-[9999] flex flex-col">

Midten:

Samme image-canvas som PhotoPage (gjenbruk logikk om mulig).

Bottom controls:

Flytende pill: Play/Pause, Prev, Next, Exit, Interval

Top:

Enkel liten top-bar (X eller “Tilbake”)

3.3. State

slideshowPlaying: boolean (lokalt eller i store)

slideshowIndex: number (kan gjenbruke photoIndex)

Auto-advance via setInterval eller setTimeout i useEffect:

Hvis slideshowPlaying === true → hopp til neste bilde etter X sek

Rydd opp interval i cleanup

3.4. Testing for Phase 2B

Start slideshow fra album:

Korrekt rekkefølge

Auto-play

Pause fungerer uten å lukke slideshow

Exit-knapp:

Tilbake til album/søk

Ingen bottom-nav i hele slideshow-flyten

Ingen overlapping med PhotoPage UX

4. Kort om videre faser (3–7) i lys av den utvidede planen

Bare for å sikre helhetlig tenking:

Fase 3A – Tools + Collage Templates

Bruk samme world-prinsipp

ToolsPage og CollageTemplatesPage blir “inn-gangene”

Fase 3B – CollageBuilder

Egne state hooks

Laster bilder og templates isolert

Lagrer collager med version-felt

Migration-funksjon for eldre collages

Fase 4 – Editor

EditorPage bygger videre på PhotoPage, men:

Egen world

Eget UI

Egne moduser (Crop, Color, Filters, Text, Markup)

Fase 5 – AI

Ai-verktøy per world (Editor, Tools, ev. egen AI-side)

Tenke kost og latency helt fra start

Fase 6 – Cleanup

Når PhotoPage er i drift:

Fjerne PhotoModal + gamle slideshowmodals

Når CollageBuilderPage er i drift:

Fjerne gammel CollageModal

Osv.

Fase 7 – Polish

Felles “floating pill”-komponent

Felles “TopToolbar”-komponent

Ensartet dark/light design

Mikroanimasjoner
