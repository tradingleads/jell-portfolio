/* Edit this file to change what the booking calendar shows and offers.
   No other file needs to change for content/schedule tweaks. */

export const BOOKING_CONFIG = {
  hostName: "Jell Urmeneta",
  avatarInitials: "JU",
  avatarUrl: "", // optional image URL — leave empty to show initials instead
  eventTitle: "Free Discovery Call",
  duration: "30 min",
  durationMinutes: 30,
  locationText: "Zoom or Google Meet",

  // The timezone your working hours below are defined in (yours, not the visitor's).
  hostTimeZone: "Asia/Manila",
  // 0 = Sunday … 6 = Saturday
  workingDays: [1, 2, 3, 4, 5],
  workingHours: { start: "13:00", end: "23:00" },
  breaks: [] as { start: string; end: string }[],
  // Specific dates to block off (holidays, days off), "YYYY-MM-DD".
  blockedDates: [] as string[],
};

export const CUSTOM_QUESTIONS = [
  "Which task or process would you love to stop doing manually?",
  "Got a rough idea of how much you're looking to spend?",
  "Any deadline or timeframe you're aiming for?",
  "Got any info or details that'll help me get ready for our meeting?",
  "Just curious — how did you find me?",
];

export const LOCATIONS = [
  { id: "zoom", label: "Zoom" },
  { id: "meet", label: "Google Meet" },
] as const;
