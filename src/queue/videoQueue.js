const Queue = require('bull');

// In Docker, REDIS_URL is set to redis://redis:6379 (service hostname)
// Locally on Windows, we force 127.0.0.1 to avoid IPv6 resolution issues
const redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : { host: '127.0.0.1', port: 6379 };

const videoQueue = new Queue('video-transcoding', redisConfig, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

module.exports = videoQueue;
