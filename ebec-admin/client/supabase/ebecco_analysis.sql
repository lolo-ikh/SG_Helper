-- =============================================
-- EBECO FULL CHUNK ANALYSIS
-- Run in Supabase SQL Editor → share results
-- =============================================

-- 1. DOCUMENT LIST
SELECT
  d.id, d.title, d.category, d.file_name,
  d.page_count, d.chunk_count as claimed,
  count(c.id) as actual,
  coalesce(round(avg(length(c.content))), 0) as avg_chars,
  coalesce(min(length(c.content)), 0) as min_chars,
  coalesce(max(length(c.content)), 0) as max_chars,
  coalesce(round(avg(array_length(string_to_array(c.content, ' '), 1))), 0) as avg_words,
  count(c.id) FILTER (WHERE length(c.content) < 20) as tiny_chunks,
  count(c.id) FILTER (WHERE c.fts IS NULL) as null_fts
FROM ebecco_documents d
LEFT JOIN ebecco_chunks c ON c.document_id = d.id
GROUP BY d.id ORDER BY d.id;

-- 2. GLOBAL SUMMARY
SELECT
  (SELECT count(*) FROM ebecco_documents) as total_docs,
  (SELECT count(*) FROM ebecco_chunks) as total_chunks,
  (SELECT count(*) FROM ebecco_chunks WHERE fts IS NULL) as null_fts_count,
  (SELECT round(avg(length(content)))::int FROM ebecco_chunks) as avg_chars,
  (SELECT min(length(content)) FROM ebecco_chunks) as min_chars,
  (SELECT max(length(content)) FROM ebecco_chunks) as max_chars,
  (SELECT round(avg(array_length(string_to_array(content, ' '), 1)))::int FROM ebecco_chunks) as avg_words;

-- 3. WORD COUNT DISTRIBUTION
SELECT
  CASE
    WHEN array_length(string_to_array(content, ' '), 1) < 20 THEN 'A: <20w'
    WHEN array_length(string_to_array(content, ' '), 1) < 50 THEN 'B: 20-50w'
    WHEN array_length(string_to_array(content, ' '), 1) < 100 THEN 'C: 50-100w'
    WHEN array_length(string_to_array(content, ' '), 1) < 200 THEN 'D: 100-200w'
    ELSE 'E: >200w'
  END as bucket,
  count(*) as chunks,
  round(100.0 * count(*) / (SELECT count(*) FROM ebecco_chunks), 1) as pct
FROM ebecco_chunks GROUP BY 1 ORDER BY 1;

-- 4. CHUNK SIZE DISTRIBUTION (chars)
SELECT
  CASE
    WHEN length(content) < 100 THEN 'A: <100ch'
    WHEN length(content) < 300 THEN 'B: 100-300ch'
    WHEN length(content) < 600 THEN 'C: 300-600ch'
    WHEN length(content) < 1000 THEN 'D: 600-1000ch'
    ELSE 'E: >1000ch'
  END as bucket,
  count(*) as chunks,
  round(100.0 * count(*) / (SELECT count(*) FROM ebecco_chunks), 1) as pct
FROM ebecco_chunks GROUP BY 1 ORDER BY 1;

-- 5. PAGE DISTRIBUTION PER DOC
SELECT document_id, page_number, count(*) as chunks_on_page
FROM ebecco_chunks GROUP BY document_id, page_number ORDER BY document_id, page_number;

-- 6. OVERLAP ANALYSIS (consecutive chunks sharing 3+ words)
WITH ordered AS (
  SELECT document_id, chunk_index, content,
    lag(content) OVER (PARTITION BY document_id ORDER BY chunk_index) as prev
  FROM ebecco_chunks
),
overlap_calc AS (
  SELECT document_id, chunk_index,
    (SELECT count(*) FROM unnest(string_to_array(lower(prev), ' ')) a
     JOIN unnest(string_to_array(lower(content), ' ')) b ON a = b
     WHERE length(a) > 3) as shared
  FROM ordered WHERE prev IS NOT NULL
)
SELECT
  document_id,
  count(*) as pairs,
  count(*) FILTER (WHERE shared >= 3) as overlapping,
  round(100.0 * count(*) FILTER (WHERE shared >= 3) / greatest(count(*), 1), 1) as overlap_pct,
  round(avg(shared), 1) as avg_shared
FROM overlap_calc GROUP BY document_id ORDER BY document_id;

-- 7. SAMPLE CHUNKS (3 per doc)
SELECT document_id, chunk_index, page_number, length(content) as chars,
  left(content, 300) as preview
FROM ebecco_chunks
WHERE chunk_index IN (0, 1, 2)
ORDER BY document_id, chunk_index;

-- 8. SEARCH ACCURACY TEST
SELECT 'meeting' as query, (SELECT count(*) FROM search_ebecco('meeting', 5)) as results
UNION ALL
SELECT 'budget', (SELECT count(*) FROM search_ebecco('budget', 5))
UNION ALL
SELECT 'event', (SELECT count(*) FROM search_ebecco('event', 5))
UNION ALL
SELECT 'report', (SELECT count(*) FROM search_ebecco('report', 5))
UNION ALL
SELECT 'EBEC', (SELECT count(*) FROM search_ebecco('EBEC', 5))
UNION ALL
SELECT 'member', (SELECT count(*) FROM search_ebecco('member', 5))
UNION ALL
SELECT 'association', (SELECT count(*) FROM search_ebecco('association', 5))
UNION ALL
SELECT 'reunion', (SELECT count(*) FROM search_ebecco('reunion', 5));
