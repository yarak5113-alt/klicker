# Klicker

Ein gemeinsamer Klick-Zähler im Browser. Man muss nichts herunterladen: Link öffnen, auf **+1** drücken, und alle sehen den Stand live.

**Link:** https://yarak5113-alt.github.io/klicker/

## Funktionen

- **Online-Datenbank (Firebase Realtime Database):** Die Klicks werden dauerhaft gespeichert und sind für alle gleich.
- **Live:** Neue Klicks erscheinen sofort bei allen, die die Seite offen haben.
- **Globale Sperre:** Nach einem gezählten Klick ist der Knopf **5 Sekunden für alle** gesperrt. Drücken drei Leute innerhalb von 5 Sekunden, zählt nur der erste Klick. Das prüfen die Datenbank-Regeln mit der Serverzeit, man kann es also auch nicht durch Tricks im Browser umgehen.
- **Rekorde pro Stunde:** Die 5 Stunden mit den meisten Klicks plus der Zähler der aktuellen Stunde.
- **Log:** Unten auf der Seite stehen die letzten 50 Versuche mit Zeit, Name und Status (gezählt / abgelehnt).

## Einrichtung

Die Datenbank-URL steht schon in [`config.js`](config.js). Es fehlen nur noch die Regeln:

1. <https://console.firebase.google.com> → Projekt **an-der-stelle** → **Realtime Database** → Reiter **Regeln**.
2. Alles löschen, den Inhalt von [`database.rules.json`](database.rules.json) einfügen und **Veröffentlichen**.

**Gratis-Limit:** 1 GB Speicher und 10 GB Datenübertragung pro Monat. Für eine Gruppe von Freunden reicht das locker.

## Dateien

| Datei                 | Inhalt                                          |
|-----------------------|-------------------------------------------------|
| `index.html`          | Die Webseite (läuft auf GitHub Pages)           |
| `config.js`           | Adresse der Firebase-Datenbank                  |
| `database.rules.json` | Sicherheitsregeln mit der 5-Sekunden-Sperre     |
