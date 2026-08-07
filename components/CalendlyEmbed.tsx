"use client";

import { InlineWidget } from "react-calendly";

export default function CalendlyEmbed() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Frame that works in both dark & light mode */}
      <div className="rounded-2xl p-[2px] bg-gradient-to-b from-blue-500/40 via-blue-400/20 to-blue-500/10 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20">
        <div className="rounded-[14px] overflow-hidden bg-white dark:bg-[#0b1220] border border-black/5 dark:border-white/10">
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
  );
}
