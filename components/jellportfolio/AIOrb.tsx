"use client";

import { memo, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export type OrbState = "idle" | "thinking" | "speaking";

interface AIORbProps {
  state: OrbState;
}

const AIOrb = memo(function AIOrb({ state }: AIORbProps) {
  const scale = useMotionValue(1);
  const glowOpacity = useMotionValue(0.45);
  const ringRotation = useMotionValue(0);
  const floatY = useMotionValue(0);

  // Float — always running
  useEffect(() => {
    const ctrl = animate(floatY, [0, -10, 0], {
      duration: 5.5,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return () => ctrl.stop();
  }, [floatY]);

  // State-driven pulse + ring
  useEffect(() => {
    const ctrls: ReturnType<typeof animate>[] = [];

    if (state === "idle") {
      ctrls.push(
        animate(scale, [1, 1.028, 1], {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }),
        animate(glowOpacity, [0.35, 0.6, 0.35], {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        })
      );
    } else if (state === "thinking") {
      ctrls.push(
        animate(scale, [1, 1.07, 0.96, 1.05, 1], {
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }),
        animate(glowOpacity, [0.55, 1, 0.55], {
          duration: 0.9,
          repeat: Infinity,
          ease: "easeInOut",
        }),
        animate(ringRotation, [0, 360], {
          duration: 2.8,
          repeat: Infinity,
          ease: "linear",
        })
      );
    } else {
      // speaking
      ctrls.push(
        animate(scale, [1, 1.042, 1, 1.018, 1], {
          duration: 0.75,
          repeat: Infinity,
          ease: "easeInOut",
        }),
        animate(glowOpacity, [0.45, 0.85, 0.45], {
          duration: 0.55,
          repeat: Infinity,
          ease: "easeInOut",
        })
      );
    }

    return () => ctrls.forEach((c) => c.stop());
  }, [state, scale, glowOpacity, ringRotation]);

  const counterRotation = useTransform(ringRotation, (r) => -r * 1.4);

  return (
    <motion.div
      className="relative flex items-center justify-center select-none"
      style={{ y: floatY, width: 168, height: 168 }}
      aria-hidden
    >
      {/* Outer ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 68%)",
          opacity: glowOpacity,
          scale,
        }}
      />

      {/* Rotating outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 156,
          height: 156,
          border: "1px solid var(--border-accent)",
          rotate: ringRotation,
          opacity: state === "thinking" ? 0.7 : 0.25,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Counter-rotating inner ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 124,
          height: 124,
          border: "1px dashed var(--border-accent)",
          rotate: counterRotation,
          opacity: 0.18,
        }}
      />

      {/* Core sphere */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 90,
          height: 90,
          scale,
          background:
            "radial-gradient(circle at 36% 34%, var(--orb-core) 0%, var(--orb-mid) 48%, #0c4a6e 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: 30,
            height: 30,
            top: 12,
            left: 16,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)",
          }}
        />
        {/* Dark inner core */}
        <div
          className="absolute rounded-full"
          style={{
            width: 34,
            height: 34,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.28)",
          }}
        />
      </motion.div>

      {/* Thinking — orbital particles */}
      {state === "thinking" &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: 4, height: 4, background: "var(--accent)" }}
            animate={{
              x: [
                Math.cos((i * 60 * Math.PI) / 180) * 68,
                Math.cos(((i * 60 + 180) * Math.PI) / 180) * 68,
                Math.cos((i * 60 * Math.PI) / 180) * 68,
              ],
              y: [
                Math.sin((i * 60 * Math.PI) / 180) * 68,
                Math.sin(((i * 60 + 180) * Math.PI) / 180) * 68,
                Math.sin((i * 60 * Math.PI) / 180) * 68,
              ],
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.28,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Speaking — outward ripple rings */}
      {state === "speaking" &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ border: "1px solid var(--accent)" }}
            animate={{
              width: [90, 168],
              height: [90, 168],
              opacity: [0.55, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.52,
              ease: "easeOut",
            }}
          />
        ))}
    </motion.div>
  );
});

export default AIOrb;
