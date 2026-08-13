const db = require('./database');

const create = (id, filename, originalPath) => {
  const stmt = db.prepare(`
    INSERT INTO videos (id, filename, original_path, status)
    VALUES (?, ?, ?, 'uploaded')
  `);
  stmt.run(id, filename, originalPath);
};

const findById = (id) => {
  return db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
};

const findAll = () => {
  return db.prepare('SELECT * FROM videos ORDER BY created_at DESC').all();
};

const updateStatus = (id, status, extras = {}) => {
  const fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const values = [status];

  if (extras.queuePosition !== undefined) {
    fields.push('queue_position = ?');
    values.push(extras.queuePosition);
  }
  if (extras.hlsPath !== undefined) {
    fields.push('hls_path = ?');
    values.push(extras.hlsPath);
  }
  if (extras.error !== undefined) {
    fields.push('error_msg = ?');
    values.push(extras.error);
  }
  if (status === 'completed') {
    fields.push('completed_at = CURRENT_TIMESTAMP');
    fields.push('progress = 100');
  }

  values.push(id);
  db.prepare(`UPDATE videos SET ${fields.join(', ')} WHERE id = ?`).run(...values);
};

const updateProgress = (id, progress) => {
  db.prepare('UPDATE videos SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(progress, id);
};

const resetStuckJobs = () => {
  db.prepare(`UPDATE videos SET status = 'queued', progress = 0 WHERE status = 'processing'`).run();
};

module.exports = { create, findById, findAll, updateStatus, updateProgress, resetStuckJobs };
