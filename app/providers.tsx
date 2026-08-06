"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable browser scroll restoration so page always starts at top --
    // but only when there's no #anchor in the URL. Forcing scroll(0,0)
    // unconditionally was fighting the browser's native anchor scroll on
    // direct links / reloads of URLs like /#contact, leaving the page in
    // an inconsistent position depending on load timing.
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
