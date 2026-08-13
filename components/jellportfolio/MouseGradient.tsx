"use client";

import { memo, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const MouseGradient = memo(function MouseGradient() {
  const rawX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 0
  );
  const rawY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0
  );

  const x = useSpring(rawX, { stiffness: 40, damping: 18, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 40, damping: 18, mass: 0.8 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 640,
          height: 640,
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)",
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
});

export default MouseGradient;
