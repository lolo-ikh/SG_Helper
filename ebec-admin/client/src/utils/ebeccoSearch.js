import { supabase } from '../lib/supabase';

const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','i','me','my','we','our','you','your','he','him','his','she','her','it','its','they','them','their','what','which','who','whom','where','when','why','how','in','on','at','to','for','of','with','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','that','this','these','those','and','but','or','nor','not','so','if']);

function extractKeywords(query) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

export async function searchDocuments(query, limit = 10) {
  if (!query || !query.trim()) return [];

  const trimmed = query.trim();
  const keywords = extractKeywords(trimmed);

  // 1. Try FTS via RPC (OR-based)
  const { data, error } = await supabase.rpc('search_ebecco', {
    query_text: trimmed,
    match_count: limit,
  });

  if (!error && data && data.length > 0) {
    return data;
  }

  if (error) {
    console.warn('[EBECO] RPC search failed, falling back to LIKE:', error.message);
  }

  // 2. Fallback: LIKE search with individual keywords (OR logic)
  if (keywords.length > 0) {
    const orFilters = keywords.map(kw => `content.ilike.%${kw}%`);
    const { data: likeChunks, error: likeErr } = await supabase
      .from('ebecco_chunks')
      .select('id, document_id, content, page_number')
      .or(orFilters.join(','))
      .limit(limit);

    if (!likeErr && likeChunks && likeChunks.length > 0) {
      const docIds = [...new Set(likeChunks.map(c => c.document_id))];
      const { data: docs } = await supabase
        .from('ebecco_documents')
        .select('id, title, category')
        .in('id', docIds);

      const docMap = {};
      (docs || []).forEach(d => { docMap[d.id] = d; });

      // Rank by number of keyword matches
      return likeChunks
        .map(row => {
          const lower = row.content.toLowerCase();
          const matchCount = keywords.filter(kw => lower.includes(kw)).length;
          return {
            chunk_id: row.id,
            document_id: row.document_id,
            document_title: docMap[row.document_id]?.title || 'Unknown',
            document_category: docMap[row.document_id]?.category || 'general',
            chunk_content: row.content,
            page_number: row.page_number,
            rank: matchCount / keywords.length,
          };
        })
        .sort((a, b) => b.rank - a.rank);
    }
  }

  // 3. Last resort: search by document title
  if (keywords.length > 0) {
    const orTitleFilters = keywords.map(kw => `title.ilike.%${kw}%`);
    const { data: titleData } = await supabase
      .from('ebecco_documents')
      .select('id, title, category')
      .or(orTitleFilters.join(','))
      .limit(3);

    if (titleData && titleData.length > 0) {
      const docIds = titleData.map(d => d.id);
      const { data: titleChunks } = await supabase
        .from('ebecco_chunks')
        .select('id, document_id, content, page_number')
        .in('document_id', docIds)
        .limit(limit);

      if (titleChunks && titleChunks.length > 0) {
        return titleChunks.map(row => {
          const doc = titleData.find(d => d.id === row.document_id);
          return {
            chunk_id: row.id,
            document_id: row.document_id,
            document_title: doc?.title || 'Unknown',
            document_category: doc?.category || 'general',
            chunk_content: row.content,
            page_number: row.page_number,
            rank: 1,
          };
        });
      }
    }
  }

  return [];
}

export async function getDocumentChunks(documentId) {
  const { data, error } = await supabase
    .from('ebecco_chunks')
    .select('id, chunk_index, content, page_number')
    .eq('document_id', documentId)
    .order('chunk_index');

  if (error) {
    console.error('[EBECO] Chunk load failed:', error.message);
    return [];
  }

  return data || [];
}
