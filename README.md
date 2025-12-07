# Knowledge Base Search

A semantic search application using vector embeddings for intelligent content discovery. Built to be adaptable across industries and domains.

## Features

- Semantic search with vector embeddings
- Multi-content type support
- Feedback system with helpfulness tracking
- Analytics and search insights
- Responsive design

## Tech Stack

- Next.js 16, React 19
- PostgreSQL with pgvector
- Hugging Face Transformers (local embeddings)
- TypeScript, Tailwind CSS
- Docker

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   
   Create `.env.local`:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/isp_support
   ```

3. **Start database**
   ```bash
   npm run docker:up
   ```

4. **Setup database**
   ```bash
   npm run setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run setup` - Setup database (migrations + seeding)
- `npm run build` - Build for production

## How It Works

User queries are converted to vector embeddings and matched against pre-computed content embeddings using cosine similarity. Results are ranked by similarity and user feedback.

## Requirements

- Node.js 18+
- Docker and Docker Compose
