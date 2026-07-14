import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_API = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, match_count = 10 } = await req.json();
    const hfKey = Deno.env.get("HF_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!hfKey) {
      return new Response(
        JSON.stringify({ error: "HF_API_KEY not configured", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Embed query via HuggingFace
    const hfRes = await fetch(HF_API, {
      method: "POST",
      headers: { "Authorization": `Bearer ${hfKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: query }),
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("[EBECO] HuggingFace embed error:", hfRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Embedding failed", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const embedding = await hfRes.json();
    if (!embedding || embedding.length !== 384) {
      return new Response(
        JSON.stringify({ error: "Invalid embedding dimensions", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vecStr = `[${embedding.join(",")}]`;

    // 2. Query pgvector via RPC
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await sb.rpc("search_ebecco_semantic", {
      query_embedding: vecStr,
      match_count,
    });

    if (error) {
      console.error("[EBECO] Vector search error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ results: data || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[EBECO] search-semantic error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", results: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
