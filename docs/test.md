PIXTR – Testliste (manuell gjennomgang)

1. Navigasjon / UI

1) Scroll-to-top

Hva du gjør:

Åpne hvilken som helst side

Naviger til en annen side via menyen
Forventet resultat:

Ny side åpner alltid på toppen
Test på:

Netlify

Lokal dev
Status: ok

2. Zoom / Skalering ved first-load

Hva du gjør:

Åpne pixtr.cloud i inkognito (Chrome, Edge, mobil)
Forventet resultat:

Hele siden passer i viewport uten auto-zoom
Test på:

Netlify
Status: ok

2. Collage Builder

3) Bildevelger-modal (Image Picker)

Hva du gjør:

Åpne Collage Builder

Start ny collage

Trykk “Add photos”
Forventet resultat:

Bildevelgervinduet er stort nok (nesten fullskjerm)
Test på:

Netlify

Lokal dev
Status: ok

4. Collage thumbnails vises på AlbumsPage

Hva du gjør:

Gå til Albums → Collages

Se om collagenes thumbnails vises
Forventet resultat:

Alle collager viser bilde, ikke tom placeholder
Test på:

Netlify

Lokal dev
Status: ok

5. Edit existing collage fungerer

Hva du gjør:

Klikk på en collage

Trykk “Edit”

Endre noe og lagre
Forventet resultat:

Collagen oppdateres, ingen ny collage lages
Test på:

Netlify

Lokal dev
Status: ved første gangs lagring så hopper den tilbake til album siden og om jeg går inn og redigerer et bilde og lagrer, så hopper den ikke ut igjen, men når jeg trykker cancel eller opp daterer skjermen så ser jeg at det har blitt skapt et nyt album med den endringen.

3. SearchPage v5.2

6) Flytt bilder mellom album

Hva du gjør:

Åpne Search → Velg bilder → Flytt
Forventet resultat:

Bildene flyttes i både UI og Firestore
Test på:

Netlify

Lokal dev
Status: Er ikke mulig å flytte bilder fra search page, kun fra album siden. der fungerer funksjonen

7. Delete-knapper finnes (eller ikke)

Hva du gjør:

Se etter delete-knapp i SearchPage
Forventet resultat:

Skal IKKE være aktiv funksjon enda (bare planlagt)
Test på:

Netlify
Status: delete knapp finnes på search page på alle bilder og den fungerer som den skal. bilde blir slettet og forsvinner med en gang

4. AI-funksjoner (toast-meldinger)

8) Klikk på AI-knapper

Hva du gjør:

Klikk på AI, Faces, Category eller Auto-tagging-opsjonene
Forventet resultat:

Toast: “Kommer i PIXTR Pro”
Test på:

Netlify
Status: Dette må ses nærmere på. vi tar en egen seksjon på AI

5. Cache / Laster feil innhold

9) Edge / Inkognito viser nyeste versjon

Hva du gjør:

Åpne i Chrome Incognito

Åpne i Edge
Forventet resultat:

Samme visning som i vanlig Chrome

Ingen hvite sider / feil språk
Status: ja det vises likt alle steder, men sliter fortsatt med å ikke få logget inn hver gang. stoppes av at DNS ikke er klar over alt ennå muligens

6. Globalt i appen

10) Logos / Branding

Hva du gjør:

Sjekk logoer i header, meny, splash
Forventet resultat:

PIXTR-logoer er consistent
Status: Pixtr logoen har jeg kun sett på login page

11. Album → Click → Visning

Hva du gjør:

Åpne et vanlig album

Se alle bilder lastes inn riktig
Forventet resultat:

Ingen tomme bilder

Mobil og desktop fungerer
Status: ja fungerer, bortsett fra Mp4 filer. så de må vi jobbe med

12. Ny collage → lagres i Firestore

Hva du gjør:

Lag en helt ny collage
Forventet resultat:

Den dukker opp i AlbumsPage → Collages
Test på:

Netlify

Lokal dev
Status: ja ny collage lagres og dukker opp med engang og vises riktig, men vi må se på oppsettet av album siden spesielt på telefonen. der må de vises på en annen måte eller ha et søk/filtreringsmulighet.
