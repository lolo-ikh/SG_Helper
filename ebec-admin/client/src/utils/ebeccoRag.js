import { supabase } from '../lib/supabase';

export async function generateRagAnswer(question, searchResults) {
  if (!searchResults || searchResults.length === 0) {
    return "I couldn't find any relevant information in the uploaded documents. Try rephrasing your question or upload new documents in the EBECO Documents page.";
  }

  const context = searchResults
    .map((r, i) => {
      const meta = r.chunk_summary ? `Summary: ${r.chunk_summary}` : '';
      return `[Source ${i + 1}: "${r.document_title}" (p.${r.page_number || '?'})]\n${meta}\n${r.chunk_content}`;
    })
    .join('\n\n');

  try {
    const { data, error } = await supabase.functions.invoke('generate-answer', {
      body: { question, context },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data.answer;
  } catch (err) {
    console.warn('[EBECO] Edge function unavailable, using extractive fallback:', err.message);
    return extractiveAnswer(question, searchResults);
  }
}

function extractiveAnswer(question, results) {
  const sentences = results.flatMap(r =>
    r.chunk_content.split(/(?<=[.!?])\s+/).map(s => ({
      text: s.trim(),
      title: r.document_title,
      page: r.page_number,
    }))
  );

  const queryWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const scored = sentences.map(s => ({
    ...s,
    score: queryWords.reduce((acc, w) => acc + (s.text.toLowerCase().includes(w) ? 1 : 0), 0),
  })).filter(s => s.score > 0 || s.text.length > 30);

  const top = scored.sort((a, b) => b.score - a.score).slice(0, 6);

  if (top.length === 0) {
    return results.map((r, i) =>
      `${i + 1}. **${r.document_title}** (p.${r.page_number || '?'}): ${r.chunk_content.substring(0, 150)}...`
    ).join('\n\n');
  }

  return top.map(s => s.text).join(' ');
}
