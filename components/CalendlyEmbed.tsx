"use client";

import { InlineWidget } from "react-calendly";

export default function CalendlyEmbed() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer frame */}
      <div className="rounded-2xl p-1.5 bg-gradient-to-b from-blue-500/30 via-white/10 to-transparent shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]">
        <div className="rounded-xl overflow-hidden bg-[#0b1220] border border-white/10">
          <InlineWidget
            url="https://calendly.com/jellurmeneta64/new-meeting"
            styles={{
              height: "440px",
              minWidth: "320px",
            }}
            pageSettings={{
              backgroundColor: "0b1220",
              textColor: "e2e8f0",
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
