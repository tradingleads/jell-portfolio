import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 30;

const MAX_HISTORY = 10;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const trimmedMessages = Array.isArray(messages)
      ? messages.slice(-MAX_HISTORY)
      : [];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmedMessages,
        ],
        temperature: 0.55,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[chat] Groq error:", response.status, errorText);

      const userMessage =
        response.status === 429
          ? "Too many messages at once — please wait a moment and try again."
          : response.status === 400
          ? "Something went wrong with the request. Please try again."
          : "The AI is temporarily unavailable. Please try again shortly.";

      return new Response(JSON.stringify({ text: userMessage }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[chat] error:", err);
    return new Response(JSON.stringify({ text: "Something went wrong. Please try again." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
