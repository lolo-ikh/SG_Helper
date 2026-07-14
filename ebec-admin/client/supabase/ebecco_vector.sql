-- M1: pgvector extension + semantic search
-- Run this in Supabase SQL Editor AFTER ebecco_tables.sql and ebecco_search.sql

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column (384 dims = all-MiniLM-L6-v2)
ALTER TABLE ebecco_chunks ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. HNSW index for fast cosine similarity
CREATE INDEX IF NOT EXISTS idx_ebecco_chunks_embedding
  ON ebecco_chunks USING hnsw (embedding vector_cosine_ops);

-- 4. Vector search RPC — returns chunks ordered by cosine distance
CREATE OR REPLACE FUNCTION search_ebecco_semantic(
  query_embedding vector(384),
  match_count int DEFAULT 10
)
RETURNS TABLE (
  chunk_id bigint,
  document_id bigint,
  document_title text,
  document_category text,
  chunk_content text,
  chunk_summary text,
  page_number int,
  similarity real
) AS $$
  SELECT
    c.id AS chunk_id,
    c.document_id,
    d.title AS document_title,
    d.category AS document_category,
    c.content AS chunk_content,
    c.summary AS chunk_summary,
    c.page_number,
    (1 - (c.embedding <=> query_embedding))::real AS similarity
  FROM ebecco_chunks c
  JOIN ebecco_documents d ON d.id = c.document_id
  WHERE c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_ebecco_semantic(vector(384), int) TO authenticated;
