# ISP Support Chat Tool (Prototype)

## Overview

A simple Next.js prototype application that uses semantic search to match user troubleshooting queries against a knowledge base of ISP scenarios. Designed to be generalizable for any ISP type, with initial prototype focused on FTTH/MSR (Multi-Service Router) scenarios. Users input troubleshooting queries (e.g., "light on router is red") and receive the top 5 most similar scenarios. Uses transformers.js for embeddings and PostgreSQL with pgvector for vector similarity search. Styled with Tailwind CSS for a minimal, clean interface.

**Note**: This is a prototype for company use, but architected to be adaptable for any ISP's knowledge base.

## Architecture

- **Frontend**: Next.js app with simple chat-like text input interface (Tailwind CSS)
- **Backend**: Next.js API routes for embedding generation and similarity search
- **Database**: PostgreSQL with pgvector extension (Dockerized)
- **Embeddings**: transformers.js (Hugging Face models) running locally
- **Vector Search**: pgvector cosine similarity

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your database credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your database connection string:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/isp_support
```

### 3. Start Docker Database

Start the PostgreSQL container with pgvector:

```bash
npm run docker:up
```

This will:

- Start PostgreSQL 16 with pgvector extension
- Create the database `isp_support`
- Enable the pgvector extension automatically

### 4. Create Database Schema

Connect to the database and run the schema script:

```bash
# Using psql (if installed)
psql postgresql://postgres:postgres@localhost:5432/isp_support -f scripts/schema.sql

# Or using Docker
docker exec -i isp-support-db psql -U postgres -d isp_support < scripts/schema.sql
```

### 5. Seed the Database

Populate the database with sample scenarios:

```bash
npm run seed
```

This will:

- Generate embeddings for all sample scenarios
- Insert them into the database
- Display progress as it processes each scenario

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

1. **Start Docker database**: `npm run docker:up`
2. **Run development server**: `npm run dev`
3. **Make changes** to code (hot reload enabled)
4. **Test search functionality** in the browser
5. **Stop Docker database**: `npm run docker:down` (when done)

## Customizing for Different ISPs

### Seed Data Format

The seed data is structured as an array of objects with `title` and `description` fields. To customize for a different ISP:

1. Open `scripts/seed.ts`
2. Replace the `scenarios` array with your ISP's troubleshooting scenarios
3. Each scenario should follow this format:

```typescript
{
    title: "Short descriptive title",
    description: "Detailed description of the troubleshooting scenario, including symptoms, possible causes, and resolution steps."
}
```

4. Run `npm run seed` to regenerate embeddings and update the database

### Example Customization

```typescript
const scenarios = [
  {
    title: 'Cable Modem Signal Issues',
    description:
      'User reports frequent disconnections. Check signal levels, verify cable connections, and test with different modem if available.',
  },
  // ... more scenarios
]
```

### Database Schema

The database schema is ISP-agnostic and only requires:

- `title`: Short scenario title
- `description`: Detailed scenario description
- `embedding`: Vector embedding (automatically generated)

No ISP-specific fields are required, making it easy to adapt for any ISP type.

## Environment Variables

| Variable       | Description                  | Example                                        |
| -------------- | ---------------------------- | ---------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run seed` - Seed database with sample scenarios

## Technical Details

- **Embedding Model**: `Xenova/all-MiniLM-L6-v2` (384 dimensions)
- **Pipeline Type**: `feature-extraction` for generating embeddings
- **Vector Type**: `vector(384)` in PostgreSQL
- **Similarity Metric**: Cosine distance (`<=>` operator)
- **Search Limit**: Top 5 results
- **Embedding Generation**: Server-side in API routes using transformers.js
- **Framework**: Next.js 16 with App Router

## Project Structure

```
/app
  /api/search/route.ts    # Search API endpoint
  /page.tsx                # Main UI component
  /layout.tsx              # Root layout
/lib
  /embeddings.ts           # Embedding generation service
  /db.ts                   # Database connection and queries
/scripts
  /schema.sql              # Database schema
  /init-db.sql             # Database initialization
  /seed.ts                 # Seed data script
docker-compose.yml         # Docker configuration
.env.local.example         # Environment variables template
```

## Troubleshooting

### Database Connection Issues

- Ensure Docker container is running: `docker ps`
- Check database credentials in `.env.local`
- Verify port 5432 is not in use by another service

### Embedding Generation Errors

- Ensure `@huggingface/transformers` is installed
- Check that model can download (first run downloads the model)
- Verify Next.js config includes `serverComponentsExternalPackages`

### No Search Results

- Ensure database is seeded: `npm run seed`
- Check that scenarios exist in database
- Verify embeddings were generated correctly

## License

Internal prototype for company use.
