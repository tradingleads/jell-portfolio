import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jell Urmeneta — AI Automation Specialist",
  description:
    "AI Automation & Workflow Specialist based in Rizal, Philippines. I build systems that eliminate busywork and help businesses scale faster.",
  keywords: [
    "AI automation",
    "workflow automation",
    "n8n specialist",
    "Zapier",
    "Make",
    "Philippines freelancer",
  ],
  openGraph: {
    title: "Jell Urmeneta — AI Automation Specialist",
    description:
      "I build AI systems that save time, remove busywork, and help businesses grow faster.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
