import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kakatiya Publications | Premium Editorial & Digital Magazine",
    template: "%s | Kakatiya Publications",
  },
  description:
    "Kakatiya Publications is a premier luxury editorial publishing brand, delivering high-impact magazines, prestigious VIP profile features, and cultural stories.",
  keywords: [
    "Kakatiya Publications",
    "Kakatiya Magazine",
    "Editorial Publishing",
    "VIP Features",
    "VVIP Profiles",
    "Digital Magazine",
    "Telugu Cultural Publications",
  ],
  authors: [{ name: "Kakatiya Publications Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Kakatiya Publications | Premium Editorial Publishing",
    description: "Discover luxury digital magazines, VVIP features, and editorial stories.",
    url: "https://kakatiyapublications.com",
    siteName: "Kakatiya Publications",
    locale: "en_US",
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
      className={`${playfair.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5] selection:bg-[#d4af37]/30 selection:text-[#fef3c7]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
