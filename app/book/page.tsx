"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, Users, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { guides } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

function BookingContent() {
  const searchParams = useSearchParams();
  const guideSlug = searchParams?.get("guide");
  const guide = guides.find((g) => g.slug === guideSlug) || guides[0]; // Fallback to first guide if not found
  
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [hours, setHours] = useState("4");
  
  const total = guide.hourlyRate * parseInt(hours || "0");

  return (
    <div className="min-h-screen bg-muted/20 pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href={`/guides/${guide.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guide Profile
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Book Your Experience</h1>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Booking Flow */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">
              {step === 1 ? (
                <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold mb-6">1. Tour Details</h2>
                  
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="date" 
                            className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <select 
                            className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                          >
                            <option value="">Select time</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="15:00">03:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (Hours)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <select 
                            className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                          >
                            <option value="2">2 Hours</option>
                            <option value="3">3 Hours</option>
                            <option value="4">4 Hours (Half Day)</option>
                            <option value="6">6 Hours</option>
                            <option value="8">8 Hours (Full Day)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Guests</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <select 
                            className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                          >
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                            <option value="5">5+ Guests</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button 
                      className="bg-brand-blue hover:bg-brand-blue-dark h-12 px-8 text-white" 
                      onClick={() => setStep(2)}
                      disabled={!date || !time}
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="shrink-0">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-bold">2. Payment Details</h2>
                  </div>
                  
                  <div className="rounded-xl border border-brand-emerald/20 bg-brand-emerald/5 p-4 mb-6 flex gap-3 text-sm text-brand-emerald">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <p>Your payment is secure. We use bank-level encryption to protect your data.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CVC</label>
                        <input type="text" placeholder="123" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name on Card</label>
                      <input type="text" placeholder="John Doe" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button 
                      className="bg-brand-emerald hover:bg-emerald-600 h-12 w-full sm:w-auto px-8 text-white" 
                      onClick={() => setStep(3)}
                    >
                      Pay {formatPrice(total)} & Confirm Booking
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-brand-emerald/20 bg-brand-emerald/5 p-8 text-center sm:p-12 shadow-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-emerald text-white">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-emerald mb-2">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mb-8">
                    Your guide {guide.name} has been notified. You will receive an email confirmation shortly.
                  </p>
                  <Button asChild className="bg-brand-emerald hover:bg-emerald-600 text-white h-12 px-8">
                    <Link href="/dashboard">Go to My Bookings</Link>
                  </Button>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Booking Summary Sidebar */}
          <div className="order-first lg:order-last">
            <ScrollReveal delay={0.2}>
              <div className="sticky top-24 rounded-3xl border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
                
                <div className="flex gap-4 pb-4 border-b">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={guide.avatar} alt={guide.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{guide.name}</h4>
                    <p className="text-sm text-muted-foreground">{guide.city}</p>
                  </div>
                </div>
                
                <div className="py-4 space-y-3 border-b text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{date || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{time || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                </div>
                
                <div className="py-4 space-y-3 border-b text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{formatPrice(guide.hourlyRate)} x {hours} hours</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{formatPrice(total * 0.1)}</span>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-brand-blue">{formatPrice(total + (total * 0.1))}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
