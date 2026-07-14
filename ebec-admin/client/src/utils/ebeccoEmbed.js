const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const HF_API = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

export async function embedText(text) {
  const key = import.meta.env.VITE_HF_API_KEY;
  if (!key) {
    console.warn('[EBECO] VITE_HF_API_KEY not set');
    return null;
  }
  try {
    const res = await fetch(HF_API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: text }),
    });
    if (!res.ok) {
      console.error('[EBECO] HuggingFace error:', res.status);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[EBECO] Embedding failed:', err.message);
    return null;
  }
}

export async function embedBatch(texts) {
  const key = import.meta.env.VITE_HF_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(HF_API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: texts }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
