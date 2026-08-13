# Video Processing Service

A production-ready, queue-based video transcoding service. Upload a video, track its processing in real time, and play it back via adaptive HLS streaming.

## Features

- Async video processing queue powered by Bull + Redis
- FFmpeg transcoding to HLS with 720p and 480p variants
- Adaptive bitrate streaming via a single `master.m3u8` playlist
- Real-time status updates over Server-Sent Events (SSE)
- Auto-retry on failure (up to 3 attempts with exponential backoff)
- Pending jobs resume automatically after server restart
- SQLite for job metadata persistence
- REST API for upload, status polling and HLS streaming

## Quick Start — Docker (Recommended)

> Requires: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/satishd01/vedeoprocessingtask.git
cd vedeoprocessingtask
docker-compose up --build
```

Open **http://localhost:3000** in your browser.

## Quick Start — Manual

> Requires: Node.js 18+, Redis, FFmpeg

```bash
git clone https://github.com/satishd01/vedeoprocessingtask.git
cd vedeoprocessingtask

cp .env.example .env
# Edit .env → set REDIS_URL=redis://localhost:6379

npm install
npm run dev
```

## API Reference

### Upload a video
```
POST /api/upload
Content-Type: multipart/form-data
Body: video (file field)

Response 202:
{
  "videoId": "uuid",
  "status": "queued",
  "queuePosition": 1
}
```

### Get video status
```
GET /api/videos/:id

Response:
{
  "id": "uuid",
  "filename": "sample.mp4",
  "status": "processing",       // uploaded | queued | processing | completed | failed
  "progress": 45,
  "queue_position": 1,
  "estimatedSeconds": 120
}
```

### Live status stream (SSE)
```
GET /api/videos/:id/status/live

Emits: data: {"status":"processing","progress":60}
```

### Stream HLS video
```
GET /api/videos/:id/stream/master.m3u8
```

### List all videos
```
GET /api/videos
```

### Queue stats
```
GET /api/videos/queue/stats
```

### Health check
```
GET /health
```

## Project Structure

```
src/
├── index.js              # App entry point
├── config.js             # Environment config
├── db/
│   ├── database.js       # SQLite setup
│   └── videoRepository.js# DB operations
├── queue/
│   ├── videoQueue.js     # Bull queue definition
│   └── videoWorker.js    # Job processor
├── routes/
│   ├── upload.routes.js  # POST /upload
│   ├── video.routes.js   # Video + streaming endpoints
│   └── sse.routes.js     # Real-time SSE endpoint
├── services/
│   ├── ffmpegService.js  # HLS transcoding logic
│   └── sseService.js     # SSE connection manager
└── middleware/
    ├── multer.js          # File upload config
    └── errorHandler.js   # Central error handler
```

## HLS Output Structure

```
hls/{videoId}/
├── 720p/
│   ├── index.m3u8
│   └── seg000.ts, seg001.ts ...
├── 480p/
│   ├── index.m3u8
│   └── seg000.ts, seg001.ts ...
└── master.m3u8    ← play this
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `UPLOAD_DIR` | `./uploads` | Temp upload directory |
| `HLS_DIR` | `./hls` | HLS output directory |
| `MAX_CONCURRENT_JOBS` | `2` | Parallel transcoding jobs |

## Tech Stack

- **Node.js** + **Express** — HTTP server
- **Bull** — Redis-backed job queue
- **FFmpeg** (`fluent-ffmpeg`) — Video transcoding
- **SQLite** (`better-sqlite3`) — Job metadata
- **Server-Sent Events** — Real-time progress
- **Docker** + **Docker Compose** — Containerised deployment
