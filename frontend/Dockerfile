# syntax=docker/dockerfile:1

FROM node:lts-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
RUN npm install

FROM deps AS dev
EXPOSE 3000
CMD ["sh", "-c", "npm install && npm run dev"]

FROM deps AS builder
COPY . .
RUN npm run build && mkdir -p /app/public

FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
