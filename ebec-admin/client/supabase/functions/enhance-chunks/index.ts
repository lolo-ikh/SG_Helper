import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_API = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

async function embedBatch(texts: string[], hfKey: string): Promise<number[][] | null> {
  const res = await fetch(HF_API, {
    method: "POST",
    headers: { "Authorization": `Bearer ${hfKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: texts }),
  });
  if (!res.ok) {
    console.error("[EBECO] HuggingFace error:", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data as number[][];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { document_id } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const hfKey = Deno.env.get("HF_API_KEY");
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: chunks } = await sb
      .from("ebecco_chunks")
      .select("id, content, summary")
      .eq("document_id", document_id)
      .is("embedding", null)
      .order("chunk_index");

    let enhanced = 0;
    let embedded = 0;

    if (chunks && chunks.length > 0 && hfKey) {
      const BATCH = 16;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        const texts = batch.map(c => {
          const parts: string[] = [];
          if (c.summary) parts.push(c.summary);
          parts.push(c.content);
          return parts.join(" ");
        });

        const embeddings = await embedBatch(texts, hfKey);
        if (!embeddings) continue;

        for (let j = 0; j < batch.length; j++) {
          const vec = embeddings[j];
          if (!vec || vec.length !== 384) continue;
          const vecStr = `[${vec.join(",")}]`;
          await sb
            .from("ebecco_chunks")
            .update({ embedding: vecStr })
            .eq("id", batch[j].id);
          embedded++;
        }
      }
    }

    // Also do LLM summary/keywords for chunks missing them (OpenAI/Groq path)
    const groqKey = Deno.env.get("GROQ_API_KEY") || Deno.env.get("OPENAI_API_KEY");
    if (groqKey) {
      const { data: needSummary } = await sb
        .from("ebecco_chunks")
        .select("id, content")
        .eq("document_id", document_id)
        .is("summary", null)
        .order("chunk_index");

      if (needSummary && needSummary.length > 0) {
        const isGroq = !!Deno.env.get("GROQ_API_KEY");
        const baseUrl = isGroq ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1";
        const model = isGroq ? "llama-3.1-8b-instant" : "gpt-4.1-mini";

        for (const chunk of needSummary) {
          try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
              method: "POST",
              headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: "You are a document indexer. Given a text chunk, produce a JSON object with exactly two fields: \"summary\" (one clear sentence) and \"keywords\" (an array of 5-10 search keywords). Return ONLY the JSON." },
                  { role: "user", content: chunk.content },
                ],
                max_tokens: 200,
                temperature: 0.1,
              }),
            });
            if (!response.ok) continue;
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content?.trim() || "";
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) continue;
            const parsed = JSON.parse(match[0]);
            if (parsed.summary && Array.isArray(parsed.keywords)) {
              await sb.from("ebecco_chunks").update({
                summary: parsed.summary,
                keywords: parsed.keywords.join(", "),
              }).eq("id", chunk.id);
              enhanced++;
            }
          } catch {
            // skip
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ enhanced, embedded }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[EBECO] enhance-chunks error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", enhanced: 0, embedded: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
