# Simple Dockerfile for Next.js dev server
FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
# Use npm install to avoid lockfile sync issues in dev
RUN npm install
COPY . .
EXPOSE 3000
# Bind to 0.0.0.0 so it's reachable from host
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
