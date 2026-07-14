import { supabase } from '../lib/supabase';

export async function generateRagAnswer(question, searchResults) {
  if (!searchResults || searchResults.length === 0) {
    return "I couldn't find any relevant information in the uploaded documents. Try rephrasing your question or upload new documents in the EBECO Documents page.";
  }

  const context = searchResults
    .slice(0, 6)
    .map((r, i) => {
      const meta = r.chunk_summary ? `Summary: ${r.chunk_summary}` : '';
      const catLabel = { admin_doc: 'Admin Doc', meeting_report: 'Meeting Report', presentation: 'Presentation', general: 'General' }[r.document_category] || r.document_category;
      const seasonMatch = r.document_title.match(/20\d{2}[-–]\d{4}|20\d{2}[–—]\d{2}/);
      const seasonLabel = seasonMatch ? ` [Season: ${seasonMatch[0]}]` : '';
      return `[Source ${i + 1}: "${r.document_title}" (${catLabel}${seasonLabel}, p.${r.page_number || '?'})]\n${meta}\n${r.chunk_content}`;
    })
    .join('\n\n');

  // Try Groq (Llama 3.1) first, then Edge Function fallback
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are EBECO, the EBEC Admin Hub knowledge assistant. Rules:\n1. Be SHORT — 2-4 sentences max. No bullet-point lists unless asked.\n2. Documents span two seasons: 2025-2026 and 2026-2027. When a person appears in multiple seasons, state their role in EACH season (e.g., "Oussama was HR in 2025-2026, now President in 2026-2027").\n3. Team Directories and Roles docs are the authoritative source for roles — prioritize them over Meeting Reports.\n4. Do NOT confuse people who share a first name (e.g., Aya Hoggas ≠ Aya Khomari).\n5. Cite sources inline like (Source: "Doc Name").\n6. If the context lacks info to answer, say "I don\'t have enough information." Never fabricate.' },
            { role: 'user', content: `Question: ${question}\n\nRelevant document excerpts:\n${context}\n\nAnswer the question based on the above excerpts. Synthesize the information, be concise, and cite sources.` },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content;
        if (answer) return answer;
      }
      console.warn('[EBECO] Groq error:', response.status);
    } catch (err) {
      console.warn('[EBECO] Groq unavailable:', err.message);
    }
  }

  // Fallback: Edge Function
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
