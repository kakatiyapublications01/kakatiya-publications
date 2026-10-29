import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MagazinesClient } from "./magazines-client";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Magazines Archive",
  description: "Browse every published issue of KakatiyaPulse magazine, including the current digital edition and the full archive of past issues.",
  path: "/magazines",
});

export default function MagazinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <MagazinesClient />
      <Footer />
    </div>
  );
}
