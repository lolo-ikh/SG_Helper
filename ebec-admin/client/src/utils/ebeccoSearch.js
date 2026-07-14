import { supabase } from '../lib/supabase';
import { embedText } from './ebeccoEmbed';

const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','i','me','my','we','our','you','your','he','him','his','she','her','it','its','they','them','their','what','which','who','whom','where','when','why','how','in','on','at','to','for','of','with','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','that','this','these','those','and','but','or','nor','not','so','if']);

const CATEGORY_WEIGHT = {
  admin_doc: 1.6,
  presentation: 1.3,
  meeting_report: 1.0,
  general: 0.8,
};

const GENERIC_WORDS = new Set(['role','roles','responsibility','responsibilities','team','document','documents','meeting','report','reports','about','tell','know','does','doing']);

function extractQueryParts(query) {
  const words = query.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const nameWords = [];
  const topicWords = [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (STOP_WORDS.has(lower) || lower.length < 2) continue;
    if (GENERIC_WORDS.has(lower)) continue;
    if (/^[A-Z]/.test(w) && w.length > 1) {
      nameWords.push(lower);
    } else if (!STOP_WORDS.has(lower) && !GENERIC_WORDS.has(lower)) {
      topicWords.push(lower);
    }
  }
  return { nameWords, topicWords, allKeywords: [...new Set([...nameWords, ...topicWords])] };
}

function normalizeResult(row) {
  return {
    chunk_id: row.chunk_id || row.id,
    document_id: row.document_id,
    document_title: row.document_title || row.title || 'Unknown',
    document_category: row.document_category || row.category || 'general',
    chunk_content: row.chunk_content || row.content,
    chunk_summary: row.chunk_summary || row.summary || null,
    page_number: row.page_number,
    rank: row.rank || row.similarity || 0,
  };
}

export async function searchDocuments(query, limit = 10) {
  if (!query || !query.trim()) return [];

  const trimmed = query.trim();
  const { nameWords, topicWords, allKeywords } = extractQueryParts(trimmed);
  const hasNames = nameWords.length > 0;
  const seen = new Set();
  const merged = [];

  const addResults = (results) => {
    for (const r of results) {
      const id = r.chunk_id || r.id;
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(r);
      }
    }
  };

  const scoreChunk = (content) => {
    const lower = content.toLowerCase();
    const nameHits = nameWords.filter(kw => lower.includes(kw)).length;
    const topicHits = topicWords.filter(kw => lower.includes(kw)).length;
    const nameScore = hasNames ? (nameHits / nameWords.length) * 2 : 0;
    const topicScore = topicWords.length > 0 ? (topicHits / topicWords.length) : (allKeywords.length > 0 ? allKeywords.filter(kw => lower.includes(kw)).length / allKeywords.length : 0);
    return nameScore + topicScore;
  };

  // Tier 0: Semantic search via client-side embedding + pgvector RPC
  try {
    const embedding = await embedText(trimmed);
    if (embedding && embedding.length === 384) {
      const vecStr = `[${embedding.join(',')}]`;
      const { data, error } = await supabase.rpc('search_ebecco_semantic', {
        query_embedding: vecStr,
        match_count: limit,
      });
      if (!error && data && data.length > 0) {
        console.log(`[EBECO] Semantic search returned ${data.length} results`);
        addResults(data.map(normalizeResult));
      }
    }
  } catch (err) {
    console.warn('[EBECO] Semantic search unavailable, falling back to FTS:', err.message);
  }

  // Tier 1: FTS via RPC (OR-based)
  try {
    const { data, error } = await supabase.rpc('search_ebecco', {
      query_text: trimmed,
      match_count: limit,
    });
    if (!error && data && data.length > 0) {
      addResults(data.map(normalizeResult));
    }
  } catch (err) {
    console.warn('[EBECO] RPC search failed:', err.message);
  }

  // Tier 2: LIKE search — AND for names, OR for topics
  if (allKeywords.length > 0) {
    try {
      let filters;
      if (hasNames) {
        // Require ALL name words to match (AND), then any topic word (OR)
        const nameFilter = nameWords.map(kw => `content.ilike.%${kw}%`);
        const topicFilter = topicWords.map(kw => `content.ilike.%${kw}%`);
        filters = nameFilter;
        if (topicFilter.length > 0) {
          filters.push(`and(${topicFilter.join(',')}),(${nameFilter.join(',')})`);
        }
        // Simple AND: all name words must be present
        filters = nameWords.map(kw => `content.ilike.%${kw}%`);
      } else {
        filters = allKeywords.map(kw => `content.ilike.%${kw}%`);
      }

      const { data: likeChunks, error: likeErr } = await supabase
        .from('ebecco_chunks')
        .select('id, document_id, content, page_number')
        .or(filters.join(','))
        .limit(hasNames ? 20 : limit);

      if (!likeErr && likeChunks && likeChunks.length > 0) {
        const docIds = [...new Set(likeChunks.map(c => c.document_id))];
        const { data: docs } = await supabase
          .from('ebecco_documents')
          .select('id, title, category')
          .in('id', docIds);

        const docMap = {};
        (docs || []).forEach(d => { docMap[d.id] = d; });

        const scored = likeChunks.map(row => ({
          chunk_id: row.id,
          document_id: row.document_id,
          document_title: docMap[row.document_id]?.title || 'Unknown',
          document_category: docMap[row.document_id]?.category || 'general',
          chunk_content: row.content,
          page_number: row.page_number,
          rank: scoreChunk(row.content),
        }));

        // If names present, filter to only chunks matching ALL name words
        const filtered = hasNames
          ? scored.filter(r => nameWords.every(kw => r.chunk_content.toLowerCase().includes(kw)))
          : scored;

        addResults(filtered.sort((a, b) => b.rank - a.rank).slice(0, limit));
      }
    } catch (err) {
      console.warn('[EBECO] LIKE search failed:', err.message);
    }
  }

  // Tier 3: Search by document title
  if (allKeywords.length > 0) {
    try {
      const orTitleFilters = allKeywords.map(kw => `title.ilike.%${kw}%`);
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
          addResults(titleChunks.map(row => {
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
          }));
        }
      }
    } catch (err) {
      console.warn('[EBECO] Title search failed:', err.message);
    }
  }

  console.log(`[EBECO] Merged ${merged.length} unique results from all tiers`);

  // Targeted category fetch: always run to pull additional admin_doc/presentation chunks
  const PRIORITY_CATS = ['admin_doc', 'presentation'];

  for (const cat of PRIORITY_CATS) {
    if (allKeywords.length > 0) {
      try {
        const orFilters = allKeywords.map(kw => `content.ilike.%${kw}%`);
        const { data: catChunks } = await supabase
          .from('ebecco_chunks')
          .select('id, document_id, content, page_number')
          .or(orFilters.join(','))
          .limit(20);

        if (catChunks && catChunks.length > 0) {
          const docIds = [...new Set(catChunks.map(c => c.document_id))];
          const { data: catDocs } = await supabase
            .from('ebecco_documents')
            .select('id, title, category')
            .in('id', docIds);

          const docMap = {};
          (catDocs || []).forEach(d => { docMap[d.id] = d; });

          const catResults = catChunks
            .filter(row => docMap[row.document_id]?.category === cat && !seen.has(row.id))
            .map(row => ({
              chunk_id: row.id,
              document_id: row.document_id,
              document_title: docMap[row.document_id]?.title || 'Unknown',
              document_category: cat,
              chunk_content: row.content,
              page_number: row.page_number,
              rank: scoreChunk(row.content),
            }))
            .sort((a, b) => b.rank - a.rank)
            .slice(0, 2);

          for (const r of catResults) {
            merged.push(r);
            seen.add(r.chunk_id);
          }
        }
      } catch (err) {
        console.warn(`[EBECO] Targeted ${cat} fetch failed:`, err.message);
      }
    }
  }

  // Boost by category weight
  const boosted = merged.map(r => ({
    ...r,
    rank: (r.rank || 0) * (CATEGORY_WEIGHT[r.document_category] || 1),
  }));

  // Sort by boosted rank descending
  boosted.sort((a, b) => b.rank - a.rank);

  // Diversify: ensure at least 1 result from each non-meeting_report category if available
  const byCategory = {};
  for (const r of boosted) {
    if (!byCategory[r.document_category]) byCategory[r.document_category] = [];
    byCategory[r.document_category].push(r);
  }

  const diversified = [];
  const seenIds = new Set();
  // First pass: take best from each non-meeting_report category
  for (const cat of ['admin_doc', 'presentation', 'general']) {
    if (byCategory[cat] && byCategory[cat].length > 0) {
      const best = byCategory[cat][0];
      diversified.push(best);
      seenIds.add(best.chunk_id);
    }
  }
  // Second pass: fill remaining slots from all results by rank
  for (const r of boosted) {
    if (diversified.length >= limit) break;
    if (!seenIds.has(r.chunk_id)) {
      diversified.push(r);
      seenIds.add(r.chunk_id);
    }
  }

  return diversified.slice(0, limit);
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
