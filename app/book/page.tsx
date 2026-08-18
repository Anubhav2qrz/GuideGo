"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, Clock, Users, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchGuideById } from "@/lib/supabase-helpers";
import { supabase } from "@/lib/supabase";
import { Guide } from "@/types";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const guideId = searchParams?.get("guide");
  const { user } = useAuth();
  
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(true);
  
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [hours, setHours] = useState("4");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    async function loadGuide() {
      if (!guideId) return;
      const fetchedGuide = await fetchGuideById(guideId);
      setGuide(fetchedGuide);
      setIsLoadingGuide(false);
    }
    loadGuide();
  }, [guideId]);
  
  if (isLoadingGuide) {
    return <div className="min-h-screen pt-32 text-center text-muted-foreground">Loading guide details...</div>;
  }
  
  if (!guide) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive mb-2">Guide not found</h2>
        <p className="text-muted-foreground mb-6">The guide you&apos;re trying to book doesn&apos;t exist or has been removed.</p>
        <Button asChild><Link href="/explore">Browse Destinations</Link></Button>
      </div>
    );
  }

  const total = guide.hourlyRate * parseInt(hours || "0");
  const platformFee = Math.round(total * 0.1);
  const finalTotal = total + platformFee;

  // Validate before moving to payment
  const validateStep1 = (): boolean => {
    const errors: string[] = [];
    
    if (!date) errors.push("Please select a date.");
    if (!time) errors.push("Please select a start time.");
    
    // Prevent booking in the past
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.push("Cannot book for a past date.");
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setBookingError("You must be logged in to book a guide.");
      return;
    }
    
    setIsProcessing(true);
    setBookingError(null);
    
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Insert real booking with enhanced fields
    const { error } = await supabase
      .from('bookings')
      .insert({
        traveler_id: user.id,
        guide_id: guide.id,
        booking_date: date,
        booking_time: time,
        guests: parseInt(guests),
        duration_hours: parseInt(hours),
        total_price: finalTotal,
        platform_fee: platformFee,
        status: 'confirmed',
        meeting_location: specialRequests ? `Special requests: ${specialRequests}` : null,
      });
      
    setIsProcessing(false);
    
    if (error) {
      setBookingError(error.message);
    } else {
      setStep(3);
    }
  };

  // Minimum date is today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-muted/20 pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/explore">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explore
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Book Your Experience</h1>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    step >= s 
                      ? "bg-brand-blue text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`h-0.5 w-8 sm:w-16 transition-colors ${
                      step > s ? "bg-brand-blue" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
              <span className="ml-2 text-sm text-muted-foreground hidden sm:inline">
                {step === 1 ? "Tour Details" : step === 2 ? "Payment" : "Confirmed!"}
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Booking Flow */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">
              {step === 1 ? (
                <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold mb-6">1. Tour Details</h2>
                  
                  {validationErrors.length > 0 && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 mb-6 space-y-1">
                      {validationErrors.map((err, i) => (
                        <p key={i} className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {err}
                        </p>
                      ))}
                    </div>
                  )}
                  
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
                            min={today}
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
                            <option value="07:00:00">07:00 AM</option>
                            <option value="08:00:00">08:00 AM</option>
                            <option value="09:00:00">09:00 AM</option>
                            <option value="10:00:00">10:00 AM</option>
                            <option value="11:00:00">11:00 AM</option>
                            <option value="14:00:00">02:00 PM</option>
                            <option value="15:00:00">03:00 PM</option>
                            <option value="16:00:00">04:00 PM</option>
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

                    {/* Special Requests */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        Special Requests <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <textarea
                        className="w-full rounded-xl border bg-background p-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 resize-none"
                        rows={3}
                        placeholder="Any dietary restrictions, mobility needs, specific interests, or meeting point preferences..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button 
                      className="bg-brand-blue hover:bg-brand-blue-dark h-12 px-8 text-white" 
                      onClick={handleContinue}
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="shrink-0" disabled={isProcessing}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-bold">2. Payment Details</h2>
                  </div>
                  
                  <div className="rounded-xl border border-brand-emerald/20 bg-brand-emerald/5 p-4 mb-6 flex gap-3 text-sm text-brand-emerald">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <p>Your payment is secure. We use bank-level encryption to protect your data.</p>
                  </div>
                  
                  {bookingError && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 mb-6 text-sm text-destructive flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p>{bookingError}</p>
                    </div>
                  )}
                  
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
                      <input type="text" placeholder="Name" className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button 
                      className="bg-brand-emerald hover:bg-emerald-600 h-12 w-full sm:w-auto px-8 text-white" 
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Pay ${formatPrice(finalTotal)} & Confirm Booking`}
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
                    {guide.verified && (
                      <span className="text-xs text-brand-blue font-medium flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="h-3 w-3" /> Verified Guide
                      </span>
                    )}
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
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{hours} hours</span>
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
                    <span className="text-muted-foreground">Service fee (10%)</span>
                    <span>{formatPrice(platformFee)}</span>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-brand-blue">{formatPrice(finalTotal)}</span>
                </div>

                {specialRequests && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Special Requests</p>
                    <p className="text-sm text-foreground">{specialRequests}</p>
                  </div>
                )}
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
