import { google } from "googleapis";

export const maxDuration = 30;

type ContactPayload = {
  name: string;
  email: string;
  message: string;
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

export async function POST(req: Request) {
  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const message = payload.message?.trim();

  if (!name || !email || !message) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const auth = getOAuthClient();
  const hostEmail = process.env.HOST_NOTIFICATION_EMAIL || process.env.GOOGLE_CALENDAR_ID;
  if (!auth || !hostEmail || !hostEmail.includes("@")) {
    console.error("[contact] Google credentials or host email not configured");
    return Response.json(
      { error: "Messaging isn't connected yet. Please reach out directly for now." },
      { status: 503 }
    );
  }

  const subject = encodeMimeSubject(`New message from ${name} via withjell.vercel.app`);
  const bodyLines = [
    `New message via the contact form on withjell.vercel.app`,
    ``,
    `From: ${name}`,
    `Email: ${email}`,
    ``,
    message,
  ].join("\n");

  // Reply-To lets the host just hit "Reply" in Gmail to respond directly to the visitor.
  const mime = [
    `To: ${hostEmail}`,
    `Reply-To: ${email}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    bodyLines,
  ].join("\r\n");

  const raw = Buffer.from(mime).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  try {
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] error:", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Something went wrong sending your message. Please try again or reach out directly." },
      { status: 500 }
    );
  }
}
