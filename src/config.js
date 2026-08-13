require('dotenv').config();
const path = require('path');

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  hlsDir: path.resolve(process.env.HLS_DIR || './hls'),
  maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS) || 2,
};
