import { google } from "googleapis";

export const maxDuration = 30;

type BookingPayload = {
  name: string;
  email: string;
  startIso: string;
  durationMinutes: number;
  eventTitle: string;
  location: "zoom" | "meet";
  visitorTimeZone: string;
  answers: { question: string; answer: string }[];
};

function getClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

function buildDescription(payload: BookingPayload) {
  const lines = payload.answers
    .filter(a => a.answer.trim())
    .map(a => `${a.question}\n${a.answer.trim()}`);
  const base = lines.length ? lines.join("\n\n") : "No additional details provided.";
  const zoomNote = payload.location === "zoom" ? "\n\nZoom was requested — a Zoom link will be sent by email shortly." : "";
  return `Booked via withjell.vercel.app (visitor timezone: ${payload.visitorTimeZone})\n\n${base}${zoomNote}`;
}

export async function POST(req: Request) {
  let payload: BookingPayload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!payload.name?.trim() || !payload.email?.trim() || !payload.startIso || !payload.durationMinutes) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const calendar = getClient();
  if (!calendar) {
    console.error("[book] Google Calendar credentials not configured");
    return Response.json(
      { error: "Live booking isn't connected yet. Please reach out directly for now." },
      { status: 503 }
    );
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const start = new Date(payload.startIso);
  const end = new Date(start.getTime() + payload.durationMinutes * 60 * 1000);

  try {
    // Re-check the slot server-side right before booking — the client's
    // availability check can go stale between page load and submit.
    const fb = await calendar.freebusy.query({
      requestBody: { timeMin: start.toISOString(), timeMax: end.toISOString(), items: [{ id: calendarId }] },
    });
    const busy = fb.data.calendars?.[calendarId]?.busy ?? [];
    if (busy.length > 0) {
      return Response.json({ error: "That time was just booked. Please pick another slot." }, { status: 409 });
    }

    const wantsMeet = payload.location === "meet";
    const event = await calendar.events.insert({
      calendarId,
      sendUpdates: "all",
      conferenceDataVersion: wantsMeet ? 1 : 0,
      requestBody: {
        summary: `${payload.eventTitle} — ${payload.name}`,
        description: buildDescription(payload),
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: [{ email: payload.email, displayName: payload.name }],
        conferenceData: wantsMeet
          ? { createRequest: { requestId: `${start.getTime()}-${Math.random().toString(36).slice(2)}`, conferenceSolutionKey: { type: "hangoutsMeet" } } }
          : undefined,
      },
    });

    return Response.json({
      ok: true,
      eventId: event.data.id ?? null,
      meetLink: event.data.hangoutLink ?? null,
      htmlLink: event.data.htmlLink ?? null,
    });
  } catch (err) {
    console.error("[book] error:", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Something went wrong creating the booking. Please try again or reach out directly." },
      { status: 500 }
    );
  }
}
