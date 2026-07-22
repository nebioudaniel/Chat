FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY --from=builder /app .
RUN npm prune --production
EXPOSE 3001
USER node
CMD ["dumb-init", "node", "src/index.js"]
