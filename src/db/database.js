const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve('videos.db.json');

// Load or initialize the store
const load = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return {};
  }
};

const save = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = { load, save };
