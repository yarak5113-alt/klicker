# Klicker

Ein gemeinsamer Klick-Zähler im Browser. Man muss nichts herunterladen: Link öffnen, auf **+1** drücken, und alle sehen den Stand live.

**Link:** https://yarak5113-alt.github.io/klicker/

## Funktionen

- **Online-Datenbank (Supabase):** Die Klicks werden dauerhaft gespeichert und sind für alle gleich.
- **Live:** Neue Klicks erscheinen sofort bei allen, die die Seite offen haben.
- **Globale Sperre:** Nach einem gezählten Klick ist der Knopf **5 Sekunden für alle** gesperrt. Drücken drei Leute innerhalb von 5 Sekunden, zählt nur der erste Klick. Die Prüfung läuft in der Datenbank mit einer Sperre (`pg_advisory_xact_lock`), dadurch kann nie mehr als ein Klick durchkommen.
- **Rekorde pro Stunde:** Die 5 Stunden mit den meisten Klicks plus der Zähler der aktuellen Stunde.
- **Log:** Unten auf der Seite stehen die letzten 50 Versuche mit Zeit, Name und Status (gezählt / abgelehnt).

## Einrichtung (einmalig, ca. 5 Minuten)

1. Auf <https://supabase.com> kostenlos anmelden und **New project** erstellen.
2. Im Projekt links **SQL Editor** öffnen, den Inhalt von [`supabase.sql`](supabase.sql) einfügen und **Run** drücken.
3. Unter **Project Settings → API** die **Project URL** und den **anon / publishable key** kopieren.
4. Beide Werte in [`config.js`](config.js) eintragen und auf GitHub speichern (committen).
5. Nach etwa einer Minute ist die Seite unter dem Link oben fertig.

Der anon-Key darf öffentlich sein: Die Datenbank erlaubt nur Lesen und Klicken über die Funktion `click()`. Direktes Ändern oder Löschen ist gesperrt.

## Dateien

| Datei          | Inhalt                                                |
|----------------|-------------------------------------------------------|
| `index.html`   | Die Webseite (läuft auf GitHub Pages)                 |
| `config.js`    | Supabase-URL und Key                                  |
| `supabase.sql` | Tabelle, Sperre, Rekorde und Rechte für die Datenbank |
