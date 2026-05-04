-- Migration to add Vector Search capabilities for Turso
-- Run this against your Turso database using: turso db shell <db-name> < turso_vector_migration.sql

-- Enable the vector extension (if not already enabled)
-- Note: Turso usually has this enabled by default on new databases, but good to check docs.

-- Add embedding column to users table
-- We use F32_BLOB for vector storage in standard SQLite/Turso if using the vector extension
-- The dimension is 1536 (OpenAI default)
ALTER TABLE users ADD COLUMN embedding F32_BLOB(1536);

-- Add embedding column to projects table
ALTER TABLE projects ADD COLUMN embedding F32_BLOB(1536);

-- Create vector index for users (freelancers)
-- This allows for fast approximate nearest neighbor search
CREATE INDEX idx_users_embedding ON users(libsql_vector_idx(embedding));

-- Create vector index for projects
CREATE INDEX idx_projects_embedding ON projects(libsql_vector_idx(embedding));

-- Verify columns
SELECT name, type FROM pragma_table_info('users') WHERE name = 'embedding';
