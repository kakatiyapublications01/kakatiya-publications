import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { EditorialHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Desk",
  description: "Get in touch with KakatiyaPulse editorial board and press desk.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <Container size="xl">
          <EditorialHeader
            title="Contact Desk"
            subtitle="Inquiries &amp; Submissions"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
            {/* Contact Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#14532D]">
                  Send an Editorial Dispatch
                </h3>
                <p className="text-xs text-[#555555]">
                  Please fill out the form below to reach the editorial desk or inquire about magazine features.
                </p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-[2px] px-3.5 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-[2px] px-3.5 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1">
                    Subject / Category
                  </label>
                  <select className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-[2px] px-3.5 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]">
                    <option value="editorial">Editorial Inquiry / Letter to the Editor</option>
                    <option value="magazine">Magazine Archive Feature Request</option>
                    <option value="vvip">VVIP / VIP Profile Nomination</option>
                    <option value="press">Press &amp; Media Partnership</option>
                    <option value="other">General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Enter your message or inquiry..."
                    className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-[2px] p-3.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                  />
                </div>

                <Button type="submit" variant="green" size="lg" className="w-full sm:w-auto">
                  Submit Correspondence
                </Button>
              </form>
            </div>

            {/* Editorial Bureau Details (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#E5E5E0] lg:pl-10">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                  Publishing Headquarters
                </span>
                <h3 className="font-serif text-xl font-bold text-[#14532D]">
                  KakatiyaPulse Editorial Office
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1C1C] block uppercase tracking-wider">
                      Office Address
                    </span>
                    <span className="text-[#555555] leading-relaxed">
                      {siteConfig.contact.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1C1C] block uppercase tracking-wider">
                      Editorial Email
                    </span>
                    <span className="text-[#555555]">{siteConfig.contact.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1C1C] block uppercase tracking-wider">
                      Telephone
                    </span>
                    <span className="text-[#555555]">{siteConfig.contact.phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#F8F7F3] border border-[#E5E5E0] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#14532D]">
                  Separation Notice
                </span>
                <p className="text-[11px] text-[#555555] leading-relaxed">
                  KakatiyaPulse is an independent, separate publication and holds no organizational affiliation with Kamma Voice.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
