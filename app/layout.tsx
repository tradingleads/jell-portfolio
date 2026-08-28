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
  metadataBase: new URL("https://withjell.vercel.app"),
  title: "Jell Urmeneta — AI Automation Specialist",
  description:
    "AI Automation & Workflow Specialist based in Rizal, Philippines. She builds systems that eliminate busywork and help businesses scale faster.",
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
      "She builds AI systems that save time, remove busywork, and help businesses grow faster.",
    type: "website",
    images: ["/logo-icon.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jell Urmeneta",
  url: "https://withjell.vercel.app",
  image: "https://withjell.vercel.app/logo-icon.png",
  jobTitle: "AI Automation Specialist",
  gender: "Female",
  description:
    "Jell Urmeneta is a Filipina AI Automation Specialist based in Rizal, Philippines. She builds AI-powered workflow automation systems for businesses.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "Rizal",
    addressCountry: "PH",
  },
  sameAs: ["https://www.linkedin.com/in/jellurmeneta"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
