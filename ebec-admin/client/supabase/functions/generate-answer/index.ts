import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, context } = await req.json();

    // Groq (Llama 3.1) primary, OpenAI fallback
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const apiKey = groqKey || openaiKey;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No LLM API key configured (set GROQ_API_KEY)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isGroq = !!groqKey;
    const baseUrl = isGroq ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1";
    const model = isGroq ? "llama-3.1-8b-instant" : "gpt-4.1-mini";

    const systemPrompt = `You are EBECO, the EBEC Admin Hub knowledge assistant. You answer questions about EBEC meetings, reports, team activities, and admin documents. You are given relevant excerpts from uploaded documents. Synthesize the information to answer the question clearly and concisely. Always cite the source document name. If the context doesn't contain enough information to answer, say so. Never make up information.`;

    const userPrompt = `Question: ${question}\n\nRelevant document excerpts:\n${context}\n\nAnswer the question based on the above excerpts. Synthesize the information, be concise, and cite sources.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[EBECO] ${isGroq ? 'Groq' : 'OpenAI'} error:`, err);
      return new Response(
        JSON.stringify({ error: "Failed to generate answer" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No answer generated.";

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[EBECO] generate-answer error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
