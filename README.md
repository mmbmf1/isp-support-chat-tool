# Knowledge Base Search

A semantic search application that enables intelligent content discovery using vector embeddings. Built to be adaptable across industries and domains.

## Overview

This application provides semantic search capabilities for knowledge bases, allowing users to find relevant content through natural language queries. The system uses vector embeddings to understand query intent and match it with similar content, regardless of exact keyword matches.

## Features

- **Semantic Search** - Vector-based similarity search using embeddings
- **Multi-Content Types** - Support for various content types (scenarios, work orders, equipment, policies, references, etc.)
- **Feedback System** - Track helpfulness ratings to improve search quality
- **Analytics** - Search insights and usage tracking
- **Responsive Design** - Mobile-friendly interface

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **PostgreSQL** - Database with pgvector extension for vector similarity search
- **Hugging Face Transformers** - Local embedding generation (Xenova/all-MiniLM-L6-v2)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Docker** - Containerized PostgreSQL setup

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- npm or yarn

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   
   Create a `.env.local` file in the root directory:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/isp_support
   ```

3. **Start the database**
   ```bash
   npm run docker:up
   ```
   This starts PostgreSQL with pgvector extension in a Docker container.

4. **Setup the database**
   ```bash
   npm run setup
   ```
   This runs migrations and seeds initial data.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run setup` - Setup database (migrations + seeding)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## How It Works

1. **Query Processing** - User enters a natural language search query
2. **Embedding Generation** - Query is converted to a 384-dimensional vector embedding
3. **Similarity Search** - PostgreSQL pgvector performs cosine similarity search
4. **Ranking** - Results are ranked by similarity score and user feedback
5. **Feedback Loop** - User feedback improves future search results

## Architecture

The application uses a semantic search approach where:

- Content is stored in PostgreSQL with pre-computed vector embeddings
- Search queries are converted to embeddings in real-time
- Cosine similarity is used to find the most relevant matches
- User feedback is incorporated into the ranking algorithm

## Database

PostgreSQL runs in a Docker container with the pgvector extension enabled. The database persists data in a Docker volume, so your data survives container restarts.

## License

Private project.
