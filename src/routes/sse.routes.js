const express = require('express');
const sseService = require('../services/sseService');
const videoRepo = require('../db/videoRepository');

const router = express.Router();

router.get('/:id/status/live', (req, res) => {
  const video = videoRepo.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ status: video.status, progress: video.progress })}\n\n`);

  sseService.register(req.params.id, res);

  req.on('close', () => {
    sseService.unregister(req.params.id, res);
  });
});

module.exports = router;
