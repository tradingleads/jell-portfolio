import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Jell Urmeneta",
  description: "How Jell Urmeneta collects, uses, and protects the information you share when booking a call.",
};

const LAST_UPDATED = "August 9, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] mb-3">{title}</h2>
      <div className="text-sm leading-relaxed text-[var(--text-secondary)] space-y-3 max-w-[68ch]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to home
        </Link>

        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tighter text-[var(--text-primary)]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Last updated {LAST_UPDATED}</p>

        <p className="mt-8 text-sm leading-relaxed text-[var(--text-secondary)] max-w-[68ch]">
          This policy covers withjell.vercel.app (&ldquo;this site&rdquo;), operated by Jell Urmeneta. It explains
          what information is collected when you use the booking form on this site, how it&apos;s used, and who it&apos;s
          shared with.
        </p>

        <Section title="What information is collected">
          <p>When you book a call through this site, the following is collected directly from what you enter:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your name and email address</li>
            <li>The date, time, and timezone you select</li>
            <li>Your meeting location (Google Meet)</li>
            <li>Your answers to the optional context questions shown before confirming (e.g. project details, budget range, timeline)</li>
          </ul>
          <p>No payment information, passwords, or government ID information is ever collected by this site.</p>
        </Section>

        <Section title="How it's used">
          <p>
            This information is used solely to schedule and prepare for the call you book — specifically, to create
            a calendar event on Jell&apos;s Google Calendar, generate a video-call link, and send you a calendar
            invitation. Your question answers are used only to prepare for the conversation.
          </p>
          <p>It is not used for advertising, and it is not sold to anyone.</p>
        </Section>

        <Section title="Who it's shared with">
          <p>
            Booking details are sent to <strong className="text-[var(--text-primary)] font-medium">Google</strong> (via
            the Google Calendar API) to create the event, generate a Google Meet link, and deliver your calendar
            invitation.
          </p>
          <p>No booking information is shared with any other third party.</p>
        </Section>

        <Section title="Data retention">
          <p>
            Booking information persists for as long as the corresponding calendar event exists. You can request that
            a booking and its associated event be deleted at any time by emailing the address below.
          </p>
        </Section>

        <Section title="Cookies and tracking">
          <p>
            This site does not use analytics or advertising cookies. A theme preference (light/dark) may be stored in
            your browser&apos;s local storage purely to remember your display preference — it identifies your browser
            setting, not you personally, and is never sent anywhere.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy, or requests to access or delete your data, can be sent to{" "}
            <a href="mailto:jellurmeneta64@gmail.com" className="text-[var(--accent)] hover:underline">
              jellurmeneta64@gmail.com
            </a>.
          </p>
        </Section>
      </div>
    </main>
  );
}
