const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const VARIANTS = [
  { name: '720p', resolution: '1280x720', bitrate: '3000k', audioBitrate: '128k', bandwidth: 3000000 },
  { name: '480p', resolution: '854x480',  bitrate: '1500k', audioBitrate: '96k',  bandwidth: 1500000 },
];

function transcodeVariant(inputPath, outputDir, variant, progressCallback, variantIndex, totalVariants) {
  return new Promise((resolve, reject) => {
    const variantDir = path.join(outputDir, variant.name);
    fs.mkdirSync(variantDir, { recursive: true });

    const playlistPath = path.join(variantDir, 'index.m3u8');
    const segmentPattern = path.join(variantDir, 'seg%03d.ts');

    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size(variant.resolution)
      .videoBitrate(variant.bitrate)
      .audioBitrate(variant.audioBitrate)
      .addOutputOption('-hls_time', '6')
      .addOutputOption('-hls_playlist_type', 'vod')
      .addOutputOption('-hls_segment_filename', segmentPattern)
      .addOutputOption('-preset', 'fast')
      .addOutputOption('-movflags', '+faststart')
      .output(playlistPath)
      .on('progress', (p) => {
        const variantBase = (variantIndex / totalVariants) * 100;
        const variantShare = (1 / totalVariants) * 100;
        const overall = Math.round(variantBase + (p.percent || 0) * (variantShare / 100));
        progressCallback(Math.min(overall, 99));
      })
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

function generateMasterPlaylist(outputDir) {
  const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];

  VARIANTS.forEach((v) => {
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${v.bandwidth},RESOLUTION=${v.resolution}`);
    lines.push(`${v.name}/index.m3u8`);
  });

  fs.writeFileSync(path.join(outputDir, 'master.m3u8'), lines.join('\n'));
}

async function transcodeToHLS(inputPath, outputDir, progressCallback) {
  fs.mkdirSync(outputDir, { recursive: true });

  for (let i = 0; i < VARIANTS.length; i++) {
    await transcodeVariant(inputPath, outputDir, VARIANTS[i], progressCallback, i, VARIANTS.length);
  }

  generateMasterPlaylist(outputDir);
}

module.exports = { transcodeToHLS };
