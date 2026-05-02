import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 30;

const MAX_HISTORY = 10;

type Msg = { role: string; content: string };

// Gemini fallback
async function callGemini(messages: Msg[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key configured");

  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.55 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
}

function jsonText(text: string) {
  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let trimmedMessages: Msg[] = [];

  try {
    const { messages } = await req.json();
    trimmedMessages = Array.isArray(messages) ? messages.slice(-MAX_HISTORY) : [];

    // ── 1. Try Groq ─────────────────────────────────────────────
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmedMessages],
        temperature: 0.55,
        stream: false,
      }),
    });

    if (groqRes.ok) {
      const data = await groqRes.json();
      const text = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
      return jsonText(text);
    }

    console.warn("[chat] Groq failed:", groqRes.status, "— trying Gemini");

    // ── 2. Fallback to Gemini ────────────────────────────────────
    const text = await callGemini(trimmedMessages);
    return jsonText(text);

  } catch (err) {
    console.error("[chat] error:", err);

    // Last resort: try Gemini with whatever history we have
    try {
      const text = await callGemini(trimmedMessages);
      return jsonText(text);
    } catch {
      return jsonText("Something went wrong. Please try again.");
    }
  }
}
