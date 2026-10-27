# Arbeitsweise im Maschenbuch-Repo

Die Seite läuft live (GitHub Pages + Supabase) und wird **während der Arbeit aktiv genutzt**.
Nur noch diese Version zählt – keine lokale Variante pflegen.

## Testen und Hochladen

Website lokal starten: `(python3 -m http.server 8765 >/dev/null 2>&1 &); sleep 1` (im selben Befehl wie die Tests,
der Server überlebt nicht zwischen Befehlen). Tests: `NODE_PATH=$(npm root -g) node tests/run.js [wörter…]`.

**Kleine Änderung** (Farben, Abstände, Texte, CSS, einzelne Anzeige ohne neue Logik):
1. Nur die betroffenen Testgruppen laufen lassen, z. B. `node tests/run.js verlauf pause` (Tabelle unten)
2. Bildschirmfoto prüfen (Handy 390×844, hell und dunkel)
3. Committen, pushen – **nicht** auf GitHub warten. GitHub testet trotzdem alles.
4. Zu Beginn der nächsten Aufgabe kurz `gh run list -L3` prüfen; rot → zuerst reparieren.

**Größere Änderung** (neue Funktion, Zählen/Speichern/Sync, Datenbank, mehrere Dateien):
alle Tests lokal (`node tests/run.js`, ca. 1 Min.), pushen, auf GitHub warten, erst dann „fertig“ melden.

**Datenbank:** Änderungen vorher ankündigen, müssen mit dem alten Stand der Website funktionieren.
Neue Migration in `supabase/migrations/`, Test in `supabase/tests/`. Zerstörerisches SQL führt Robin selbst aus.

## Welche Testgruppe gehört wozu

| Bereich | Gruppen |
|---|---|
| Zähler, +1/−1, Reihe eingeben, Warnungen | `grundlagen reihenzaehlung` |
| Großer Zähler (Vollbild), Kästen, Verlauf | `verlauf reihenzaehlung` |
| Pause-Timer | `pause` |
| Notizzettel | `notiz` |
| Strickzeit, Rückgängig, Fertig-Moment, Konfetti, Halbzeit | `zeit halbzeit` |
| 3D (Tab, Live, großer Zähler; Top am Model) | `3d` |
| Seiten, Vorlagen, Garnlager, Farbwahl, Export/Import, Farbmuster | `alle-seiten angebote` |
| Anmelden, Sync, Knit-Along, Tausch, Konto, Einladungscode | `sync knitalong tausch konto einladungscode` |
| Córdoba Top (Vorlage mit Größen) | `cordoba` |
| Raglan-Rechner, Werkzeuge je Vorlage | `raglan` |
| Tutorial (Tour) | `tutorial` |
| Offline / Service Worker | `offline` |

3D wird in den Tests nur in Gruppen mit `mit3d:true` gezeichnet (sonst zu langsam ohne Grafikkarte).

## Neue Vorlagen

In `js/daten.js` unter `TOOLS` eintragen, welche Werkzeuge zur Bauweise passen (z. B. `raglan` = Raglan-Rechner unter „Maße“,
nur für Oberteile mit Raglan). Schals usw. bekommen eine leere Liste.

## Commits

Mit `-c user.name="Robin Meijer" -c user.email="mank3nntihn@users.noreply.github.com"`.
Repo ist öffentlich: keine Schlüssel, Passwörter oder den Einladungscode einchecken.
