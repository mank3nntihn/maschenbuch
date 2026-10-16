# Maschenbuch

Strick- und Häkelbegleiter: Reihenzähler mit Reihen-Merker, 3D-Vorschau, Hobbii-Garnlager, Lern-Ecke mit Animationen und Knit-Along.

- Statische Seite für GitHub Pages (`index.html`, `garne.json`)
- Anmeldung, Synchronisierung und Knit-Along über Supabase (Projekt `maschenbuch`, Region Frankfurt)
- Der Schlüssel in `index.html` ist der öffentliche Anon-Key; die Daten sind über Row Level Security geschützt
  (`user_state`: nur die eigene Zeile, `kal`: alle Angemeldeten lesen, jede schreibt nur ihren eigenen Balken)
  (`tausch`/`tausch_wunsch`: alle Angemeldeten lesen, jede ändert nur ihre eigenen Angebote und Wünsche)
- Schreib-Bremse in der Datenbank: dieselbe Zeile höchstens alle 0,5 Sekunden ändern
- `delete_my_account()` löscht nur das eigene Konto samt Cloud-Daten

## Tests

`tests/` enthält Browser-Tests mit Playwright. Supabase wird dabei durch einen Nachbau (`tests/mocksb.js`)
ersetzt, es werden also keine echten Daten angefasst. Sie laufen bei jedem Push automatisch
(Actions → „Automatische Tests“) und lassen sich dort auch per „Run workflow“ starten.

Lokal: `python3 -m http.server 8765` im Ordner starten, dann `node tests/run.js`.
