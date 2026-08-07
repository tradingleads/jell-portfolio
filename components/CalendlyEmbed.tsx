"use client";

import { InlineWidget } from "react-calendly";

export default function CalendlyEmbed() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative rounded-2xl">
        {/* Pulsing glow layer -- sits behind the frame so the widget itself never dims */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-blue-500/40 via-blue-400/15 to-transparent blur-md animate-[pulse_4s_ease-in-out_infinite]" />

        {/* Outer frame with more space, always fully opaque */}
        <div className="relative rounded-2xl p-3 bg-gradient-to-b from-blue-500/25 via-blue-400/10 to-transparent shadow-[0_0_30px_-8px_rgba(59,130,246,0.25)]">
          <div className="rounded-xl overflow-hidden bg-white dark:bg-[#0b1220] border border-black/5 dark:border-white/10">
            <InlineWidget
              url="https://calendly.com/jellurmeneta64/new-meeting"
              styles={{
                height: "440px",
                minWidth: "320px",
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
