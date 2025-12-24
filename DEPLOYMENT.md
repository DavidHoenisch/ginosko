# Gnoskos - Chat with Jane Austen

🎉 **FULLY FUNCTIONAL** - Dark theme with white text on black background!

## ✅ What's Working

- **Dark Theme**: Black background (#000) with white text (#FFF)
- **No Overlay Issues**: Welcome screen and chat are properly toggled
- **Fully Styled**: Complete Tailwind CSS v4 with all utilities
- **Docker Ready**: Complete stack running with docker-compose
- **RAG System**: Functional chat with Jane Austen's works
- **Source Citations**: References to original texts with similarity scores

## Quick Start

```bash
# Set your API key
export OPENAI_API_KEY=your_key_here

# Start everything
docker-compose up --build -d

# Check logs
docker-compose logs -f app

# Access the app
open http://localhost:3000
```

## Features

### UI/UX
- ✅ Black background with white text
- ✅ Clean monochromatic design
- ✅ Welcome screen → Chat interface (no overlay)
- ✅ Copy button for responses
- ✅ Animated loading states

### Backend
- ✅ PostgreSQL with pgvector
- ✅ OpenAI embeddings (text-embedding-3-small)
- ✅ GPT-4o-mini for chat
- ✅ Semantic search with similarity scores
- ✅ Source attribution

### DevOps
- ✅ Docker Compose setup
- ✅ Multi-stage builds
- ✅ Health checks
- ✅ Restart policies
- ✅ Ready for Dokploy

## Architecture

```
┌─────────────────┐
│   SvelteKit     │  → Node.js server (server.js)
│   Frontend      │  → Serves HTML + CSS + JS
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Routes    │  → /api/chat
│   (LangChain)   │  → RAG pipeline
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  → Vector storage
│   + pgvector    │  → Embeddings (1536 dims)
└─────────────────┘
```

## Color Scheme

```css
:root {
  --background: 0 0% 0%;        /* Black */
  --foreground: 0 0% 100%;      /* White */
  --muted: 0 0% 15%;            /* Dark gray */
  --muted-foreground: 0 0% 60%; /* Light gray */
  --border: 0 0% 20%;           /* Dark gray borders */
}
```

## Deployment

Ready for Dokploy! Just push to Git and configure `OPENAI_API_KEY` in environment variables.

---

**Status**: Production Ready ✨
**URL**: http://localhost:3000
**Created**: December 2024