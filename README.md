# Maschenbuch

Strick- und Häkelbegleiter: Reihenzähler mit Reihen-Merker, Strickzeit, 3D-Vorschau, Hobbii-Garnlager,
Tauschbörse, Lern-Ecke mit Animationen und Knit-Along. Läuft als App auf dem iPhone, auch offline.

Live: https://mank3nntihn.github.io/maschenbuch/

## Aufbau

Reine statische Seite für GitHub Pages, ohne Build-Schritt: Datei ändern, pushen, fertig.

| Datei | Inhalt |
|---|---|
| `index.html` | Gerüst der Seite, lädt die Dateien unten der Reihe nach |
| `css/app.css` | Gesamtes Aussehen inkl. Farbmuster, Dialoge, Fertig-Fenster |
| `js/texte.js` | Alle Texte Deutsch/Englisch, Abkürzungs-Erklärungen |
| `js/daten.js` | Grundwerte, Vorlagen, Farbmuster, Speichern, Export/Import, Zusammenführen zweier Stände |
| `js/anleitung.js` | Reihenpläne (Sophie Scarf, Weekend Scarf, Streifenschal), Berechnung, Anleitungs-Tab |
| `js/zaehler.js` | Zähler, +1/−1, großer Zähler (Vollbild), Reihen-Merker, „Reihe eingeben“, Bildschirm anlassen |
| `js/fertig.js` | Strickzeit mit Fertig-Schätzung, Fertig-Moment mit Konfetti, Archiv „Fertige Projekte“ |
| `js/projekt.js` | Tabs Wolle und Maße, Farben/Streifen |
| `js/garn.js` | Garnlager, Einkaufsliste, Hobbii-Farbwahl (`garne.json`) |
| `js/3d.js` | Eigener kleiner WebGL-Renderer: 3D-Tab und Live-Ansicht |
| `js/lernecke.js` | Lern-Ecke „Hilfe & Techniken“ mit Animationen |
| `js/knitalong.js` | Knit-Along-Balken der Freundinnen, grüner Punkt „strickt gerade“ |
| `js/cloud.js` | Google-Anmeldung, Synchronisierung über Supabase, Konto abmelden/löschen |
| `js/tausch.js` | Garn-Tauschbörse |
| `js/ui.js` | Seitenaufbau (`render`), Menü, Startseite, Einstellungen, Dialoge, Rückgängig, Impressum |
| `js/start.js` | Startet alles (wird als letzte Datei geladen) |
| `sw.js` | Offline-Speicher: eigene Dateien Netz zuerst, sonst gespeichert |
| `garne.json` | Hobbii-Katalog, wird monatlich automatisch aktualisiert (`tools/garne_aktualisieren.py`) |

Alle Dateien teilen sich einen gemeinsamen Bereich (klassische `<script>`-Dateien, keine Module).
**Neue JS-Datei?** In `index.html` und in der Liste `JS` in `sw.js` eintragen. Ein Test prüft, dass beide übereinstimmen.

## Daten

- Ohne Anmeldung bleibt alles im Browser (`localStorage`, Schlüssel `maschenbuch.v4`)
- Mit Google-Anmeldung: Supabase (Projekt `maschenbuch`, Region Frankfurt)
- Der Schlüssel in `js/cloud.js` ist der öffentliche Anon-Key; die Daten sind über Row Level Security geschützt
  - `user_state`: nur die eigene Zeile
  - `kal`: alle Angemeldeten lesen, jede schreibt nur ihren eigenen Balken
  - `tausch`/`tausch_wunsch`: alle Angemeldeten lesen, jede ändert nur ihre eigenen Angebote und Wünsche
- Schreib-Bremse in der Datenbank: dieselbe Zeile höchstens alle 0,5 Sekunden ändern
- `delete_my_account()` löscht nur das eigene Konto samt Cloud-Daten
- `.github/workflows/keepalive.yml` hält das kostenlose Supabase-Projekt wach

## Tests

`tests/` enthält Browser-Tests mit Playwright. Supabase wird dabei durch einen Nachbau (`tests/mocksb.js`)
ersetzt, es werden also keine echten Daten angefasst. Sie laufen bei jedem Push automatisch
(Actions → „Automatische Tests“) und lassen sich dort auch per „Run workflow“ starten.

Lokal: `python3 -m http.server 8765` im Ordner starten, dann `node tests/run.js`
(nur eine Gruppe: `node tests/run.js tausch`, mit Zeitangaben: `ZEIT=1 node tests/run.js`).
