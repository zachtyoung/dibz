import type { Metadata } from "next";
import "./globals.css";
import { CityProvider } from "@/components/CityProvider";

export const metadata: Metadata = {
  title: "Dibz — Buy, sell & find garage sales near you",
  description: "A neighborhood-first marketplace. Browse, post, and discover garage sales on a live map.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        <CityProvider>{children}</CityProvider>
      </body>
    </html>
  );
}
