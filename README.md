# Jell Urmeneta — AI Portfolio

Premium AI-powered portfolio with a streaming chat interface. Ask the AI anything about Jell's work, skills, and automation projects.

## Quick Start

```bash
npm install
```

Create `.env.local` (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Fill in your key:

```env
# Option A — OpenAI (gpt-4o-mini)
OPENAI_API_KEY=sk-...

# Option B — Groq (llama-3.1-70b-versatile, faster + free tier)
GROQ_API_KEY=gsk_...
AI_PROVIDER=groq
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push repo to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add env vars in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS v3
- Framer Motion — all animations
- Vercel AI SDK v3 — streaming chat
- next-themes — dark/light mode
- Geist + Outfit fonts
