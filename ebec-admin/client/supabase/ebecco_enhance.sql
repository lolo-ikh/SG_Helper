-- Add summary and keywords columns to ebecco_chunks
ALTER TABLE ebecco_chunks ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE ebecco_chunks ADD COLUMN IF NOT EXISTS keywords text;

-- Update FTS to include summary and keywords
DROP FUNCTION IF EXISTS search_ebecco(text, int);

CREATE FUNCTION search_ebecco(query_text text, match_count int DEFAULT 10)
RETURNS TABLE (
  chunk_id bigint,
  document_id bigint,
  document_title text,
  document_category text,
  chunk_content text,
  chunk_summary text,
  chunk_keywords text,
  page_number int,
  rank real
) AS $$
DECLARE
  or_query tsquery;
BEGIN
  SELECT string_agg(lexeme, ' | ')::tsquery INTO or_query
  FROM ts_debug('simple', query_text)
  WHERE token != '' AND array_length(regexp_split_to_array(token, '\s+'), 1) > 0;

  IF or_query IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    d.title AS document_title,
    d.category AS document_category,
    c.content AS chunk_content,
    c.summary AS chunk_summary,
    c.keywords AS chunk_keywords,
    c.page_number,
    GREATEST(
      ts_rank_cd(c.fts, or_query),
      CASE WHEN c.summary IS NOT NULL THEN ts_rank_cd(to_tsvector('simple', c.summary), or_query) ELSE 0 END,
      CASE WHEN c.keywords IS NOT NULL THEN ts_rank_cd(to_tsvector('simple', c.keywords), or_query) ELSE 0 END
    )::real AS rank
  FROM ebecco_chunks c
  JOIN ebecco_documents d ON d.id = c.document_id
  WHERE c.fts @@ or_query
     OR (c.summary IS NOT NULL AND to_tsvector('simple', c.summary) @@ or_query)
     OR (c.keywords IS NOT NULL AND to_tsvector('simple', c.keywords) @@ or_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_ebecco(text, int) TO authenticated;
