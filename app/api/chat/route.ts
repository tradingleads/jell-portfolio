import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 30;

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
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
