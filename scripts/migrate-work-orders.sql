-- Migration to add work order support to scenarios table
-- Run this against your database to add type and metadata columns

-- Add type column to scenarios table
ALTER TABLE isp_support.scenarios 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'scenario';

-- Add check constraint for type column (only if constraint doesn't exist)
ALTER TABLE isp_support.scenarios 
DROP CONSTRAINT IF EXISTS scenarios_type_check;

ALTER TABLE isp_support.scenarios 
ADD CONSTRAINT scenarios_type_check 
CHECK (type IN ('scenario', 'work_order'));

-- Add metadata column for work order specific fields
ALTER TABLE isp_support.scenarios 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS scenarios_type_idx ON isp_support.scenarios(type);

-- Create index on metadata for work order queries
CREATE INDEX IF NOT EXISTS scenarios_metadata_idx ON isp_support.scenarios USING GIN(metadata);
