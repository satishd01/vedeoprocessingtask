const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve('videos.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_path TEXT,
    status TEXT DEFAULT 'uploaded',
    queue_position INTEGER,
    progress INTEGER DEFAULT 0,
    error_msg TEXT,
    hls_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  )
`);

module.exports = db;
