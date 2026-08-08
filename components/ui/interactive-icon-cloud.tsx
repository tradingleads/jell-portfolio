"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
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
      paddingTop: 40,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: "default",
    tooltip: "native",
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#0000",
    maxSpeed: 0.05,
    minSpeed: 0.025,
  },
};

// bg/fallback colors mirror this site's --ld-card / --ld-muted / --ld-text
// tokens (globals.css) so the icon bubbles blend into the panel in both themes.
export const renderCustomIcon = (icon: SimpleIcon, theme: string) => {
  const bgHex = theme === "light" ? "#f5f5f7" : "#10131a";
  const fallbackHex = theme === "light" ? "#777777" : "#ffffff";
  const minContrastRatio = theme === "dark" ? 2 : 1.2;

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 48,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: any) => e.preventDefault(),
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
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchSimpleIcons({ slugs: iconSlugs })
      .then(setData)
      .catch(() => setError(true));
  }, [iconSlugs]);

  const renderedIcons = useMemo(() => {
    if (!data) return null;
    return Object.values(data.simpleIcons).map((icon) =>
      renderCustomIcon(icon, resolvedTheme || "light"),
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
              width: 48, height: 48, borderRadius: "50%",
              background: "var(--ld-border)",
              animation: "ld-pulse 1.6s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    // @ts-ignore
    <Cloud {...cloudProps}>
      <>{renderedIcons}</>
    </Cloud>
  );
}
