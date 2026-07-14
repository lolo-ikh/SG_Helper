import { supabase } from '../lib/supabase';
import { embedBatch } from './ebeccoEmbed';

export async function enhanceChunks(documentId) {
  let embedded = 0;
  let enhanced = 0;

  // 1. Generate embeddings for chunks missing them
  try {
    const { data: chunks } = await supabase
      .from('ebecco_chunks')
      .select('id, content, summary')
      .eq('document_id', documentId)
      .is('embedding', null)
      .order('chunk_index');

    if (chunks && chunks.length > 0) {
      const BATCH = 16;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        const texts = batch.map(c => {
          const parts = [];
          if (c.summary) parts.push(c.summary);
          parts.push(c.content);
          return parts.join(' ');
        });

        const embeddings = await embedBatch(texts);
        if (!embeddings) continue;

        for (let j = 0; j < batch.length; j++) {
          const vec = embeddings[j];
          if (!vec || vec.length !== 384) continue;
          await supabase
            .from('ebecco_chunks')
            .update({ embedding: `[${vec.join(',')}]` })
            .eq('id', batch[j].id);
          embedded++;
        }
        console.log(`[EBECO] Embedded ${Math.min(i + BATCH, chunks.length)}/${chunks.length} chunks`);
      }
    }
  } catch (err) {
    console.warn('[EBECO] Embedding failed:', err.message);
  }

  // 2. Generate summaries/keywords via Groq for chunks missing them
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (groqKey) {
    try {
      const { data: needSummary } = await supabase
        .from('ebecco_chunks')
        .select('id, content')
        .eq('document_id', documentId)
        .is('summary', null)
        .order('chunk_index');

      if (needSummary && needSummary.length > 0) {
        for (const chunk of needSummary) {
          try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                  { role: 'system', content: 'You are a document indexer. Given a text chunk, produce a JSON object with exactly two fields: "summary" (one clear sentence) and "keywords" (an array of 5-10 search keywords). Return ONLY the JSON.' },
                  { role: 'user', content: chunk.content },
                ],
                max_tokens: 200,
                temperature: 0.1,
              }),
            });
            if (!response.ok) continue;
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content?.trim() || '';
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) continue;
            const parsed = JSON.parse(match[0]);
            if (parsed.summary && Array.isArray(parsed.keywords)) {
              await supabase.from('ebecco_chunks').update({
                summary: parsed.summary,
                keywords: parsed.keywords.join(', '),
              }).eq('id', chunk.id);
              enhanced++;
            }
          } catch {
            // skip chunk
          }
        }
      }
    } catch (err) {
      console.warn('[EBECO] Summary generation failed:', err.message);
    }
  }

  console.log(`[EBECO] Enhancement done: ${embedded} embedded, ${enhanced} summarized`);
  return { embedded, enhanced };
}
