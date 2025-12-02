-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create dedicated schema for ISP support tool
CREATE SCHEMA IF NOT EXISTS isp_support;

-- Create scenarios table in dedicated schema
CREATE TABLE IF NOT EXISTS isp_support.scenarios (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on embedding column for efficient similarity search
CREATE INDEX IF NOT EXISTS scenarios_embedding_idx ON isp_support.scenarios 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
