import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { rawText, lang, chapterCount } = await req.json();

    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
      return new Response(JSON.stringify({ error: "텍스트를 입력해주세요." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langLabel = lang === "ko" ? "한국어" : "영어";
    const maxChapters = chapterCount || 6;

    const prompt = `아래 텍스트를 책 요약 데이터로 분류해주세요.
언어: ${langLabel}

텍스트:
${rawText}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "chapters": [
    {
      "title": "챕터 제목",
      "quote_1": "첫 번째 인상적인 인용구",
      "quote_2": "두 번째 인용구",
      "body": "본문 요약"
    }
  ]
}

규칙:
- 챕터 구분이 명확하면 그대로 따르고, 없으면 내용 흐름으로 최대 ${maxChapters}등분 하세요
- 인용구는 원문에서 가장 인상적인 1-2문장
- 본문은 100-150자 요약
- JSON 외 다른 텍스트는 절대 포함하지 마세요`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a book summarization assistant. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스 설정에서 충전해주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI 분류 중 오류가 발생했습니다." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response
    const cleaned = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ result: parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-text error:", e);
    const msg = e instanceof SyntaxError ? "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요." : (e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
