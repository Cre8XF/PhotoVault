Her er en komplett og ryddig plan for å få PIXTR-brandingen inn i PhotoVault-prosjektet, og fikse de siste småtingene før første release.

Jeg deler det opp i 3 faser, slik at du alltid vet hva som er neste steg.

✅ FASE 1 — Få hele brand-systemet inn i prosjektet riktig

Du er allerede 90 % ferdig. Nå gjør vi det helt korrekt.

✔ 1. Brand-mappen skal ligge her:
public/brand/PIXTR/

✔ 2. Du har allerede mapper:

Primary Logo/

Secondary Logo/

Icons/

App Icons/

Brand Guide/

Perfekt.

✔ 3. Neste: Opprette en enkel “branding.js” for å bruke logoene i React

Denne gjør det superenkelt å hente alle logoene i koden:

Opprett fil:

src/config/branding.js

Innhold:

export const PIXTR = {
primary: {
color: {
light: "/brand/PIXTR/Primary Logo/pixtr_primary_color_light.png",
dark: "/brand/PIXTR/Primary Logo/pixtr_primary_color_dark.png",
transparent: "/brand/PIXTR/Primary Logo/pixtr_primary_color_transparent.png",
darkTransparent: "/brand/PIXTR/Primary Logo/pixtr_primary_color_dark_transparent.png",
}
},
icon: {
color: {
light: "/brand/PIXTR/Icons/pixtr_primary_icon_color_light.png",
dark: "/brand/PIXTR/Icons/pixtr_primary_icon_color_dark.png",
transparent: "/brand/PIXTR/Icons/pixtr_primary_icon_color_transparent.png",
},
mono: {
white: "/brand/PIXTR/Icons/pixtr_primary_icon_mono_white.png",
black: "/brand/PIXTR/Icons/pixtr_primary_icon_mono_black.png",
blue: "/brand/PIXTR/Icons/pixtr_primary_icon_mono_blue.png"
}
},
cloud: {
color: {
light: "/brand/PIXTR/Secondary Logo/pixtr_secondary_cloud_color_light.png",
dark: "/brand/PIXTR/Secondary Logo/pixtr_secondary_cloud_color_dark.png",
transparent: "/brand/PIXTR/Secondary Logo/pixtr_secondary_cloud_color_transparent.png"
},
icon: {
light: "/brand/PIXTR/Secondary Logo/pixtr_secondary_cloud_icon_light.png",
dark: "/brand/PIXTR/Secondary Logo/pixtr_secondary_cloud_icon_dark.png",
}
},
appIcons: {
androidRound: "/brand/PIXTR/App Icons/pixtr_appicon_android_round.png",
iosSquare: "/brand/PIXTR/App Icons/pixtr_appicon_ios_square.png",
light: "/brand/PIXTR/App Icons/pixtr_appicon_1024_light.png",
dark: "/brand/PIXTR/App Icons/pixtr_appicon_1024_dark.png"
}
};

Deretter:
Du kan hente logoer slik:

<img src={PIXTR.primary.color.light} alt="PIXTR" />

Dette gir deg full kontroll & null feil i path.

✅ FASE 2 — Fikse småting i prosjektet før lansering

Basert på alt vi har jobbet med tidligere, er dette mest sannsynlig det du trenger:

1. Splash-screen må oppdatere til ny PIXTR-logo

dark-mode versjon → Android

light-mode versjon → iOS

2. LoginPage-logo byttes fra PhotoVault-logo til PIXTR-logo
3. favicon & manifest oppdateres

Jeg kan lage:

16px, 32px, 64px, 128px, 256px

manifest.icon-set

safari pinned icon

Windows tile icon

Jeg kan generere alle filene hvis du vil.

4. App navnet endres fra PhotoVault til PIXTR i package.json + manifest

Eksempel:

public/manifest.json:

{
"short_name": "PIXTR",
"name": "PIXTR Photo Manager",
"icons": [
{
"src": "/brand/PIXTR/App Icons/pixtr_appicon_1024_light.png",
"sizes": "1024x1024",
"type": "image/png"
}
]
}

5. Admin Dashboard → oppdatere logo i header
6. HomePage → bytte til PIXTR eller ikke bruke logo i det hele tatt

Opp til deg.

7. Oppdatere AI-funksjoner (hvis disse viser brand)

– “Powered by PIXTR AI”

8. Delelinks / QR → oppdatere logo i watermark

Mono-white-ikon passer perfekt her.

✅ FASE 3 — Kvalitetssjekk før første release

Når branding er på plass og småtingene er fikset, tar vi en siste gjennomgang:

✔ Normale brukertester:

Opprett konto

Last opp bilder

Slett album

Flytt bilder

Favoritter

AI-funksjoner (kommer i Pro senere)

✔ PWA-test:

Legg til på hjemskjerm

Åpne offline

Splashscreen fungerer

Ikon vises riktig

✔ Mobiltest:

Android

iPhone i Safari

✔ Desktoptest:

Chrome

Edge

✔ Deploy via Netlify:

Sjekke cache

Sjekke CORS

Sjekke Firebase-permission

Når dette fungerer → du er klar for Play Store.
