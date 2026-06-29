"use client";

import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Get in touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question about a booking, want to become a guide, or just want to say hello? We'd love to hear from you.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-12 lg:grid-cols-2">
          <ScrollReveal delay={0.1}>
            <div className="rounded-3xl border bg-card p-8 shadow-lg h-full">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input type="text" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input type="text" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input type="email" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <select className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2">
                    <option>General Inquiry</option>
                    <option>Booking Support</option>
                    <option>Guide Application</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea rows={5} className="w-full rounded-xl border bg-background p-4 text-sm outline-none focus:border-brand-blue focus:ring-2 resize-none"></textarea>
                </div>
                <Button className="w-full h-12 bg-brand-blue hover:bg-brand-blue-dark text-white text-base">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="space-y-8">
              <div className="rounded-3xl border bg-card p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-muted-foreground mt-1">support@guidego.com</p>
                      <p className="text-muted-foreground">partners@guidego.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Phone (24/7)</p>
                      <p className="text-muted-foreground mt-1">+91 (1800) 123-4567</p>
                      <p className="text-muted-foreground">International: +1 (555) 000-0000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Headquarters</p>
                      <p className="text-muted-foreground mt-1">123 Tech Park, Sector 5<br/>Salt Lake City, Kolkata<br/>West Bengal 700091, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
