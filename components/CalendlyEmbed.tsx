"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { InlineWidget } from "react-calendly";

const CALENDLY_URL = "https://calendly.com/jellurmeneta64/new-meeting";
const EMBED_HEIGHT = 540;

const CalendlySkeleton = memo(function CalendlySkeleton() {
  return (
    <div
      style={{ height: EMBED_HEIGHT }}
      className="flex items-center justify-center p-8"
    >
      <div className="w-full space-y-3">
        <motion.div
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-6 w-2/3 rounded-md"
          style={{ background: "rgba(226,232,240,0.08)" }}
        />
        <div className="grid grid-cols-7 gap-2 pt-2">
          {Array.from({ length: 21 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: (i % 7) * 0.05,
                ease: "easeInOut",
              }}
              className="aspect-square rounded-md"
              style={{ background: "rgba(226,232,240,0.08)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

function CalendlyEmbed() {
  return (
    <div className="max-w-xl mx-auto">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0b1220",
          border: "1px solid rgba(59,130,246,0.35)",
          boxShadow:
            "0 0 40px -8px rgba(59,130,246,0.35), 0 20px 45px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <InlineWidget
          url={CALENDLY_URL}
          styles={{ height: EMBED_HEIGHT, width: "100%" }}
          pageSettings={{
            backgroundColor: "0b1220",
            textColor: "e2e8f0",
            primaryColor: "3b82f6",
            hideEventTypeDetails: true,
            hideLandingPageDetails: true,
          }}
          LoadingSpinner={CalendlySkeleton}
        />
      </div>
    </div>
  );
}

export default CalendlyEmbed;
