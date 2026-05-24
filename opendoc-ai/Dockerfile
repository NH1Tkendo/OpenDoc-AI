# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js and compile TypeScript for the socket server
RUN npm run build
RUN npx tsc socket-server.ts --outDir ./dist --esModuleInterop --skipLibCheck --target esnext

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy compiled socket server
COPY --from=builder --chown=nextjs:nodejs /app/dist/socket-server.js ./socket-server.js

# Script để chạy cả 2 process
RUN echo 'node server.js & node socket-server.js' > run.sh && chmod +x run.sh

USER nextjs

EXPOSE 3000
EXPOSE 3001

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "run.sh"]
