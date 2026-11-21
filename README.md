# Discord Server Landing Page (discord-webp)

Eine moderne, animierte und hochgradig anpassbare Landing-Page für deinen Discord-Server.

_(🇬🇧 English version below)_

[**🔴 Live Demo ansehen**](https://blutmonsterr.de/github/demo/discord-webp/)

## ✨ Features

*   **Live-Status:** Zeigt die Anzahl der aktuell eingeloggten Mitglieder (über Discord Widget API).
*   **Mitgliederliste:** Zeigt die Avatare einiger Online-Mitglieder an.
*   **Saisonale Effekte:** Automatische Partikel-Hintergründe je nach Jahreszeit und Feiertagen:
    *   🌸 Frühling (Kirschblüten)
    *   ☀️ Sommer (Glühwürmchen)
    *   🍂 Herbst (Blätter)
    *   ❄️ Winter (Schnee)
    *   🐰 Ostern (Hasen & Eier)
    *   🎃 Halloween (Fledermäuse, Geister, Kürbisse, Spinnen)
    *   🎆 Silvester (Feuerwerk/Funken)
*   **Modernes Design:** "Glassmorphism"-Look mit 3D-Kipp-Effekt (Tilt) der Karte.
*   **Partner-Sektion:** Zeige deine Partner-Server in einem eigenen, ausklappbaren Bereich an. Die Daten (Name, Icon, Link) werden automatisch über die Server-ID geladen.
*   **Mehrsprachig:** Deutsch (`de`) und Englisch (`en`) integriert.
*   **Anpassbar:** Einfache Konfiguration über `config.js`.

## 🚀 Installation & Einrichtung

1.  **Discord Widget aktivieren:**
    *   Gehe in deine Discord-Server-Einstellungen -> **Widget**.
    *   Setze den Haken bei **"Server-Widget aktivieren"**.
    *   Kopiere die **Server-ID**.

2.  **Dateien herunterladen:**
    *   Lade dieses Repository herunter.

3.  **Konfiguration (`config.js`):**
    *   Öffne die Datei `config.js` mit einem Texteditor.
    *   Füge deine **Server-ID** bei `SERVER_ID` ein.
    *   (Optional) Passe Sprache, Hintergrundbild und Social-Media-Links an.

4.  **Hochladen:**
    *   Lade die Dateien auf deinen Webspace hoch (z.B. GitHub Pages, Netlify, Apache/Nginx Webserver).

## ⚙️ Konfiguration

Die Datei `config.js` ist die Steuerzentrale:

```javascript
const CONFIG = {
    SERVER_ID: 'DEINE_ID_HIER', // Wichtig!
    MAX_MEMBERS: 5,             // Maximale Anzahl der angezeigten Mitglieder-Avatare
    LANGUAGE: 'de',             // 'de' oder 'en'
    BACKGROUND_IMAGE: '',       // URL zum Bild oder leer lassen (nutzt Server-Icon)
    SERVER_ICON: '',            // URL zum Icon oder leer lassen (nutzt Discord-Icon)
    
    SOCIAL_LINKS: [
        { icon: 'fab fa-github', url: 'https://github.com/dein-name', name: 'GitHub' }
    ],

    PARTNERS: {
        ENABLED: true,
        LIST: [
            { id: 'PARTNER_SERVER_ID_HIER' },
        ]
    },

    // ... Animationen
}
```

### Partikel-Effekte (Jahreszeiten)

Unter `ANIMATION.PARTICLES.TYPE` legst du fest, wie der Partikel-Effekt gewählt wird:

*   `'timezone'` (oder `'auto'`): Ermittelt Datum, bewegliches Ostern und Jahreszeit automatisch anhand von `ANIMATION.PARTICLES.TIMEZONE` (`'auto'` für die Browser-Zeitzone des Besuchers oder z. B. `'Europe/Berlin'` / `'Australia/Sydney'` inkl. Nord-/Südhalbkugel).
*   `'dates'`: Nutzt ausschließlich die eigenen Datumsbereiche aus `ANIMATION.PARTICLES.DATES`.
*   `'winter'`, `'spring'`, `'summer'`, `'autumn'`, `'halloween'`, `'fireworks'`, `'easter'`: Erzwingt direkt einen bestimmten Effekt.

## 🛠️ Technologien

*   HTML5, CSS3
*   Vanilla JavaScript (Keine Frameworks nötig)
*   Font Awesome (Icons)
*   Discord Widget API

---

# Discord Server Landing Page (discord-webp) [English]

A modern, animated, and highly customizable landing page for your Discord server.

[**🔴 View Live Demo**](https://blutmonsterr.de/github/demo/discord-webp/)

## ✨ Features

*   **Live Status:** Shows the number of currently logged-in members (via Discord Widget API).
*   **Member List:** Displays avatars of some online members.
*   **Seasonal Effects:** Automatic particle backgrounds based on seasons and holidays:
    *   🌸 Spring (Cherry Blossoms)
    *   ☀️ Summer (Fireflies)
    *   🍂 Autumn (Leaves)
    *   ❄️ Winter (Snow)
    *   🐰 Easter (Bunnies & Eggs)
    *   🎃 Halloween (Bats, Ghosts, Pumpkins, Spiders)
    *   🎆 New Year (Fireworks/Sparks)
*   **Modern Design:** "Glassmorphism" look with 3D tilt effect on the card.
*   **Partner Section:** Display your partner servers in a dedicated, collapsible area. Data (name, icon, link) is automatically fetched via Server ID.
*   **Multilingual:** German (`de`) and English (`en`) integrated.
*   **Customizable:** Easy configuration via `config.js`.

## 🚀 Installation & Setup

1.  **Enable Discord Widget:**
    *   Go to your Discord Server Settings -> **Widget**.
    *   Check **"Enable Server Widget"**.
    *   Copy the **Server ID**.

2.  **Download Files:**
    *   Download this repository.

3.  **Configuration (`config.js`):**
    *   Open the `config.js` file with a text editor.
    *   Paste your **Server ID** into `SERVER_ID`.
    *   (Optional) Adjust language, background image, and social media links.

4.  **Upload:**
    *   Upload the files to your web space (e.g., GitHub Pages, Netlify, Apache/Nginx web server).

## ⚙️ Configuration

The `config.js` file is the control center:

```javascript
const CONFIG = {
    SERVER_ID: 'YOUR_ID_HERE', // Important!
    MAX_MEMBERS: 5,             // Max number of member avatars shown
    LANGUAGE: 'en',             // 'de' or 'en'
    BACKGROUND_IMAGE: '',       // URL to image or leave empty (uses server icon)
    SERVER_ICON: '',            // URL to icon or leave empty (uses Discord icon)
    
    SOCIAL_LINKS: [
        { icon: 'fab fa-github', url: 'https://github.com/your-name', name: 'GitHub' }
    ],

    PARTNERS: {
        ENABLED: true,
        LIST: [
            { id: 'PARTNER_SERVER_ID_HERE' },
        ]
    },

    // ... Animations
}
```

### Particle Effects (Seasons)

Under `ANIMATION.PARTICLES.TYPE` you choose how the particle effect is selected:

*   `'timezone'` (or `'auto'`): Automatically determines date, dynamic Easter, and season from `ANIMATION.PARTICLES.TIMEZONE` (`'auto'` for the visitor's browser timezone, or e.g. `'Europe/Berlin'` / `'Australia/Sydney'` including Northern/Southern Hemisphere).
*   `'dates'`: Uses only the custom date ranges from `ANIMATION.PARTICLES.DATES`.
*   `'winter'`, `'spring'`, `'summer'`, `'autumn'`, `'halloween'`, `'fireworks'`, `'easter'`: Forces a specific effect directly.

## 🛠️ Technologies

*   HTML5, CSS3
*   Vanilla JavaScript (No frameworks needed)
*   Font Awesome (Icons)
*   Discord Widget API
