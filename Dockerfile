FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads hls

EXPOSE 3000

CMD ["node", "src/index.js"]
