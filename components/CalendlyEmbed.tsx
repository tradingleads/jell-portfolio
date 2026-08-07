"use client";

import { InlineWidget } from "react-calendly";

export default function CalendlyEmbed() {
  return (
    <div className="w-full max-w-md lg:max-w-4xl mx-auto">
      <div className="relative rounded-2xl">
        {/* Pulsing glow layer -- sits behind the frame so the widget itself never dims */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-zinc-400/12 via-zinc-400/5 to-transparent dark:from-blue-500/15 dark:via-blue-400/5 blur-md animate-[pulse_4s_ease-in-out_infinite]" />

        {/* Outer frame with more space, always fully opaque */}
        <div className="relative rounded-2xl p-3 bg-gradient-to-b from-zinc-400/10 via-zinc-400/4 to-transparent dark:from-blue-500/10 dark:via-blue-400/5 shadow-[0_0_16px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_0_16px_-10px_rgba(59,130,246,0.15)]">
          <div className="rounded-xl overflow-hidden bg-white dark:bg-[#0b1220] border border-black/5 dark:border-white/10 h-[600px] lg:h-[465px]">
            <InlineWidget
              url="https://calendly.com/jellurmeneta64/new-meeting"
              styles={{
                height: "100%",
                width: "100%",
                minWidth: "0",
              }}
              pageSettings={{
                backgroundColor: "ffffff",
                textColor: "4d5055",
                primaryColor: "3b82f6",
                hideEventTypeDetails: true,
                hideLandingPageDetails: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
