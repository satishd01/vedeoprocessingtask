const path = require('path');
const fs = require('fs');
const videoQueue = require('./videoQueue');
const videoRepo = require('../db/videoRepository');
const ffmpegService = require('../services/ffmpegService');
const sseService = require('../services/sseService');
const { maxConcurrentJobs } = require('../config');

videoQueue.process(maxConcurrentJobs, async (job) => {
  const { videoId, inputPath, outputDir } = job.data;

  videoRepo.updateStatus(videoId, 'processing');
  sseService.broadcast(videoId, { status: 'processing', progress: 0 });

  await ffmpegService.transcodeToHLS(inputPath, outputDir, (progress) => {
    job.progress(progress);
    videoRepo.updateProgress(videoId, progress);
    sseService.broadcast(videoId, { status: 'processing', progress });
  });

  if (fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }

  videoRepo.updateStatus(videoId, 'completed', { hlsPath: outputDir });
  sseService.broadcast(videoId, { status: 'completed', progress: 100 });
});

videoQueue.on('failed', (job, err) => {
  const { videoId } = job.data;
  videoRepo.updateStatus(videoId, 'failed', { error: err.message });
  sseService.broadcast(videoId, { status: 'failed', error: err.message });
});

videoQueue.on('stalled', (job) => {
  const { videoId } = job.data;
  videoRepo.updateStatus(videoId, 'queued');
});

module.exports = videoQueue;
