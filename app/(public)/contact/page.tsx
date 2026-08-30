import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with KakatiyaPulse editorial and management team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Get In Touch</SectionSubtitle>
            <H1 gradient>Contact Us</H1>
            <Text className="text-[#555555]">
              Have a press inquiry, editorial submission, or magazine feature request? We welcome your correspondence.
            </Text>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
            {/* Contact Form */}
            <Card className="lg:col-span-7 p-8 bg-white border-[#E5E5E0]">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium mb-2">
                    Subject / Category
                  </label>
                  <select className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]">
                    <option>Editorial Submission</option>
                    <option>VIP / VVIP Feature Request</option>
                    <option>Magazine Order Inquiry</option>
                    <option>General Correspondence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                    placeholder="Write your message here..."
                  />
                </div>

                <Button variant="green" className="w-full" size="md" type="button">
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Office Info */}
            <Card className="lg:col-span-5 p-8 space-y-6 flex flex-col justify-between bg-[#F8F7F3] border-[#E5E5E0]">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#14532D] mb-4">Publication Desk</h3>
                <div className="space-y-4 text-sm text-[#555555]">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium">Headquarters</span>
                    <p className="mt-1">{siteConfig.contact.address}</p>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium">Email Desk</span>
                    <p className="mt-1 text-[#14532D] font-semibold">{siteConfig.contact.email}</p>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium">Telephone</span>
                    <p className="mt-1">{siteConfig.contact.phone}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E5E0] text-xs text-[#555555]">
                Operating Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST
              </div>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
