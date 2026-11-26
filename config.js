// Firebase Realtime Database. Die URL darf öffentlich sein:
// Was erlaubt ist, entscheiden die Regeln in database.rules.json.
window.FIREBASE_CONFIG = {
  projectId: 'an-der-stelle',
  databaseURL: 'https://an-der-stelle-default-rtdb.europe-west1.firebasedatabase.app',

  // Zeitblöcke für die Rekorde (Uhrzeit in TIMEZONE). Beliebig viele, einfach ändern/ergänzen.
  // Die Rekorde werden aus dem Log berechnet – Änderungen gelten also auch rückwirkend.
  TIMEZONE: 'Europe/Berlin',
  BLOCKS: [
    { start: '09:45', end: '11:15' },
    { start: '11:30', end: '13:00' },
  ],

  // Seltenes Bild: Datei im Repo (z. B. 'lustig.jpg' hochladen und hier eintragen) und Chance pro Klick.
  FUNNY_IMAGE: 'lustig.svg',
  FUNNY_CHANCE: 0.01,   // 0.01 = 1 zu 100
};
