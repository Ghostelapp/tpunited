import type { Metadata } from "next";
import "./globals.css";
import VisitorAnalytics from "@/components/tpu/visitor-analytics";
import {AuthProvider} from "@/components/tpu/auth-provider";

export const metadata: Metadata = {
  title: "Trash Panda United — Own the Wasteland",
  description: "Scavenge, fight, craft and build a home in Trash Town. A pixel cyberpunk world with Base-powered land ownership.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><AuthProvider>{children}<VisitorAnalytics/></AuthProvider></body>
    </html>
  );
}
