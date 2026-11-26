# Klicker

Ein gemeinsamer Klick-Zähler: Jeder, der die Seite öffnet, kann auf **+1** drücken. Alle sehen denselben Stand live.

## Funktionen

- **Datenbank (SQLite):** Alle Klicks werden in `klicker.db` gespeichert, der Stand bleibt nach einem Neustart erhalten.
- **Mehrere Nutzer gleichzeitig:** Änderungen erscheinen sofort bei allen (Server-Sent Events).
- **Globale Sperre:** Nach einem gezählten Klick ist der Knopf **5 Sekunden für alle** gesperrt. Drücken drei Leute innerhalb von 5 Sekunden, zählt nur der erste Klick. Die Prüfung läuft in einer Datenbank-Transaktion (`BEGIN IMMEDIATE`), dadurch kann nie mehr als ein Klick durchkommen.
- **Rekorde pro Stunde:** Die 5 Stunden mit den meisten Klicks plus der Zähler der aktuellen Stunde.
- **Log:** Unten auf der Seite stehen die letzten 50 Versuche mit Zeit, Name und Status (gezählt / abgelehnt).

## Starten

Voraussetzung: [Node.js](https://nodejs.org) **22.13 oder neuer** (nutzt das eingebaute `node:sqlite`, `npm install` ist nicht nötig).

```bash
node server.js
```

Dann <http://localhost:3000> öffnen.

### Einstellungen (Umgebungsvariablen)

| Variable      | Standard       | Bedeutung                     |
|---------------|----------------|-------------------------------|
| `PORT`        | `3000`         | Port des Servers              |
| `COOLDOWN_MS` | `5000`         | Sperrzeit nach einem Klick    |
| `DB_FILE`     | `./klicker.db` | Pfad zur SQLite-Datenbank     |

## API

| Methode | Pfad          | Beschreibung                                                     |
|---------|---------------|------------------------------------------------------------------|
| GET     | `/api/state`  | Aktueller Stand (Summe, Stunde, Rekorde, Log)                    |
| POST    | `/api/click`  | Body `{"name":"..."}` → `200` gezählt, `429` gesperrt            |
| GET     | `/api/events` | Live-Stream (Server-Sent Events) mit dem Stand nach jedem Klick  |

## Online stellen

GitHub speichert nur den Code. Damit andere mitklicken können, muss der Server laufen, z. B. auf Render, Railway, Fly.io oder einem eigenen Server. Die Datenbankdatei muss dort auf einem **dauerhaften Speicher** liegen (`DB_FILE` auf ein Volume setzen), sonst geht der Zählerstand bei einem Neustart verloren.
