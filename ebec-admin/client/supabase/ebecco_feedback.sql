-- ebecco_feedback: tracks user interactions with search results
-- Used to boost ranking of chunks that users actually click

CREATE TABLE IF NOT EXISTS ebecco_feedback (
  id BIGSERIAL PRIMARY KEY,
  chunk_id BIGINT NOT NULL REFERENCES ebecco_chunks(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'click',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: authenticated users can insert, anyone can read counts
ALTER TABLE ebecco_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feedback counts"
  ON ebecco_feedback FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert feedback"
  ON ebecco_feedback FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Index for fast lookups by chunk_id
CREATE INDEX IF NOT EXISTS idx_ebecco_feedback_chunk ON ebecco_feedback(chunk_id);

-- RPC: get click counts for chunks (used by search ranking)
CREATE OR REPLACE FUNCTION get_chunk_click_counts(chunk_ids BIGINT[])
RETURNS TABLE (chunk_id BIGINT, click_count BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT f.chunk_id, COUNT(*) as click_count
  FROM ebecco_feedback f
  WHERE f.chunk_id = ANY(chunk_ids)
    AND f.created_at > NOW() - INTERVAL '90 days'
  GROUP BY f.chunk_id;
$$;

-- Auto-cleanup: delete feedback older than 90 days (run via pg_cron or manual)
-- For now, the WHERE clause in get_chunk_click_counts handles this.
