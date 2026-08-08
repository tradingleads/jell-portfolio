"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [selection, setSelection] = useState<{ title: string; x: number; y: number } | null>(null);
  const { resolvedTheme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  // The click event this library dispatches to fire onClick has its
  // coordinates zeroed out, so there's no way to read "where was this icon"
  // from the click itself. mousedown/touchstart fire first, with real
  // coordinates, right at the icon the user is pressing — capture that
  // position here and pair it with the title once onClick tells us which
  // icon it was.
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const capturePointerPos = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Clamp so the label never overflows past the panel edge on outer icons.
    const x = Math.min(Math.max(clientX - rect.left, 70), rect.width - 70);
    const y = Math.min(Math.max(clientY - rect.top, 30), rect.height - 20);
    lastPointerPos.current = { x, y };
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchSimpleIcons({ slugs: iconSlugs })
      .then(setData)
      .catch(() => setError(true));
  }, [iconSlugs]);

  useEffect(() => {
    if (!selection) return;
    const t = setTimeout(() => setSelection(null), 2200);
    return () => clearTimeout(t);
  }, [selection]);

  const handleSelect = (title: string) => {
    const pos = lastPointerPos.current;
    setSelection({ title, x: pos?.x ?? 0, y: pos?.y ?? 0 });
  };

  const renderedIcons = useMemo(() => {
    if (!data) return null;
    return Object.values(data.simpleIcons).map((icon) =>
      renderCustomIcon(icon, resolvedTheme || "light", handleSelect),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div
      ref={containerRef}
      onMouseDownCapture={(e) => capturePointerPos(e.clientX, e.clientY)}
      onTouchStartCapture={(e) => {
        const t = e.touches[0];
        if (t) capturePointerPos(t.clientX, t.clientY);
      }}
      style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}
    >
      {/* @ts-ignore */}
      <Cloud {...cloudProps}>
        <>{renderedIcons}</>
      </Cloud>

      {/* Click/tap feedback, anchored right on the clicked icon: a quick soft
          pulse acknowledges the click, then the name pops in above it. */}
      <AnimatePresence>
        {selection && (
          <div
            key={`${selection.title}-${selection.x}-${selection.y}`}
            style={{
              position: "absolute", left: selection.x, top: selection.y,
              pointerEvents: "none",
            }}
          >
            {/* Pulse ring, centered exactly on the icon */}
            <motion.span
              initial={{ opacity: 0.55, scale: 0.3 }}
              animate={{ opacity: 0, scale: 2.4 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                position: "absolute", top: -20, left: -20,
                width: 40, height: 40,
                borderRadius: "50%",
                background: "var(--ld-accent)",
              }}
            />
            {/* Name label, floating just above the icon. x stays a constant
                -50% (self-width based, so it centers correctly regardless of
                text length) while y/scale/opacity animate — framer-motion
                composes all of these into one transform, so they can't be
                mixed with a separate static CSS transform on this element. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: "-50%", y: 0 }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: -34 }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              style={{
                position: "absolute", left: 0, top: 0,
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
              {selection.title}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
