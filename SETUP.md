# Gnoskos - Chat with Jane Austen

✅ **FIXED: CSS Styling Issue**

The application is now fully functional with proper CSS styling!

## What Was Fixed

### Issue
- CSS file was being referenced with a relative path (`./_app/...`) instead of absolute path (`/_app/...`)
- Browser couldn't load the CSS file, resulting in unstyled pages

### Solution
Added `paths: { relative: false }` to `svelte.config.js` to force absolute paths for assets.

## Quick Start

### Docker Compose (Recommended)

1. **Set your OpenAI API key**:
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

2. **Start the stack**:
   ```bash
   docker-compose up --build
   ```

3. **Access the app**:
   - Open http://localhost:3000 in your browser
   - You should now see a fully styled interface!

The application will:
- ✅ Start PostgreSQL with pgvector
- ✅ Process Jane Austen texts (11 chunks total)
- ✅ Start the web app with proper CSS styling
- ✅ Serve static assets correctly

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Start the server**:
   ```bash
   node server.js
   ```

## Architecture

- **Frontend**: SvelteKit with Tailwind CSS and Shadcn components
- **Backend**: Custom Node.js server handling both SSR and static assets
- **Database**: PostgreSQL with pgvector
- **AI**: OpenAI GPT-4o-mini + text-embedding-3-small

## Features

✅ Monochromatic, modern UI  
✅ RAG-based chat with Jane Austen's works  
✅ Source citations with similarity scores  
✅ Copy functionality for responses  
✅ Session persistence until page refresh  
✅ Streaming-ready architecture  
✅ Docker deployment support  

## Deployment to Dokploy

1. Push code to Git repository
2. Create Dokploy application
3. Set `OPENAI_API_KEY` environment variable
4. Deploy using the `docker-compose.yml`

The app is production-ready! 🎉