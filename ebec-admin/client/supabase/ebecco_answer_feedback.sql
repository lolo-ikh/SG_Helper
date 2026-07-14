-- ebecco_answer_feedback: like/dislike on assistant answers
-- Separate from chunk click tracking (ebecco_feedback)

CREATE TABLE IF NOT EXISTS ebecco_answer_feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  answer_summary TEXT,
  action TEXT NOT NULL CHECK (action IN ('like', 'dislike')),
  answer_chunk_ids BIGINT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ebecco_answer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own feedback"
  ON ebecco_answer_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own feedback"
  ON ebecco_answer_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own feedback"
  ON ebecco_answer_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own feedback"
  ON ebecco_answer_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- RPC: toggle like/dislike (insert or update if same query+user already has feedback)
CREATE OR REPLACE FUNCTION toggle_answer_feedback(
  p_query TEXT,
  p_action TEXT,
  p_answer_summary TEXT DEFAULT NULL,
  p_chunk_ids BIGINT[] DEFAULT '{}'
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  existing_action TEXT;
BEGIN
  SELECT action INTO existing_action
  FROM ebecco_answer_feedback
  WHERE query = p_query AND user_id = auth.uid()
  ORDER BY created_at DESC LIMIT 1;

  IF existing_action = p_action THEN
    DELETE FROM ebecco_answer_feedback
    WHERE query = p_query AND user_id = auth.uid();
    RETURN 'removed';
  ELSE
    INSERT INTO ebecco_answer_feedback (user_id, query, answer_summary, action, answer_chunk_ids)
    VALUES (auth.uid(), p_query, p_answer_summary, p_action, p_chunk_ids);
    RETURN 'inserted';
  END IF;
END;
$$;

-- RPC: get user's feedback for a query (used to show toggle state)
CREATE OR REPLACE FUNCTION get_answer_feedback(p_query TEXT)
RETURNS TABLE (action TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT eaf.action
  FROM ebecco_answer_feedback eaf
  WHERE eaf.query = p_query AND eaf.user_id = auth.uid()
  ORDER BY eaf.created_at DESC LIMIT 1;
$$;
