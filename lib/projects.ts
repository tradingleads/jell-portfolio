export interface ProjectData {
  id: string;
  title: string;
  tagline: string;
  platform: "n8n" | "Zapier" | "Make";
  featured: boolean;
  image: string;
  overview: string;
  useCase: string;
  results: string[];
  tools: string[];
  metric: string;
  metricColor: string;
  accentColor: string;
  category: string;
}

export const ALL_PROJECTS: ProjectData[] = [
  /* ── FEATURED ──────────────────────────────────────────────────── */
  {
    id: "ai-agent-facebook",
    featured: true,
    title: "Facebook AI Sales Assistant",
    tagline: "Replied to 100% of Facebook leads instantly — 24/7, no staff needed.",
    platform: "n8n",
    image: "/projects/ai-agent-facebook.png",
    category: "AI Agents",
    overview:
      "An AI agent connected to Facebook Messenger via webhook that filters incoming messages, loads a Google Docs knowledge base, and uses Google Gemini to generate instant on-brand replies — sent back via HTTP Request. Replaced a 2-person support team with a single automated workflow.",
    useCase:
      "For businesses losing Facebook leads to slower response times. Replaces a full support shift with instant, always-on replies grounded in your own knowledge base.",
    results: [
      "Under 3 seconds average response time",
      "40% more leads recovered from after-hours conversations",
      "70% reduction in support costs",
      "Replaced a 2-person support team with a single automated workflow",
    ],
    tools: ["n8n", "Google Gemini", "Google Docs", "Facebook Webhook"],
    metric: "24/7 automated",
    metricColor: "#22d3ee",
    accentColor: "#22d3ee",
  },
  {
    id: "rag-agents",
    featured: true,
    title: "RAG Knowledge Agent",
    tagline: "AI assistant that answers questions from your own documents — and keeps itself updated automatically.",
    platform: "n8n",
    image: "/projects/rag-agents.png",
    category: "AI Agents",
    overview:
      "A Retrieval-Augmented Generation pipeline in n8n. When a message arrives, the AI Agent queries a Supabase Vector Store holding Google Vertex embeddings of your Google Drive documents and generates accurate, grounded answers. When files are added, updated, or deleted in Google Drive, the knowledge base syncs automatically — no manual re-indexing needed.",
    useCase:
      "Ideal for teams that need an internal AI assistant trained on their own documentation — SOPs, client briefs, product specs — without hallucinations. The vector store ensures answers come from verified sources, not AI guesswork.",
    results: [
      "AI answers grounded 100% in your actual documents — no hallucinations",
      "Knowledge base syncs automatically when files are added, updated, or deleted",
      "Sub-second semantic search across entire document library",
      "Deployable as internal helpdesk or client-facing knowledge bot",
    ],
    tools: ["n8n", "Supabase Vector Store", "Google Gemini", "Google Drive", "Google Vertex Embeddings"],
    metric: "Zero hallucinations",
    metricColor: "#a78bfa",
    accentColor: "#a78bfa",
  },
  {
    id: "leads-enrichment",
    featured: true,
    title: "Automated Leads Enrichment",
    tagline: "New lead in → enriched data + personalized AI email out",
    platform: "Zapier",
    image: "/projects/leads-enrichment.png",
    category: "Lead Generation",
    overview:
      "A Zapier workflow triggered when a new lead is captured. It automatically enriches the contact with company data via Apollo, scores lead priority, splits into high/low priority paths, saves top leads to Google Sheets, notifies the sales team via Slack, and uses AI to draft a personalized cold email — which is then sent directly from Gmail.",
    useCase:
      "Built for sales teams spending hours manually researching prospects and writing first-touch emails. This pipeline does all of that automatically the moment a lead appears, ensuring no lead goes cold and every outreach is personalized.",
    results: [
      "Lead response time reduced from hours to under 60 seconds",
      "High-priority leads automatically separated and fast-tracked",
      "AI-written personalized emails improve reply rates",
      "Sales team notified on Slack the instant a high-value lead lands",
    ],
    tools: ["Zapier", "Apollo", "AI by Zapier", "Google Sheets", "Slack", "Gmail", "Paths"],
    metric: "< 60s response",
    metricColor: "#34d399",
    accentColor: "#34d399",
  },
  {
    id: "ai-jobs-scraper",
    featured: true,
    title: "AI Jobs Scraper + Resume Optimizer",
    tagline: "Scrapes fresh job listings, scores each role by fit, and sends a tailored resume — triggered by a single Slack message.",
    platform: "n8n",
    image: "/projects/ai-jobs-scraper.png",
    category: "AI Automation",
    overview:
      "A Slack-triggered n8n workflow that searches job boards for live listings, validates the query, loops through results, scores each role using OpenRouter AI, generates a customized resume from a Google Docs template, and delivers a ready-to-send Gmail draft — automatically.",
    useCase:
      "Built for job seekers spending hours daily on manual searching, copy-pasting experience, and rewriting resumes for each role. One Slack message triggers the full pipeline — from scraping to a ready-to-send, tailored resume.",
    results: [
      "One Slack message triggers the full pipeline in minutes",
      "Every resume tailored to the specific role",
      "ATS-optimized every time",
      "Ready-to-send Gmail draft delivered automatically",
    ],
    tools: ["n8n", "Slack", "OpenRouter", "Google Docs", "Google Drive", "Gmail"],
    metric: "–95% time saved",
    metricColor: "#fb923c",
    accentColor: "#fb923c",
  },
  {
    id: "youtube-shorts-creator",
    featured: true,
    title: "Automated YouTube Shorts + Facebook Reels Creator",
    tagline: "Generates and publishes AI video content to YouTube and Facebook daily — zero manual effort.",
    platform: "n8n",
    image: "/projects/youtube-shorts-creator.png",
    category: "Content Automation",
    overview:
      "A scheduled n8n pipeline that uses Google Gemini to generate a structured video prompt, calls an AI video generation API to produce the video, waits for render completion, then automatically publishes to both YouTube and Facebook Reels — fully hands-free on a daily schedule.",
    useCase:
      "Designed for creators and brands that need consistent short-form video output without hiring an editor or social media manager. Runs daily and publishes across both platforms automatically.",
    results: [
      "30+ videos published per month, up from 3 per week",
      "Zero manual hours after initial setup",
      "Published simultaneously to both YouTube and Facebook Reels",
      "Fully hands-free from prompt generation to publish",
    ],
    tools: ["n8n", "Google Gemini", "AI Video Generation API", "YouTube API", "Facebook Graph API"],
    metric: "10× output",
    metricColor: "#f472b6",
    accentColor: "#f472b6",
  },
  {
    id: "ai-content-repurposing",
    featured: true,
    title: "AI Content Repurposing",
    tagline: "One audio/video file → blog posts + social content across every channel",
    platform: "Zapier",
    image: "/projects/ai-content-repurposing.png",
    category: "Content Automation",
    overview:
      "A Zapier workflow triggered when a new file is added to Google Drive. It filters for eligible content, generates an AI transcription, then uses AI to write blog posts and social captions. A loop distributes the content across two path variants — publishing to Facebook Pages, LinkedIn, and Instagram Business automatically.",
    useCase:
      "For content teams, podcasters, or coaches who want to multiply reach without multiplying effort. Upload one recording; wake up to blog posts and social updates published everywhere.",
    results: [
      "One upload triggers publishing across 3+ platforms automatically",
      "Hours of manual editing and copywriting eliminated per piece",
      "Consistent content cadence maintained with zero manual scheduling",
      "AI-generated captions optimized per platform format",
    ],
    tools: ["Zapier", "Google Drive", "AI by Zapier", "Facebook Pages", "LinkedIn", "Instagram for Business", "Looping by Zapier"],
    metric: "3 platforms, 0 effort",
    metricColor: "#60a5fa",
    accentColor: "#60a5fa",
  },

  /* ── MORE PROJECTS ─────────────────────────────────────────────── */
  {
    id: "ai-appointment-setter",
    featured: false,
    title: "AI Voice Appointment Setter",
    tagline: "Books, reschedules, and cancels appointments by phone — fully automated, zero human input.",
    platform: "n8n",
    image: "/projects/ai-appointment-setter.png",
    category: "Booking Automation",
    overview:
      "A voice-driven appointment system powered by Vapi and n8n. Callers speak naturally to an AI agent that checks real-time availability, confirms bookings, handles reschedules, and processes cancellations — all logged automatically in Airtable.",
    useCase:
      "Service businesses replacing a full-time receptionist with an AI voice agent that never misses a call or double-books.",
    results: [
      "One phone call books a full appointment",
      "24/7 availability with no staff needed",
      "Every booking action logged automatically in Airtable",
    ],
    tools: ["n8n", "Vapi", "Google Calendar", "Airtable"],
    metric: "24/7 booking",
    metricColor: "#22d3ee",
    accentColor: "#22d3ee",
  },
  {
    id: "asana-crm-lead",
    featured: false,
    title: "Asana CRM Lead Engagement",
    tagline: "Lead status changes in Asana trigger full CRM email sequences",
    platform: "Zapier",
    image: "/projects/asana-crm-lead.png",
    category: "CRM Automation",
    overview:
      "A Zapier automation triggered by Asana task updates. Based on lead stage (Ready to Start, No Response, Quoted, Approved, Paid & Closed), the workflow routes to the correct email sequence, sends follow-ups, attaches PDF quotes, and logs every touchpoint back to Google Drive.",
    useCase:
      "For agencies and consultants using Asana as a lightweight CRM who want automated client communication tied to their existing project workflow.",
    results: [
      "Stage-based email sequences fire automatically on Asana updates",
      "PDF quote delivery automated on Approved status",
      "Full client communication logged without manual tracking",
    ],
    tools: ["Zapier", "Asana", "Gmail", "Google Drive", "Delay by Zapier", "Filter by Zapier"],
    metric: "Full CRM flow",
    metricColor: "#34d399",
    accentColor: "#34d399",
  },
  {
    id: "auto-sort-gmail",
    featured: false,
    title: "Gmail Auto-Sort to Drive",
    tagline: "AI reads, renames, and files every Gmail attachment automatically",
    platform: "Make",
    image: "/projects/auto-sort-gmail.png",
    category: "File Automation",
    overview:
      "A Make workflow that watches Gmail for new emails with attachments, uploads each file to AI for analysis, uses Gemini to generate a smart file name, uploads the renamed file to the correct Google Drive folder, logs it in Google Sheets, and sends a confirmation email — all in one automated flow.",
    useCase:
      "For professionals drowning in email attachments with no time to organize. Every invoice, contract, or report gets intelligently named and filed the instant it arrives.",
    results: [
      "100% of email attachments automatically filed to correct Drive folders",
      "AI-generated file names make documents instantly searchable",
      "Attachment log in Google Sheets for full audit trail",
    ],
    tools: ["Make", "Gmail", "Google Drive", "Gemini AI", "Google Sheets"],
    metric: "Zero manual filing",
    metricColor: "#a78bfa",
    accentColor: "#a78bfa",
  },
  {
    id: "xero-asana-export",
    featured: false,
    title: "Xero → Asana Finance Sync",
    tagline: "Completed Asana tasks auto-export transactions from Xero to CSV",
    platform: "Make",
    image: "/projects/xero-asana-export.png",
    category: "Finance Automation",
    overview:
      "A Make workflow that monitors Asana for completed finance-related tasks, makes an API call to Xero to export account transactions, routes through an iterator, aggregates the data into a formatted CSV, uploads it back to Asana as an attachment, and clears the staging sheet — closing the loop between project management and accounting.",
    useCase:
      "For finance teams and bookkeepers who need transaction exports triggered by specific project milestones, without manual Xero exports or file transfers.",
    results: [
      "Transaction exports triggered automatically on task completion",
      "Structured CSV delivered directly inside the relevant Asana task",
      "Eliminates manual Xero export → upload workflow entirely",
    ],
    tools: ["Make", "Asana", "Xero API", "Google Sheets", "Iterator", "Router"],
    metric: "Fully automated",
    metricColor: "#fb923c",
    accentColor: "#fb923c",
  },
];

export const FEATURED_PROJECTS = ALL_PROJECTS.filter(p => p.featured);
export const MORE_PROJECTS     = ALL_PROJECTS.filter(p => !p.featured);

