"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = memo(function LoadingScreen({
  onComplete,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), 1900);
    const doneTimer = setTimeout(() => onComplete(), 2450);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
          style={{ background: "var(--bg)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Orb loader */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Ambient pulse */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 80,
                height: 80,
                background:
                  "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Core */}
            <div
              className="rounded-full relative overflow-hidden"
              style={{
                width: 44,
                height: 44,
                background:
                  "radial-gradient(circle at 36% 34%, var(--orb-core) 0%, var(--orb-mid) 55%, #0c4a6e 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
              }}
            />
          </motion.div>

          {/* Name */}
          <motion.p
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-muted)",
              letterSpacing: "0.26em",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              marginTop: "1.5rem",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
          >
            jell urmeneta
          </motion.p>

          {/* Progress track */}
          <motion.div
            style={{
              width: 100,
              height: 1,
              background: "var(--border)",
              borderRadius: 1,
              marginTop: "1.25rem",
              overflow: "hidden",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              style={{
                height: "100%",
                background: "var(--accent)",
                borderRadius: 1,
              }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default LoadingScreen;
