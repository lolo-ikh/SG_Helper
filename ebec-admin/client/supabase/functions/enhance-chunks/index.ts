import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { document_id } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured", enhanced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: chunks } = await sb
      .from("ebecco_chunks")
      .select("id, content")
      .eq("document_id", document_id)
      .is("summary", null)
      .order("chunk_index");

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ enhanced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let enhanced = 0;
    for (const chunk of chunks) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content: "You are a document indexer. Given a text chunk from an EBEC meeting report or admin document, produce a JSON object with exactly two fields: \"summary\" (one clear sentence summarizing the chunk) and \"keywords\" (an array of 5-10 relevant search keywords). Return ONLY the JSON, no explanation.",
              },
              {
                role: "user",
                content: chunk.content,
              },
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
          await sb
            .from("ebecco_chunks")
            .update({
              summary: parsed.summary,
              keywords: parsed.keywords.join(", "),
            })
            .eq("id", chunk.id);
          enhanced++;
        }
      } catch {
        // skip chunk on error
      }
    }

    return new Response(
      JSON.stringify({ enhanced }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[EBECO] enhance-chunks error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", enhanced: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
