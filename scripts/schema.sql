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

-- Create feedback table to track user ratings
CREATE TABLE IF NOT EXISTS isp_support.feedback (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    scenario_id INTEGER NOT NULL REFERENCES isp_support.scenarios(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating IN (-1, 1)),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS feedback_scenario_id_idx ON isp_support.feedback(scenario_id);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON isp_support.feedback(created_at);
