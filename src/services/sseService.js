const clients = new Map();

function register(videoId, res) {
  if (!clients.has(videoId)) {
    clients.set(videoId, new Set());
  }
  clients.get(videoId).add(res);
}

function unregister(videoId, res) {
  const set = clients.get(videoId);
  if (set) {
    set.delete(res);
    if (set.size === 0) clients.delete(videoId);
  }
}

function broadcast(videoId, data) {
  const set = clients.get(videoId);
  if (!set) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  set.forEach((res) => {
    try {
      res.write(payload);
    } catch (_) {
      set.delete(res);
    }
  });
}

module.exports = { register, unregister, broadcast };
