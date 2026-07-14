-- EBECO RAG Chatbot Tables
-- Run this in Supabase SQL Editor

-- 1. Document metadata
CREATE TABLE IF NOT EXISTS ebecco_documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  page_count INT DEFAULT 0,
  chunk_count INT DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Text chunks
CREATE TABLE IF NOT EXISTS ebecco_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES ebecco_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  page_number INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ebecco_chunks_doc ON ebecco_chunks(document_id);

-- 3. RLS policies
ALTER TABLE ebecco_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebecco_chunks ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "Authenticated read ebecco_documents" ON ebecco_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read ebecco_chunks" ON ebecco_chunks
  FOR SELECT TO authenticated USING (true);

-- Only authenticated can insert/update/delete
CREATE POLICY "Authenticated insert ebecco_documents" ON ebecco_documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update ebecco_documents" ON ebecco_documents
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated delete ebecco_documents" ON ebecco_documents
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated insert ebecco_chunks" ON ebecco_chunks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated delete ebecco_chunks" ON ebecco_chunks
  FOR DELETE TO authenticated USING (true);

-- 4. Storage bucket (run once)
-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: ebecco-docs
-- Public: false
-- Then run this to allow authenticated uploads:
INSERT INTO storage.buckets (id, name, public) VALUES ('ebecco-docs', 'ebecco-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies
CREATE POLICY "Authenticated upload ebecco-docs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ebecco-docs');

CREATE POLICY "Authenticated read ebecco-docs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'ebecco-docs');

CREATE POLICY "Authenticated delete ebecco-docs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'ebecco-docs');
