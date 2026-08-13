const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const { port, uploadDir, hlsDir } = require('./config');
const videoRepo = require('./db/videoRepository');
const errorHandler = require('./middleware/errorHandler');

const uploadRoutes = require('./routes/upload.routes');
const videoRoutes = require('./routes/video.routes');
const sseRoutes = require('./routes/sse.routes');

require('./queue/videoWorker');

const app = express();

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(hlsDir, { recursive: true });

videoRepo.resetStuckJobs();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/upload', uploadRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/videos', sseRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
