import { google } from "googleapis";

export const maxDuration = 20;

function getClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return Response.json({ error: "Missing start/end" }, { status: 400 });
  }

  const calendar = getClient();
  if (!calendar) {
    return Response.json({ busy: [], configured: false });
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  try {
    const fb = await calendar.freebusy.query({
      requestBody: { timeMin: start, timeMax: end, items: [{ id: calendarId }] },
    });
    const busy = fb.data.calendars?.[calendarId]?.busy ?? [];
    return Response.json({ busy, configured: true });
  } catch (err) {
    console.error("[availability] error:", err instanceof Error ? err.message : err);
    return Response.json({ busy: [], configured: true, error: true });
  }
}
