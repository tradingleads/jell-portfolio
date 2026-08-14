import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      className={`${GeistMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
