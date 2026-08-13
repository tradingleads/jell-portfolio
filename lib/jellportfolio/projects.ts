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
    title: "AI Agent for Facebook",
    tagline: "Memory-powered AI chatbot that responds to Facebook messages 24/7",
    platform: "n8n",
    image: "/projects/ai-agent-facebook.png",
    category: "AI Agents",
    overview:
      "An intelligent n8n automation that intercepts incoming Facebook messages via webhook, filters relevant conversations, retrieves contextual documents, and passes everything to a Google Gemini AI agent with Simple Memory. The agent generates on-brand, context-aware replies and delivers them back via HTTP — creating a fully autonomous Facebook assistant.",
    useCase:
      "Perfect for businesses receiving high volumes of Facebook DMs who want instant, intelligent, 24/7 responses without a human support team. The memory layer ensures the AI recalls previous conversation context for natural multi-turn dialogue.",
    results: [
      "100% of Facebook messages answered within seconds, any time of day",
      "Contextually accurate responses using stored document knowledge",
      "Conversation memory maintained across multi-turn interactions",
      "Zero human involvement required for routine inquiries",
    ],
    tools: ["n8n", "Webhooks", "Google Gemini AI", "Simple Memory", "HTTP Request", "Google Docs"],
    metric: "24/7 automated",
    metricColor: "#22d3ee",
    accentColor: "#22d3ee",
  },
  {
    id: "rag-agents",
    featured: true,
    title: "RAG Knowledge Agent",
    tagline: "AI agent that searches your documents and answers questions with precision",
    platform: "n8n",
    image: "/projects/rag-agents.png",
    category: "AI Agents",
    overview:
      "A Retrieval-Augmented Generation (RAG) pipeline built in n8n. When a chat message arrives, the AI Agent queries a Supabase Vector Store that holds embeddings of uploaded Google Drive documents. It fetches the most relevant content, generates accurate answers grounded in your actual knowledge base, and keeps Google Drive in sync with an automated file loader.",
    useCase:
      "Ideal for teams that need an internal AI assistant trained on their own documentation — SOPs, client briefs, product specs — without hallucinations. The vector store ensures answers come from verified sources, not AI guesswork.",
    results: [
      "AI answers grounded 100% in your actual documents — no hallucinations",
      "Automatic knowledge base sync when new files are added to Google Drive",
      "Sub-second semantic search across entire document library",
      "Deployable as internal helpdesk or client-facing knowledge bot",
    ],
    tools: ["n8n", "Supabase Vector Store", "Google Gemini Chat", "Google Drive", "Embeddings Google Vertex", "Default Data Loader"],
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
    tagline: "Automated job hunt — scrape, match, generate tailored resumes",
    platform: "n8n",
    image: "/projects/ai-jobs-scraper.png",
    category: "AI Automation",
    overview:
      "A complex multi-step n8n workflow that runs on a schedule: it scrapes job listings, scores each role against a candidate profile using OpenAI, loops through shortlisted positions, creates personalized resume content for each, generates a PDF, and sends the finalized applications via Gmail — with every step logged automatically.",
    useCase:
      "Built for job seekers spending 4+ hours daily on manual searching and resume tailoring. The pipeline identifies best-fit roles, rewrites resume sections to match each job description, and prepares ready-to-send applications — automatically, daily.",
    results: [
      "4-hour daily job search process cut to under 10 minutes",
      "Every resume tailored to the specific job description",
      "ATS keyword optimization built into every generated resume",
      "Applications logged and tracked automatically in Google Sheets",
    ],
    tools: ["n8n", "OpenAI", "Google Sheets", "Gmail", "HTTP Request", "Loop Over Items", "PDF Generation"],
    metric: "–95% time saved",
    metricColor: "#fb923c",
    accentColor: "#fb923c",
  },
  {
    id: "youtube-shorts-creator",
    featured: true,
    title: "YouTube Shorts & Reels Creator",
    tagline: "Fully automated short-form video pipeline from concept to publish",
    platform: "n8n",
    image: "/projects/youtube-shorts-creator.png",
    category: "Content Automation",
    overview:
      "An end-to-end n8n pipeline triggered on a schedule. It generates video scripts using Gemini AI, assembles and processes video assets, applies captions and formatting, then publishes directly to YouTube Shorts and Facebook Reels with AI-optimized titles, descriptions, and hashtags — all without human input after initial setup.",
    useCase:
      "Designed for creators and brands that need consistent short-form video output without hiring an editor or social media manager. Runs daily and publishes across both platforms automatically.",
    results: [
      "10× content output — from 3 to 30+ videos published per month",
      "Consistent daily publishing maintained across YouTube and Facebook",
      "Zero manual effort after one-time setup",
      "AI-optimized metadata improves discoverability on both platforms",
    ],
    tools: ["n8n", "Gemini AI", "YouTube Data API", "Facebook Graph API", "Google Drive", "HTTP Request"],
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
    title: "AI Appointment Setter",
    tagline: "Multi-path automated booking system for service businesses",
    platform: "Zapier",
    image: "/projects/ai-appointment-setter.png",
    category: "Booking Automation",
    overview:
      "A complex multi-scenario Zapier workflow handling the full appointment lifecycle — inquiry intake, availability check, confirmation, reschedule, and cancellation — across multiple contact channels with automated follow-ups.",
    useCase:
      "Service businesses replacing a full-time receptionist with intelligent booking automation that never misses a lead or double-books.",
    results: [
      "24/7 appointment handling with zero manual input",
      "Multi-channel intake from forms, email, and messaging apps",
      "Automated confirmation and reminder sequences",
    ],
    tools: ["Zapier", "Google Calendar", "Gmail", "SMS", "Paths", "Delay"],
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

