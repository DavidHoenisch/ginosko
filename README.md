# Gnoskos - Chat with Jane Austen

An AI-powered chat application for exploring Jane Austen's literary works through conversation.

## Features

- **RAG-based Chat**: Ask questions about Jane Austen's novels and get answers based on the actual text
- **Source Citation**: Every answer includes references to the specific works and passages
- **Modern UI**: Clean, monochromatic design built with SvelteKit and Shadcn components
- **Copy Functionality**: Easily copy responses for reference
- **Session Management**: Conversations persist until page refresh

## Setup

### Option 1: Local Development

1. **Install dependencies**:
   ```bash
   npm install
   cd cli && npm install
   ```

2. **Set up the database**:
   ```bash
   docker-compose up -d postgres
   ```

3. **Configure environment variables**:

   Create `.env` in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://postgres:password@localhost:5432/gnoskos
   ```

   Create `cli/.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://postgres:password@localhost:5432/gnoskos
   ```

4. **Process Jane Austen's works**:
   ```bash
   cd cli
   npm start process
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

### Option 2: Docker Compose (Production/Deployment)

1. **Set environment variables**:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Run the entire stack**:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL with pgvector
   - Process Jane Austen's works with the CLI tool (runs once and exits)
   - Build and start the SvelteKit app

3. **Access the application**:
   - App: http://localhost:3000
   - Database: localhost:5432

#### Docker Compose Services

- **postgres**: PostgreSQL database with pgvector extension
- **cli**: One-time data processing service that populates the vector database
- **app**: The SvelteKit web application

#### Development Override

For development with hot reloading, create a `docker-compose.override.yml` file:

```yaml
version: '3.8'

services:
  app:
    command: ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

Then run: `docker-compose up --build`

#### Troubleshooting

If you encounter issues with the CLI not connecting to the database, ensure the services are properly networked. The CLI waits for the postgres service to be healthy before running.

To reset the database and reprocess the texts:
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build
```

## Architecture

- **Frontend**: SvelteKit with Shadcn UI components
- **Backend**: SvelteKit API routes
- **Database**: PostgreSQL with pgvector extension
- **AI**: OpenAI GPT-4 for chat, text-embedding-3-small for embeddings
- **Vector Search**: pgvector for similarity search

## CLI Tool

The CLI tool (`cli/`) processes Jane Austen's works:

- Downloads/extracts text from novels
- Splits text into chunks
- Generates embeddings
- Stores vectors in pgvector

## API

- `POST /api/chat`: Send a message and receive an AI response with sources

## Environment Variables

The application requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key for embeddings and chat
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:password@postgres:5432/gnoskos`)

## Deployment to Dokploy

To deploy to Dokploy:

1. **Push your code to a Git repository**
2. **In Dokploy, create a new application** and connect it to your repository
3. **Set environment variables** in Dokploy:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DATABASE_URL`: Configure based on your Dokploy database setup
4. **Use the Docker Compose configuration** - Dokploy supports docker-compose.yml files
5. **Deploy** - Dokploy will build and deploy all services

## Technologies Used

- SvelteKit
- Tailwind CSS
- Shadcn Svelte
- LangChain
- OpenAI
- PostgreSQL
- pgvector
- Docker
