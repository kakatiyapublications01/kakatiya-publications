import type { Metadata, Viewport } from "next";
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
    default: "KakatiyaPulse | Premium Editorial & Digital Magazine",
    template: "%s | KakatiyaPulse",
  },
  description:
    "KakatiyaPulse is a premier editorial and community publication brand, delivering high-impact magazines, prestigious VIP profile features, and cultural stories.",
  keywords: [
    "KakatiyaPulse",
    "Kakatiya Pulse",
    "Kakatiya Magazine",
    "Editorial Publishing",
    "VIP Features",
    "VVIP Profiles",
    "Digital Magazine",
    "Telugu Cultural Publications",
  ],
  authors: [{ name: "KakatiyaPulse Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "KakatiyaPulse | Premium Editorial Publishing",
    description: "Discover luxury digital magazines, VVIP features, and editorial stories.",
    url: "https://kakatiyapulse.com",
    siteName: "KakatiyaPulse",
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
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#1C1C1C] selection:bg-[#14532D]/20 selection:text-[#14532D]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
