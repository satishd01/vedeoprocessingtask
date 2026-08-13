const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const upload = require('../middleware/multer');
const videoRepo = require('../db/videoRepository');
const videoQueue = require('../queue/videoQueue');
const { hlsDir } = require('../config');

const router = express.Router();

router.post('/', upload.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const id = uuidv4();
    const outputDir = path.join(hlsDir, id);

    videoRepo.create(id, req.file.originalname, req.file.path);

    const waitingCount = await videoQueue.getWaitingCount();
    const activeCount = await videoQueue.getActiveCount();
    const queuePosition = waitingCount + activeCount + 1;

    videoRepo.updateStatus(id, 'queued', { queuePosition });

    await videoQueue.add({ videoId: id, inputPath: req.file.path, outputDir });

    res.status(202).json({
      videoId: id,
      status: 'queued',
      queuePosition,
      message: 'Video queued for processing',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
