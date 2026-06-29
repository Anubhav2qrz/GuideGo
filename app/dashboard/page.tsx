"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock, ArrowRight, Settings, CreditCard, Heart, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { GuideTracker } from "@/components/tracking/guide-tracker";
import { supabase } from "@/lib/supabase";

const tabs = [
  { name: "Upcoming Bookings", icon: Calendar, active: true },
  { name: "Past Trips", icon: History, active: false },
  { name: "Settings", icon: Settings, active: false },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Traveler";
  const isGuide = user?.user_metadata?.role === 'guide';

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      
      const column = isGuide ? 'guide_id' : 'traveler_id';
      const foreignTable = isGuide ? 'traveler_id' : 'guide_id'; // We want the other person's profile
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          other_person:profiles!bookings_${foreignTable}_fkey(id, full_name, avatar_url, city, hourly_rate)
        `)
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data);
      }
      setLoading(false);
    }
    
    fetchBookings();
  }, [user, isGuide]);
  
  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{isGuide ? "Guide Dashboard" : "My Dashboard"}</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {userName}! You have {bookings.length} upcoming trips.</p>
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
            {loading ? (
              <div className="text-center py-10">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground mb-6">Looks like you don't have any trips planned yet.</p>
                {!isGuide && (
                  <Button className="bg-brand-blue text-white" asChild>
                    <Link href="/explore">Explore Destinations</Link>
                  </Button>
                )}
              </div>
            ) : (
              bookings.map((booking, idx) => (
                <ScrollReveal key={booking.id} delay={0.2 + (idx * 0.1)}>
                  <div className="rounded-3xl border bg-card overflow-hidden shadow-sm">
                    <div className="bg-brand-blue/5 p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="bg-brand-emerald text-white hover:bg-emerald-600 mb-2 capitalize">{booking.status}</Badge>
                          <h2 className="text-xl font-bold">Trip with {booking.other_person?.full_name || 'Traveler'}</h2>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Booking Ref</p>
                          <p className="font-mono font-medium text-xs">#{booking.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Date</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-brand-blue" />
                            {booking.booking_date}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Time</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-brand-blue" />
                            {booking.booking_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Guests</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-brand-blue" />
                            {booking.guests} People
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                          <p className="font-semibold">{formatPrice(booking.total_price)}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden">
                            <Image src={booking.other_person?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"} alt="Avatar" fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{isGuide ? "Your Traveler" : "Your Guide"}</p>
                            <p className="font-semibold">{booking.other_person?.full_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 w-full sm:w-auto">
                          <Button variant="outline" className="flex-1 sm:flex-none" asChild>
                            <Link href={`/messages?booking=${booking.id}`}>Message</Link>
                          </Button>
                          {!isGuide && (
                            <Button className="flex-1 sm:flex-none bg-brand-emerald hover:bg-emerald-600 text-white" asChild>
                              <Link href={`/track/${booking.id}`}>Live Map</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isGuide && (
                    <div className="mt-4">
                      <GuideTracker guideId={user?.id || ""} bookingId={booking.id} />
                    </div>
                  )}
                </ScrollReveal>
              ))
            )}

            {!isGuide && (
              <ScrollReveal delay={0.4}>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
