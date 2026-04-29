import { openai } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const isGroq = process.env.AI_PROVIDER === "groq";

    const model = isGroq
      ? createGroq({ apiKey: process.env.GROQ_API_KEY ?? "" })(
          "llama-3.3-70b-versatile"
        )
      : openai("gpt-4o-mini");

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.72,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
