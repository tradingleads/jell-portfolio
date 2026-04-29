"use client";

import { memo, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-full"
        style={{ background: "var(--border)" }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 rounded-full flex items-center justify-center glass"
      style={{ transition: "border-color 0.2s ease" }}
      whileHover={{ scale: 1.06, borderColor: "var(--border-accent)" }}
      whileTap={{ scale: 0.94 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -40, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 40, scale: 0.7 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {isDark ? (
            <Moon
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--text-secondary)" }}
            />
          ) : (
            <Sun
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--text-secondary)" }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
});

export default ThemeToggle;
