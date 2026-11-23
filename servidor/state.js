const { mkdirSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function openState(sandboxEnabled) {
  const configuredPath = process.env.FHS_DATABASE_PATH || join(__dirname, 'data', 'aura.sqlite');
  const file = sandboxEnabled || configuredPath === ':memory:' ? ':memory:' : resolve(configuredPath);
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
  `);
  const get = db.prepare('SELECT data FROM app_state WHERE key = ?');
  const put = db.prepare(`
    INSERT INTO app_state (key, data) VALUES (?, ?)
    ON CONFLICT (key) DO UPDATE SET data = excluded.data
  `);

  return {
    read(key, fallback) {
      const row = get.get(key);
      return row ? JSON.parse(row.data) : fallback;
    },
    write(key, state) {
      put.run(key, JSON.stringify(state));
    },
  };
}

module.exports = { openState };
