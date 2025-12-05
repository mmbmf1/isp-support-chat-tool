-- Complete database migration for all knowledge base types
-- This migration is idempotent and can be run multiple times safely

-- Add type column to scenarios table (if not exists)
ALTER TABLE isp_support.scenarios 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'scenario';

-- Add metadata column for knowledge base specific fields (if not exists)
ALTER TABLE isp_support.scenarios 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Drop existing constraint if it exists
ALTER TABLE isp_support.scenarios 
DROP CONSTRAINT IF EXISTS scenarios_type_check;

-- Add constraint with all knowledge base types
ALTER TABLE isp_support.scenarios 
ADD CONSTRAINT scenarios_type_check 
CHECK (type IN ('scenario', 'work_order', 'equipment', 'outage', 'policy', 'reference', 'subscriber'));

-- Create index on type for filtering (if not exists)
CREATE INDEX IF NOT EXISTS scenarios_type_idx ON isp_support.scenarios(type);

-- Create index on metadata for queries (if not exists)
CREATE INDEX IF NOT EXISTS scenarios_metadata_idx ON isp_support.scenarios USING GIN(metadata);
