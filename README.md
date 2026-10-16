# Maschenbuch

Strick- und Häkelbegleiter: Reihenzähler mit Reihen-Merker, 3D-Vorschau, Hobbii-Garnlager, Lern-Ecke mit Animationen und Knit-Along.

- Statische Seite für GitHub Pages (`index.html`, `garne.json`)
- Anmeldung, Synchronisierung und Knit-Along über Supabase (Projekt `maschenbuch`, Region Frankfurt)
- Der Schlüssel in `index.html` ist der öffentliche Anon-Key; die Daten sind über Row Level Security geschützt
  (`user_state`: nur die eigene Zeile, `kal`: alle Angemeldeten lesen, jede schreibt nur ihren eigenen Balken)
