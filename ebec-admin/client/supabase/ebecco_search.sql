-- EBECO Full-Text Search RPC
-- Run this in Supabase SQL Editor

-- 1. Add FTS vectors to tables
ALTER TABLE ebecco_documents ADD COLUMN IF NOT EXISTS fts tsvector;
ALTER TABLE ebecco_chunks ADD COLUMN IF NOT EXISTS fts tsvector;

-- 2. Populate FTS for existing data (simple dict = no stemming, works for any language)
UPDATE ebecco_documents SET fts = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(file_name, ''));
UPDATE ebecco_chunks SET fts = to_tsvector('simple', coalesce(content, ''));

-- 3. Create GIN indexes for fast search
CREATE INDEX IF NOT EXISTS idx_ebecco_documents_fts ON ebecco_documents USING gin(fts);
CREATE INDEX IF NOT EXISTS idx_ebecco_chunks_fts ON ebecco_chunks USING gin(fts);

-- 4. Auto-update FTS on insert/update
CREATE OR REPLACE FUNCTION ebecco_documents_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.file_name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ebecco_documents_fts_trigger ON ebecco_documents;
CREATE TRIGGER ebecco_documents_fts_trigger BEFORE INSERT OR UPDATE ON ebecco_documents
  FOR EACH ROW EXECUTE FUNCTION ebecco_documents_fts_update();

CREATE OR REPLACE FUNCTION ebecco_chunks_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('simple', coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ebecco_chunks_fts_trigger ON ebecco_chunks;
CREATE TRIGGER ebecco_chunks_fts_trigger BEFORE INSERT OR UPDATE ON ebecco_chunks
  FOR EACH ROW EXECUTE FUNCTION ebecco_chunks_fts_update();

-- 5. Search RPC function — OR-based matching with ranking
DROP FUNCTION IF EXISTS search_ebecco(text, int);

CREATE FUNCTION search_ebecco(query_text text, match_count int DEFAULT 10)
RETURNS TABLE (
  chunk_id bigint,
  document_id bigint,
  document_title text,
  document_category text,
  chunk_content text,
  page_number int,
  rank real
) AS $$
DECLARE
  or_query tsquery;
BEGIN
  or_query := plainto_tsquery('simple', query_text);

  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    d.title AS document_title,
    d.category AS document_category,
    c.content AS chunk_content,
    c.page_number,
    ts_rank_cd(c.fts, or_query)::real AS rank
  FROM ebecco_chunks c
  JOIN ebecco_documents d ON d.id = c.document_id
  WHERE c.fts @@ or_query
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant access
GRANT EXECUTE ON FUNCTION search_ebecco(text, int) TO authenticated;
