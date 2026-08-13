const Queue = require('bull');
const { maxConcurrentJobs } = require('../config');

// Use explicit host/port to force IPv4 (127.0.0.1) on Windows
// Windows resolves 'localhost' to ::1 (IPv6) which Redis doesn't listen on by default
const videoQueue = new Queue('video-transcoding', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
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
