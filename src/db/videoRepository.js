const { load, save } = require('./database');

const now = () => new Date().toISOString();

const create = (id, filename, originalPath) => {
  const db = load();
  db[id] = {
    id,
    filename,
    original_path: originalPath,
    status: 'uploaded',
    queue_position: null,
    progress: 0,
    error_msg: null,
    hls_path: null,
    created_at: now(),
    updated_at: now(),
    completed_at: null,
  };
  save(db);
};

const findById = (id) => {
  return load()[id] || null;
};

const findAll = () => {
  const db = load();
  return Object.values(db).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
};

const updateStatus = (id, status, extras = {}) => {
  const db = load();
  if (!db[id]) return;

  db[id].status = status;
  db[id].updated_at = now();

  if (extras.queuePosition !== undefined) db[id].queue_position = extras.queuePosition;
  if (extras.hlsPath !== undefined) db[id].hls_path = extras.hlsPath;
  if (extras.error !== undefined) db[id].error_msg = extras.error;
  if (status === 'completed') {
    db[id].completed_at = now();
    db[id].progress = 100;
  }

  save(db);
};

const updateProgress = (id, progress) => {
  const db = load();
  if (!db[id]) return;
  db[id].progress = progress;
  db[id].updated_at = now();
  save(db);
};

const resetStuckJobs = () => {
  const db = load();
  for (const id of Object.keys(db)) {
    if (db[id].status === 'processing') {
      db[id].status = 'queued';
      db[id].progress = 0;
    }
  }
  save(db);
};

module.exports = { create, findById, findAll, updateStatus, updateProgress, resetStuckJobs };
