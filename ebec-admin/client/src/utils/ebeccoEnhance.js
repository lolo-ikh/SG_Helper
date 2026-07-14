import { supabase } from '../lib/supabase';

export async function enhanceChunks(documentId) {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-chunks', {
      body: { document_id: documentId },
    });
    if (error) throw error;
    return data?.enhanced || 0;
  } catch (err) {
    console.warn('[EBECO] Chunk enhancement unavailable:', err.message);
    return 0;
  }
}
