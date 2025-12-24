FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built app from SvelteKit output
COPY --from=builder /app/.svelte-kit/output ./.svelte-kit/output
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the app
CMD ["node", "server.js"]