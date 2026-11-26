// Klicker – gemeinsamer Zähler mit SQLite, globalem 5-Sekunden-Cooldown,
// Stunden-Rekorden und Log. Keine externen Abhängigkeiten (Node >= 22.13).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const COOLDOWN_MS = Number(process.env.COOLDOWN_MS) || 5000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'klicker.db');
const HOUR_MS = 60 * 60 * 1000;

// ---------- Datenbank ----------
const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS clicks (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    ts       INTEGER NOT NULL,           -- Zeitpunkt in ms (Unix)
    name     TEXT    NOT NULL,
    accepted INTEGER NOT NULL            -- 1 = gezählt, 0 = abgelehnt (Cooldown)
  );
  CREATE INDEX IF NOT EXISTS idx_clicks_acc_ts ON clicks(accepted, ts);
`);

const q = {
  lastAccepted: db.prepare('SELECT ts FROM clicks WHERE accepted = 1 ORDER BY ts DESC LIMIT 1'),
  insert: db.prepare('INSERT INTO clicks (ts, name, accepted) VALUES (?, ?, ?)'),
  total: db.prepare('SELECT COUNT(*) AS n FROM clicks WHERE accepted = 1'),
  since: db.prepare('SELECT COUNT(*) AS n FROM clicks WHERE accepted = 1 AND ts >= ?'),
  records: db.prepare(`
    SELECT ts / ${HOUR_MS} AS h, COUNT(*) AS n
    FROM clicks WHERE accepted = 1
    GROUP BY h ORDER BY n DESC, h DESC LIMIT 5`),
  logs: db.prepare('SELECT id, ts, name, accepted FROM clicks ORDER BY id DESC LIMIT 50'),
};

// Atomarer Klick: Prüfen + Schreiben in EINER Transaktion (BEGIN IMMEDIATE sperrt
// die DB zum Schreiben). Wenn mehrere Leute innerhalb von 5 s drücken, kommt nur
// der erste durch – auch wenn mehrere Server-Prozesse dieselbe DB nutzen.
function tryClick(name) {
  const now = Date.now();
  db.exec('BEGIN IMMEDIATE');
  try {
    const last = q.lastAccepted.get();
    const elapsed = last ? now - last.ts : Infinity;
    const ok = elapsed >= COOLDOWN_MS;
    q.insert.run(now, name, ok ? 1 : 0);
    db.exec('COMMIT');
    return { ok, retryInMs: ok ? COOLDOWN_MS : COOLDOWN_MS - elapsed };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function getState() {
  const now = Date.now();
  const last = q.lastAccepted.get();
  return {
    serverNow: now,
    cooldownMs: COOLDOWN_MS,
    lastAcceptedTs: last ? last.ts : null,
    total: q.total.get().n,
    thisHour: q.since.get(now - (now % HOUR_MS)).n,
    records: q.records.all().map(r => ({ hourStart: r.h * HOUR_MS, count: r.n })),
    logs: q.logs.all().map(r => ({ id: r.id, ts: r.ts, name: r.name, accepted: !!r.accepted })),
  };
}

function cleanName(raw) {
  const s = typeof raw === 'string' ? raw.replace(/[\u0000-\u001f]/g, '').trim() : '';
  return s.slice(0, 30) || 'Anonym';
}

// ---------- Live-Updates (Server-Sent Events) ----------
const sseClients = new Set();
function broadcast() {
  const data = `data: ${JSON.stringify(getState())}\n\n`;
  for (const res of sseClients) res.write(data);
}
setInterval(() => { for (const res of sseClients) res.write(': ping\n\n'); }, 25000);

// ---------- HTTP ----------
const INDEX_HTML = path.join(__dirname, 'public', 'index.html');

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > limit) { reject(new Error('too large')); req.destroy(); }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(INDEX_HTML).pipe(res);
    }

    if (req.method === 'GET' && url.pathname === '/api/state') {
      return sendJson(res, 200, getState());
    }

    if (req.method === 'GET' && url.pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(`data: ${JSON.stringify(getState())}\n\n`);
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/click') {
      let name = '';
      try { name = JSON.parse((await readBody(req)) || '{}').name; } catch { /* ignorieren */ }
      const result = tryClick(cleanName(name));
      broadcast();
      return sendJson(res, result.ok ? 200 : 429, result);
    }

    sendJson(res, 404, { error: 'Nicht gefunden' });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJson(res, 500, { error: 'Serverfehler' });
  }
});

server.listen(PORT, () => {
  console.log(`Klicker läuft auf http://localhost:${PORT}  (DB: ${DB_FILE}, Cooldown: ${COOLDOWN_MS} ms)`);
});
