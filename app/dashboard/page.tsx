"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock, ArrowRight, Settings, CreditCard, Heart, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { guides } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

const tabs = [
  { name: "Upcoming Bookings", icon: Calendar, active: true },
  { name: "Past Trips", icon: History, active: false },
  { name: "Saved Guides", icon: Heart, active: false },
  { name: "Payment Methods", icon: CreditCard, active: false },
  { name: "Settings", icon: Settings, active: false },
];

export default function DashboardPage() {
  const upcomingBooking = guides[0];
  
  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, John! You have 1 upcoming trip.</p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <ScrollReveal delay={0.1}>
            <div className="rounded-3xl border bg-card p-4 shadow-sm">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.name}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        tab.active
                          ? "bg-brand-blue/10 text-brand-blue"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
                <div className="pt-4 mt-4 border-t">
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </ScrollReveal>

          {/* Main Content */}
          <div className="space-y-6">
            <ScrollReveal delay={0.2}>
              <div className="rounded-3xl border bg-card overflow-hidden shadow-sm">
                <div className="bg-brand-blue/5 p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-brand-emerald text-white hover:bg-emerald-600 mb-2">Confirmed</Badge>
                      <h2 className="text-xl font-bold">Half-Day Food Tour in {upcomingBooking.city}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Booking Ref</p>
                      <p className="font-mono font-medium">#GG-84729</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-blue" />
                        Oct 24, 2026
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Time</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-blue" />
                        10:00 AM (4 hrs)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-blue" />
                        {upcomingBooking.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                      <p className="font-semibold">{formatPrice(upcomingBooking.hourlyRate * 4 * 1.1)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image src={upcomingBooking.avatar} alt={upcomingBooking.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Your Guide</p>
                        <Link href={`/guides/${upcomingBooking.slug}`} className="font-semibold hover:text-brand-blue hover:underline">
                          {upcomingBooking.name}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button variant="outline" className="flex-1 sm:flex-none">Message</Button>
                      <Button className="flex-1 sm:flex-none bg-brand-blue hover:bg-brand-blue-dark text-white">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="rounded-3xl border bg-brand-emerald/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-brand-emerald mb-2">Ready for your next adventure?</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Explore new cities, find verified local guides, and create unforgettable memories.
                  </p>
                </div>
                <Button className="bg-brand-emerald hover:bg-emerald-600 text-white shrink-0" asChild>
                  <Link href="/explore">
                    Explore Destinations <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
