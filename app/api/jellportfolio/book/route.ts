import { google } from "googleapis";
import { BOOKING_CONFIG } from "@/lib/jellportfolio/bookingConfig";

export const maxDuration = 30;

type BookingPayload = {
  name: string;
  email: string;
  startIso: string;
  durationMinutes: number;
  eventTitle: string;
  location: "meet";
  visitorTimeZone: string;
  answers: { question: string; answer: string }[];
};

function getOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return oauth2Client;
}

function encodeMimeSubject(subject: string) {
  return `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;
}

/* Notifies the host by email the moment a booking is created — Google never
   emails the organizer for events they create themselves via the API, so
   without this the host only hears about a booking once the client responds
   to the calendar invite. */
async function sendHostNotification(auth: InstanceType<typeof google.auth.OAuth2>, payload: BookingPayload, start: Date, end: Date) {
  const hostEmail = process.env.HOST_NOTIFICATION_EMAIL || process.env.GOOGLE_CALENDAR_ID;
  if (!hostEmail || !hostEmail.includes("@")) {
    console.error("[book] no valid host notification email configured");
    return;
  }

  const dateLabel = start.toLocaleDateString("en-US", { timeZone: BOOKING_CONFIG.hostTimeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeLabel = `${start.toLocaleTimeString("en-US", { timeZone: BOOKING_CONFIG.hostTimeZone, hour: "numeric", minute: "2-digit", hour12: true })}–${end.toLocaleTimeString("en-US", { timeZone: BOOKING_CONFIG.hostTimeZone, hour: "numeric", minute: "2-digit", hour12: true })} (${BOOKING_CONFIG.hostTimeZone})`;

  const answerLines = payload.answers
    .filter(a => a.answer.trim())
    .map(a => `${a.question}\n${a.answer.trim()}`)
    .join("\n\n");

  const bodyLines = [
    `New discovery call booked via withjell.vercel.app`,
    ``,
    `Client: ${payload.name}`,
    `Email: ${payload.email}`,
    `Date: ${dateLabel}`,
    `Time: ${timeLabel}`,
    `Client timezone: ${payload.visitorTimeZone}`,
    `Location: Google Meet`,
    ``,
    answerLines || "No additional details provided.",
  ].join("\n");

  const subject = encodeMimeSubject(`New booking: ${payload.name} — ${dateLabel}`);
  const mime = [
    `To: ${hostEmail}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    bodyLines,
  ].join("\r\n");

  const raw = Buffer.from(mime).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const gmail = google.gmail({ version: "v1", auth });
  const sent = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });

  // Sending a message to the same account that authenticated the request
  // (self-notification, which is what this is) files it under Sent/All
  // Mail — Gmail doesn't apply the INBOX/UNREAD labels the way it would
  // for a message actually received from someone else, so without this
  // it silently never shows up anywhere the host would look.
  if (sent.data.id) {
    try {
      await gmail.users.messages.modify({
        userId: "me",
        id: sent.data.id,
        requestBody: { addLabelIds: ["INBOX", "UNREAD"] },
      });
    } catch (labelErr) {
      console.error("[book] failed to label host notification as inbox/unread:", labelErr instanceof Error ? labelErr.message : labelErr);
    }
  }
}

function buildDescription(payload: BookingPayload) {
  const lines = payload.answers
    .filter(a => a.answer.trim())
    .map(a => `${a.question}\n${a.answer.trim()}`);
  const base = lines.length ? lines.join("\n\n") : "No additional details provided.";
  return `Booked via withjell.vercel.app (visitor timezone: ${payload.visitorTimeZone})\n\n${base}`;
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

  const auth = getOAuthClient();
  if (!auth) {
    console.error("[book] Google Calendar credentials not configured");
    return Response.json(
      { error: "Live booking isn't connected yet. Please reach out directly for now." },
      { status: 503 }
    );
  }
  const calendar = google.calendar({ version: "v3", auth });

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
        summary: `Discovery Call — ${payload.name}`,
        description: buildDescription(payload),
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: [{ email: payload.email, displayName: payload.name }],
        conferenceData: wantsMeet
          ? { createRequest: { requestId: `${start.getTime()}-${Math.random().toString(36).slice(2)}`, conferenceSolutionKey: { type: "hangoutsMeet" } } }
          : undefined,
      },
    });

    // Best-effort: the booking itself already succeeded, so a notification
    // failure shouldn't turn into a failed booking for the client.
    try {
      await sendHostNotification(auth, payload, start, end);
    } catch (notifyErr) {
      console.error("[book] host notification failed:", notifyErr instanceof Error ? notifyErr.message : notifyErr);
    }

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
