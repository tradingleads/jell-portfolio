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
    initial: [0.03, -0.03],
    // clickToFront must be the boolean false, not 0 — the library's own
    // click handler checks `this.clickToFront === false`, and 0 fails that
    // strict check, so it would still run the whole-sphere "rotate to front"
    // animation (just over 0ms, i.e. an instant jump instead of an animated
    // one). false is the only value that actually skips that reorientation
    // and stops the "moves away" jump on click.
    clickToFront: false,
    outlineColour: "#0000",
    // Slow, steady continuous drift — never fully stops.
    maxSpeed: 0.015,
    minSpeed: 0.008,
    // dragControl:false previously also removed the library's mousedown
    // listener, which is what it uses to detect a click on a tag at all —
    // that's why the name label stopped showing at one point. Keep it on
    // (desktop default) so clicks are still detected.
    dragControl: true,
    dragThreshold: 12,
    // No freezeActive: the cloud keeps drifting continuously even while a
    // tag is active/clicked, instead of pausing.
  },
};

// react-icon-cloud fetches from a pinned simple-icons@14.0.0 CDN snapshot.
// VS Code was removed from Simple Icons' active distribution at some point
// (confirmed against both the current and several older published versions,
// plus Simple Icons' own metadata marking it "hidden") so it 404s there even
// though the slug itself is real. This is that same official artwork
// (path + hex sourced from simple-icons@10.0.0's own data, last version that
// still shipped it) supplied locally instead of fetched, so IconCloud can
// still render it.
const EXTRA_ICONS: Record<string, SimpleIcon> = {
  visualstudiocode: {
    slug: "visualstudiocode",
    title: "Visual Studio Code",
    hex: "007ACC",
    path: "M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z",
  },
};

// Microsoft Copilot has no entry in Simple Icons at all (checked the full
// current dataset plus a broad icon search — genuinely doesn't exist there),
// and its real mark is a four-color gradient blossom that can't be flattened
// into Simple Icons' single-path/hex format like everything else in
// EXTRA_ICONS. This is the official artwork (provided directly, verbatim —
// gradients, viewBox and all) rendered as its own full-color SVG instead.
const COPILOT_TITLE = "Microsoft Copilot";
const COPILOT_VIEWBOX = "0 23.3 512.1 465.4";
const COPILOT_SVG_BODY = '<radialGradient id="a" cx="-79.674" cy="645.551" r="11.637" gradientTransform="matrix(-10.9605 -13.3892 -12.5901 10.3064 7673.291 -7504.614)" gradientUnits="userSpaceOnUse"><stop offset=".096" style="stop-color:#00aeff"/><stop offset=".773" style="stop-color:#2253ce"/><stop offset="1" style="stop-color:#0736c4"/></radialGradient><path d="M374 62c-6.7-22.9-27.8-38.7-51.7-38.7h-15.7c-26 0-48.3 18.6-53 44.2l-26.9 146.8 6.7-22.9c6.7-23 27.8-38.8 51.7-38.8h91.4l38.3 14.9 36.9-14.9H441c-23.9 0-45-15.8-51.7-38.7z" style="fill:url(#a)"/><radialGradient id="b" cx="-20.581" cy="641.788" r="11.637" gradientTransform="matrix(9.8803 12.5737 12.1968 -9.5842 -7518.271 6768.395)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#ffb657"/><stop offset=".634" style="stop-color:#ff5f3d"/><stop offset=".923" style="stop-color:#c02b3c"/></radialGradient><path d="M143.5 449.8c6.7 23 27.8 38.9 51.8 38.9h33.4c29.2 0 53.1-23.3 53.9-52.5l3.6-141.5-7.6 26c-6.7 23-27.8 38.7-51.7 38.7h-92.2l-32.9-17.8-35.6 17.8h10.6c24 0 45.1 15.9 51.8 38.9z" style="fill:url(#b)"/><linearGradient id="c" x1="151.476" x2="178.106" y1="452.543" y2="144.451" gradientTransform="matrix(1 0 0 -1 0 514)" gradientUnits="userSpaceOnUse"><stop offset=".156" style="stop-color:#0d91e1"/><stop offset=".487" style="stop-color:#52b471"/><stop offset=".652" style="stop-color:#98bd42"/><stop offset=".937" style="stop-color:#ffc800"/></linearGradient><path d="M320 23.3H133.4C80 23.3 48 93.7 26.7 164.2 1.4 247.7-31.6 359.4 64 359.4h80.6c24.1 0 45.2-15.9 51.8-39.1 14-49 38.6-134.5 57.9-199.6 9.8-33.1 18-61.5 30.5-79.2 7.1-9.9 18.8-18.2 35.2-18.2" style="fill:url(#c)"/><linearGradient id="d" x1="154.129" x2="168.669" y1="491.116" y2="155.012" gradientTransform="matrix(1 0 0 -1 0 514)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#3dcbff"/><stop offset=".247" style="stop-color:#0588f7;stop-opacity:0"/></linearGradient><path d="M320 23.3H133.4C80 23.3 48 93.7 26.7 164.2 1.4 247.7-31.6 359.4 64 359.4h80.6c24.1 0 45.2-15.9 51.8-39.1 14-49 38.6-134.5 57.9-199.6 9.8-33.1 18-61.5 30.5-79.2 7.1-9.9 18.8-18.2 35.2-18.2" style="fill:url(#d)"/><radialGradient id="e" cx="-46.943" cy="664.318" r="11.637" gradientTransform="matrix(-12.6711 36.2357 43.4092 15.1796 -28974.764 -8263.428)" gradientUnits="userSpaceOnUse"><stop offset=".066" style="stop-color:#8c48ff"/><stop offset=".5" style="stop-color:#f2598a"/><stop offset=".896" style="stop-color:#ffb152"/></radialGradient><path d="M192 488.7h186.7c53.3 0 85.3-70.5 106.7-141 25.3-83.5 58.3-195.2-37.3-195.2h-80.6c-24.1 0-45.2 15.9-51.8 39.1-14 49-38.6 134.6-57.9 199.7-9.8 33.1-18 61.5-30.5 79.2-7.2 9.9-18.9 18.2-35.3 18.2" style="fill:url(#e)"/><linearGradient id="f" x1="352.459" x2="352.268" y1="382.231" y2="290.663" gradientTransform="matrix(1 0 0 -1 0 514)" gradientUnits="userSpaceOnUse"><stop offset=".058" style="stop-color:#f8adfa"/><stop offset=".708" style="stop-color:#a86edd;stop-opacity:0"/></linearGradient><path d="M192 488.7h186.7c53.3 0 85.3-70.5 106.7-141 25.3-83.5 58.3-195.2-37.3-195.2h-80.6c-24.1 0-45.2 15.9-51.8 39.1-14 49-38.6 134.6-57.9 199.7-9.8 33.1-18 61.5-30.5 79.2-7.2 9.9-18.9 18.2-35.3 18.2" style="fill:url(#f)"/>';

const renderCopilotIcon = (onSelect?: (title: string) => void, size = 40) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${COPILOT_VIEWBOX}" width="${size}" height="${size}">${COPILOT_SVG_BODY}</svg>`;
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return (
    <a
      key="microsoftcopilot"
      href={undefined}
      title={COPILOT_TITLE}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.preventDefault();
        onSelect?.(COPILOT_TITLE);
      }}
    >
      <img src={src} width={size} height={size} alt={COPILOT_TITLE} />
    </a>
  );
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
    const remoteSlugs = iconSlugs.filter((s) => !EXTRA_ICONS[s] && s !== "microsoftcopilot");
    fetchSimpleIcons({ slugs: remoteSlugs })
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
    // Render in the order the caller listed them, pulling each from
    // whichever source actually has it.
    return iconSlugs
      .map((slug) => {
        if (slug === "microsoftcopilot") return renderCopilotIcon(handleSelect);
        const icon = EXTRA_ICONS[slug] ?? data.simpleIcons[slug];
        return icon ? renderCustomIcon(icon, resolvedTheme || "light", handleSelect) : null;
      })
      .filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, resolvedTheme, iconSlugs]);

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
