const Queue = require('bull');
const { redisUrl } = require('../config');

const videoQueue = new Queue('video-transcoding', redisUrl, {
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
