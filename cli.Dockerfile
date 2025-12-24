FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY cli/package*.json ./cli/

# Install dependencies
RUN cd cli && npm ci

# Copy source code
COPY cli/ ./cli/

# Copy the Jane Austen text file
COPY pg31100.txt /app/pg31100.txt

# Set working directory to cli
WORKDIR /app/cli

# Default command (can be overridden)
CMD ["npm", "start"]