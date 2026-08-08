"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  fetchSimpleIcons,
  ICloud,
  renderSimpleIcon,
  SimpleIcon,
} from "react-icon-cloud";

export const cloudProps: Omit<ICloud, "children"> = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingTop: 20,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: "pointer",
    tooltip: "native",
    tooltipDelay: 0,
    initial: [0.05, -0.05],
    // clickToFront was rotating the whole sphere to bring the clicked icon to
    // center on every click — that whole-cloud reorientation is what read as
    // "moves away". Turning it off leaves the cloud exactly where it was.
    clickToFront: false,
    outlineColour: "#0000",
    // Subtle, slow ambient drift.
    maxSpeed: 0.02,
    minSpeed: 0.01,
    // dragControl:false previously also removed the library's mousedown
    // listener, which is what it uses to detect a click on a tag at all —
    // that's why the name label stopped showing. Keep it on (desktop default)
    // so clicks are still detected, and freezeActive keeps the cloud still
    // while a tag is active instead of visibly drifting under the label.
    dragControl: true,
    dragThreshold: 12,
    freezeActive: true,
  },
};

// bg/fallback colors mirror this site's --ld-card / --ld-muted / --ld-text
// tokens (globals.css) so the icon bubbles blend into the panel in both themes.
export const renderCustomIcon = (
  icon: SimpleIcon,
  theme: string,
  onSelect?: (title: string) => void,
) => {
  const bgHex = theme === "light" ? "#f5f5f7" : "#10131a";
  const fallbackHex = theme === "light" ? "#777777" : "#ffffff";
  const minContrastRatio = theme === "dark" ? 2 : 1.2;

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 40,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      // Native browser tooltip on hover (desktop).
      title: icon.title,
      onClick: (e: any) => {
        e.preventDefault();
        // Touch devices have no hover, so a tap surfaces the same name as a visible label.
        onSelect?.(icon.title);
      },
      style: { cursor: "pointer" },
    },
  });
};

export type DynamicCloudProps = {
  iconSlugs: string[];
};

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>;

export function IconCloud({ iconSlugs }: DynamicCloudProps) {
  const [data, setData] = useState<IconData | null>(null);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchSimpleIcons({ slugs: iconSlugs })
      .then(setData)
      .catch(() => setError(true));
  }, [iconSlugs]);

  useEffect(() => {
    if (!activeTool) return;
    const t = setTimeout(() => setActiveTool(null), 2200);
    return () => clearTimeout(t);
  }, [activeTool]);

  const renderedIcons = useMemo(() => {
    if (!data) return null;
    return Object.values(data.simpleIcons).map((icon) =>
      renderCustomIcon(icon, resolvedTheme || "light", setActiveTool),
    );
  }, [data, resolvedTheme]);

  if (error) {
    return (
      <p style={{ fontSize: "0.8125rem", color: "var(--ld-muted)", textAlign: "center", padding: "60px 20px" }}>
        Couldn&apos;t load the tool icons — check your connection and refresh.
      </p>
    );
  }

  if (!mounted || !data) {
    return (
      <div
        aria-hidden="true"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 24,
          width: "100%",
          maxWidth: 440,
          padding: "48px 20px",
        }}
      >
        {iconSlugs.map((slug) => (
          <div
            key={slug}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--ld-border)",
              animation: "ld-pulse 1.6s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
      {/* @ts-ignore */}
      <Cloud {...cloudProps}>
        <>{renderedIcons}</>
      </Cloud>

      {/* Click/tap feedback — a quick soft pulse acknowledges the click, then
          the name pops in immediately right on top of it. */}
      <AnimatePresence>
        {activeTool && (
          <div
            key={activeTool}
            style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              display: "flex", pointerEvents: "none",
            }}
          >
            <div style={{ position: "relative", display: "flex" }}>
              <motion.span
                initial={{ opacity: 0.5, scale: 0.4 }}
                animate={{ opacity: 0, scale: 2.2 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  position: "absolute", inset: -6,
                  borderRadius: 100,
                  background: "var(--ld-accent)",
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                style={{
                  position: "relative",
                  padding: "7px 16px",
                  borderRadius: 100,
                  background: "var(--ld-bg)",
                  border: "1px solid var(--ld-borderC)",
                  boxShadow: "var(--ld-shadow)",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--ld-accent)",
                  whiteSpace: "nowrap",
                }}
              >
                {activeTool}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
