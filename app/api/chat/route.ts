import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 30;

// Keep last N messages to stay within token limits
const MAX_HISTORY = 10;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Trim history to avoid token limit errors on longer conversations
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
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[chat] Groq error:", response.status, errorText);

      // Return a user-friendly message based on status
      const userMessage =
        response.status === 429
          ? "Too many messages at once — please wait a moment and try again."
          : response.status === 400
          ? "Something went wrong with the request. Please try again."
          : "The AI is temporarily unavailable. Please try again shortly.";

      return new Response(userMessage, {
        status: 200, // send 200 so Chat.tsx streams it as a message, not an error
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Parse SSE from Groq and stream plain text to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) controller.enqueue(encoder.encode(content));
              } catch {
                // skip malformed chunks
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[chat] error:", err);
    return new Response("Something went wrong. Please try again.", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
