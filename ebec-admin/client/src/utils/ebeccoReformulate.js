const PRONOUNS = /\b(?:she|he|they|it|him|her|them|his|its|their|this|that|these|those|those\s+ones|same\s+person|same\s+guy|same\s+one)\b/i;

export function isAmbiguousQuery(query) {
  const trimmed = query.trim();
  const words = trimmed.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  return words.length <= 5 && PRONOUNS.test(trimmed);
}

export async function reformulateQuery(query, conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) return query;

  const recentMessages = conversationHistory
    .filter(m => m.role !== 'assistant' || m.sources)
    .slice(-4)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 200)}`)
    .join('\n');

  if (!recentMessages) return query;

  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!groqKey) return query;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Rewrite the follow-up question as a standalone search query using context from the conversation. Keep it short (2-6 words). Output ONLY the rewritten query, nothing else.' },
          { role: 'user', content: `Conversation:\n${recentMessages}\n\nFollow-up: ${query}\n\nStandalone query:` },
        ],
        max_tokens: 30,
        temperature: 0,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const rewritten = data.choices?.[0]?.message?.content?.trim();
      if (rewritten && rewritten.length > 2 && rewritten.length < 100) {
        console.log(`[EBECO] Reformulated: "${query}" → "${rewritten}"`);
        return rewritten;
      }
    }
  } catch (err) {
    console.warn('[EBECO] Reformulation failed:', err.message);
  }
  return query;
}
