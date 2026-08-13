const express = require('express');
const path = require('path');
const fs = require('fs');
const videoRepo = require('../db/videoRepository');
const videoQueue = require('../queue/videoQueue');
const { hlsDir } = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
  const videos = videoRepo.findAll();
  res.json(videos);
});

router.get('/queue/stats', async (req, res, next) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      videoQueue.getWaitingCount(),
      videoQueue.getActiveCount(),
      videoQueue.getCompletedCount(),
      videoQueue.getFailedCount(),
    ]);
    res.json({ waiting, active, completed, failed });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res) => {
  const video = videoRepo.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });

  const avgSecondsPerJob = 120;
  const eta = video.queue_position ? video.queue_position * avgSecondsPerJob : null;

  res.json({ ...video, estimatedSeconds: eta });
});

router.get('/:id/stream/master.m3u8', (req, res) => {
  const video = videoRepo.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  if (video.status !== 'completed') return res.status(409).json({ error: 'Video not yet ready', status: video.status });

  const masterPath = path.join(hlsDir, req.params.id, 'master.m3u8');
  if (!fs.existsSync(masterPath)) return res.status(404).json({ error: 'Playlist not found' });

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(masterPath);
});

router.get('/:id/stream/:quality/index.m3u8', (req, res) => {
  const filePath = path.join(hlsDir, req.params.id, req.params.quality, 'index.m3u8');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Playlist not found' });

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(filePath);
});

router.get('/:id/stream/:quality/:segment', (req, res) => {
  const filePath = path.join(hlsDir, req.params.id, req.params.quality, req.params.segment);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Segment not found' });

  res.setHeader('Content-Type', 'video/MP2T');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(filePath);
});

module.exports = router;
