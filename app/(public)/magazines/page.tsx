import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MagazinesClient } from "./magazines-client";

export const metadata = {
  title: "Magazines Archive | KakatiyaPulse",
  description: "Browse and read digital magazines from KakatiyaPulse.",
};

export default function MagazinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <MagazinesClient />
      <Footer />
    </div>
  );
}
