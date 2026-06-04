import type { Metadata } from "next";
import "./globals.css";
import { CityProvider } from "@/components/CityProvider";
import { SaleTicker } from "@/components/SaleTicker";
import { MapsProvider } from "@/components/MapsProvider";

export const metadata: Metadata = {
  title: "Dibz — Buy, sell & find garage sales near you",
  description: "A neighborhood-first marketplace. Browse, post, and discover garage sales on a live map.",
  metadataBase: new URL("https://dibz.it.com"),
  openGraph: {
    title: "Dibz — Buy, sell & find garage sales near you",
    description: "The neighborhood marketplace built around real maps and weekend garage sales — not endless scroll.",
    url: "https://dibz.it.com",
    siteName: "Dibz",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Dibz marketplace" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dibz — Buy, sell & find garage sales near you",
    description: "The neighborhood marketplace built around real maps and weekend garage sales — not endless scroll.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dibz" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f6b55" />
      </head>
      <body className="min-h-full antialiased">
        <MapsProvider>
          <CityProvider>
            {children}
            <SaleTicker />
          </CityProvider>
        </MapsProvider>
      </body>
    </html>
  );
}
