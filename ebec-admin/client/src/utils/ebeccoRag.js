import { supabase } from '../lib/supabase';

export async function generateRagAnswer(question, searchResults) {
  const hasResults = searchResults && searchResults.length > 0;

  const context = hasResults ? (() => {
    const MAX_CONTEXT_CHARS = 6000;
    const diversified = [];
    const usedDocIds = new Set();
    // First pass: one chunk per unique document
    for (const r of searchResults) {
      if (diversified.length >= 8) break;
      if (!usedDocIds.has(r.document_id)) {
        diversified.push(r);
        usedDocIds.add(r.document_id);
      }
    }
    // Second pass: fill remaining from top-ranked
    for (const r of searchResults) {
      if (diversified.length >= 8) break;
      if (!diversified.find(d => d.chunk_id === r.chunk_id)) {
        diversified.push(r);
      }
    }
    let totalChars = 0;
    const selected = [];
    for (const r of diversified) {
      if (totalChars + r.chunk_content.length > MAX_CONTEXT_CHARS) break;
      selected.push(r);
      totalChars += r.chunk_content.length;
    }
    return selected.map((r, i) => {
      const meta = r.chunk_summary ? `Summary: ${r.chunk_summary}` : '';
      const catLabel = { admin_doc: 'Admin Doc', meeting_report: 'Meeting Report', presentation: 'Presentation', general: 'General' }[r.document_category] || r.document_category;
      const seasonMatch = r.document_title.match(/20\d{2}[-–]\d{4}|20\d{2}[–—]\d{2}/);
      const seasonLabel = seasonMatch ? ` [Season: ${seasonMatch[0]}]` : '';
      return `[Source ${i + 1}: "${r.document_title}" (${catLabel}${seasonLabel}, p.${r.page_number || '?'})]\n${meta}\n${r.chunk_content}`;
    }).join('\n\n');
  })() : '';

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
            { role: 'system', content: `You are EBECO, the official AI knowledge assistant for EBEC (European Business Plan Competition) at ENSIA. You were created by Leena Ikhlef (Vice President of EBEC 2026-2027). Always refer to yourself in first person: "I am EBECO", "I was created by", "I can help with" — never say "You are EBECO".

SELF-KNOWLEDGE (answer directly from built-in knowledge, DO NOT cite any sources):
- "What are you?" / "Who made you?" / "What is EBECO?" → I am EBECO, an AI knowledge assistant built by Leena Ikhlef to help EBEC team members find information from uploaded documents.
- "What is EBEC?" → EBEC stands for Ensia Business and Entrepreneurship Club. It is a student-led organization at ENSIA focused on business plan competitions, entrepreneurship events, and startup development.
- "How do I login?" → Login with your ENSIA email on the EBEC Admin Hub. Contact the VP if you need access.
- "Who am I talking to?" → An AI assistant ready to help with EBEC documents.
- "What can you do?" → Answer questions about EBEC meetings, team roles, events, and uploaded documents.

IMPORTANT: For self-knowledge questions above, do NOT cite sources. The answer comes from built-in knowledge, not documents. Only cite sources when the answer comes from document excerpts below. Do NOT repeat your introduction or name — the user already sees it at the top of the chat. Be extremely short and direct.

DOCUMENT-BASED ANSWERS (use the provided excerpts):
- Documents span two seasons: 2025-2026 and 2026-2027.
- When a person appears in multiple seasons, state their role in EACH season.
- Team Directories and Roles docs are the authoritative source for roles — prioritize them.
- Do NOT confuse people who share a first name.
- Be SHORT — 2-4 sentences max unless asked for detail. Cite sources inline like (Source: "Doc Name").
- If the context lacks info to answer, say "I don't have enough information." Never fabricate.` },
            { role: 'user', content: hasResults
              ? `Question: ${question}\n\nRelevant document excerpts:\n${context}\n\nAnswer the question based on the above excerpts. Synthesize the information, be concise, and cite sources.`
              : `Question: ${question}\n\n(No document excerpts available.)\n\nAnswer based on your self-knowledge. If this is a greeting, respond warmly and briefly. If it's about your identity or purpose, answer from your built-in knowledge without citing sources.` },
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
    console.warn('[EBECO] Edge function unavailable:', err.message);
    if (hasResults) return extractiveAnswer(question, searchResults);
    return "I'm EBECO, an AI assistant built by Leena Ikhlef. How can I help you with EBEC documents?";
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
