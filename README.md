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
| `js/anleitung.js` | Reihenpläne (Sophie Scarf, Weekend Scarf, Córdoba Top in 7 Größen, Streifenschal), Berechnung, Anleitungs-Tab |
| `js/zaehler.js` | Zähler, +1/−1, großer Zähler (Vollbild) mit Verlauf der letzten Reihen, Pause-Timer, Reihen-Merker, „Reihe eingeben“, Bildschirm anlassen |
| `js/fertig.js` | Strickzeit mit Fertig-Schätzung, Halbzeit-Animation, Fertig-Moment mit Konfetti, Archiv „Fertige Projekte“ |
| `js/projekt.js` | Tabs Wolle und Maße, Farben/Streifen |
| `js/garn.js` | Garnlager, Einkaufsliste, Hobbii-Farbwahl (`garne.json`) |
| `js/3d.js` | Eigener kleiner WebGL-Renderer: 3D-Tab und Live-Ansicht |
| `js/lernecke.js` | Lern-Ecke „Hilfe & Techniken“ mit Animationen |
| `js/kreis.js` | Einladungscode: ohne Code öffnet sich das Maschenbuch nicht |
| `js/knitalong.js` | Knit-Along-Balken der Freundinnen, grüner Punkt „strickt gerade“ |
| `js/cloud.js` | Google-Anmeldung, Synchronisierung über Supabase, Konto abmelden/löschen |
| `js/tausch.js` | Garn-Tauschbörse |
| `js/tour.js` | Tutorial: geführte Tour durch die Website (Menü → Extras) |
| `js/ui.js` | Seitenaufbau (`render`), Menü, Startseite, Einstellungen, Dialoge, Rückgängig, Impressum |
| `js/start.js` | Startet alles (wird als letzte Datei geladen) |
| `sw.js` | Offline-Speicher: eigene Dateien Netz zuerst, sonst gespeichert |
| `garne.json` | Hobbii-Katalog mit Preisen und Angeboten, täglich automatisch aktualisiert (`tools/garne_aktualisieren.py`) |
| `supabase/migrations/` | Datenbank als Code: Tabellen, Regeln, Funktionen |
| `supabase/tests/` | Datenbank-Tests (laufen in GitHub gegen ein echtes, frisches Supabase) |

Alle Dateien teilen sich einen gemeinsamen Bereich (klassische `<script>`-Dateien, keine Module).
**Neue JS-Datei?** In `index.html` und in der Liste `JS` in `sw.js` eintragen. Ein Test prüft, dass beide übereinstimmen.

## Daten

- Ohne Anmeldung bleibt alles im Browser (`localStorage`, Schlüssel `maschenbuch.v4`)
- Mit Google-Anmeldung: Supabase (Projekt `maschenbuch`, Region Frankfurt)
- Der Schlüssel in `js/cloud.js` ist der öffentliche Anon-Key; die Daten sind über Row Level Security geschützt
- **Freundeskreis:** Nur wer den Einladungscode eingegeben hat (`kreis_mitglied`), sieht überhaupt etwas
  - `user_state`: nur die eigene Zeile
  - `kal`: alle im Kreis lesen, jede schreibt nur ihren eigenen Balken
  - `tausch`/`tausch_wunsch`: alle im Kreis lesen, jede ändert nur ihre eigenen Angebote und Wünsche
- Der Code liegt nur als Hash in der Tabelle `kreis` (nicht im Repo). Ändern im Supabase SQL Editor:
  `update public.kreis set code_hash = extensions.crypt(lower('NeuerCode'), extensions.gen_salt('bf'));`
  Wer schon im Kreis ist, bleibt drin. 10 falsche Versuche pro IP → 15 Minuten Pause
- Schreib-Bremse in der Datenbank: dieselbe Zeile höchstens alle 0,5 Sekunden ändern
- `delete_my_account()` löscht nur das eigene Konto samt Cloud-Daten
- `.github/workflows/keepalive.yml` (täglich) hält das kostenlose Supabase-Projekt wach und ruft `aufraeumen()` auf:
  Knit-Along-Balken ohne Änderung seit 60 Tagen, Tauschangebote älter als 90 Tage, alte Code-Versuche
  und Konten, die nach 7 Tagen immer noch nicht im Kreis sind, werden gelöscht
- Neue Datenbank-Änderung: neue Datei in `supabase/migrations/` (Zeitstempel vorne), Test dazu in `supabase/tests/`

## Tests

`tests/` enthält Browser-Tests mit Playwright. Supabase wird dabei durch einen Nachbau (`tests/mocksb.js`)
ersetzt, es werden also keine echten Daten angefasst. Sie laufen bei jedem Push automatisch
(Actions → „Automatische Tests“) und lassen sich dort auch per „Run workflow“ starten.

Zwei Teile: „Website“ (Browser, bei jedem Push) und „Datenbank-Tests“ (`supabase start` mit allen Migrationen,
dann `supabase/tests/run.sh` – nur bei Änderungen unter `supabase/` und einmal pro Woche).

Lokal: `python3 -m http.server 8765` im Ordner starten, dann `node tests/run.js` (ca. 1 Minute, Gruppen laufen parallel).
Nur bestimmte Gruppen: `node tests/run.js verlauf pause`, mit Zeitangaben: `ZEIT=1 …`, nacheinander: `PARALLEL=1 …`.
3D wird nur in der Gruppe `16-3d` wirklich gezeichnet, sonst übersprungen (ohne Grafikkarte sehr langsam).
Arbeitsweise (welche Tests bei welcher Änderung): siehe `CLAUDE.md`.

## Demo-Video

`tools/demo-video/` nimmt ein 2-Minuten-Video (1080p, 30 Bilder/s) mit Demo-Daten auf – Anleitung oben in
`aufnahme.js`. Englisch ist Standard, `LANG_VIDEO=de` für Deutsch, `PROBE=1` für einen schnellen Probelauf mit Standbildern.
