# Klicker

Ein gemeinsamer Klick-Zähler im Browser. Man muss nichts herunterladen: Link öffnen, auf **+1** drücken, und alle sehen den Stand live.

**Link:** https://yarak5113-alt.github.io/klicker/

## Funktionen

- **Online-Datenbank (Firebase Firestore):** Die Klicks werden dauerhaft gespeichert und sind für alle gleich.
- **Live:** Neue Klicks erscheinen sofort bei allen, die die Seite offen haben.
- **Globale Sperre:** Nach einem gezählten Klick ist der Knopf **5 Sekunden für alle** gesperrt. Drücken drei Leute innerhalb von 5 Sekunden, zählt nur der erste Klick. Das prüfen die Firestore-Sicherheitsregeln mit der Serverzeit, man kann es also auch nicht durch Tricks im Browser umgehen.
- **Rekorde pro Stunde:** Die 5 Stunden mit den meisten Klicks plus der Zähler der aktuellen Stunde.
- **Log:** Unten auf der Seite stehen die letzten 50 Versuche mit Zeit, Name und Status (gezählt / abgelehnt).

## Einrichtung (einmalig, ca. 5 Minuten, kostenlos)

1. Auf <https://console.firebase.google.com> mit einem Google-Konto anmelden und **Projekt hinzufügen**. Google Analytics kannst du ausschalten.
2. Links **Build → Firestore Database → Datenbank erstellen**. Standort z. B. `eur3 (Europe)`, Modus **Produktion**.
3. Oben den Reiter **Regeln** öffnen, alles durch den Inhalt von [`firestore.rules`](firestore.rules) ersetzen und **Veröffentlichen**.
4. Zahnrad oben links → **Projekteinstellungen** → unten bei „Meine Apps“ auf das **Web-Symbol `</>`** klicken, einen Namen eingeben und registrieren (Hosting nicht ankreuzen).
5. Die angezeigten Werte (`apiKey`, `authDomain`, `projectId`, …) in [`config.js`](config.js) eintragen und auf GitHub speichern.
6. Nach etwa einer Minute ist die Seite unter dem Link oben fertig.

Die Firebase-Konfiguration darf öffentlich sein. Was gelesen und geschrieben werden darf, entscheiden allein die Regeln.

**Gratis-Limit:** Firestore erlaubt im kostenlosen Tarif 50.000 Lesevorgänge und 20.000 Schreibvorgänge pro Tag. Für eine Gruppe von Freunden reicht das locker.

## Dateien

| Datei             | Inhalt                                            |
|-------------------|---------------------------------------------------|
| `index.html`      | Die Webseite (läuft auf GitHub Pages)             |
| `config.js`       | Firebase-Konfiguration                            |
| `firestore.rules` | Sicherheitsregeln mit der 5-Sekunden-Sperre       |
