# syntax=docker/dockerfile:1

FROM node:lts-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM deps AS dev
EXPOSE 3001
CMD ["sh", "-c", "npm install && npm run dev"]

FROM deps AS builder
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
EXPOSE 3001
CMD ["node", "dist/app.js"]
