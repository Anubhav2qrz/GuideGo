"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Calendar, Clock, Users, ArrowRight, ArrowLeft, ShieldCheck, 
  CheckCircle2, MessageSquare, AlertCircle, QrCode, Copy, 
  Smartphone, IndianRupee, Info, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchGuideById } from "@/lib/supabase-helpers";
import { supabase } from "@/lib/supabase";
import { Guide } from "@/types";

const COMPANY_UPI_ID = "goonanubhav@ybl";

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
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
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

  // Price calculations
  const tourTotal = guide.hourlyRate * parseInt(hours || "0");
  const advanceAmount = Math.round(tourTotal * 0.15); // 15% Booking Advance to Company UPI
  const remainingAmount = tourTotal - advanceAmount;   // 85% Remaining to be paid to Guide

  // Deep link for mobile UPI apps
  const upiDeepLink = `upi://pay?pa=${COMPANY_UPI_ID}&pn=GuideGo&am=${advanceAmount}&cu=INR&tn=GuideGo%20Booking%20Advance`;
  // QR code image URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(COMPANY_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

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

  const handleConfirmUpiBooking = async () => {
    if (!user) {
      setBookingError("You must be logged in to book a guide.");
      return;
    }

    if (!upiTransactionId.trim()) {
      setBookingError("Please enter your UPI Transaction Reference / UTR Number after completing the payment.");
      return;
    }
    
    setIsProcessing(true);
    setBookingError(null);
    
    try {
      // 1. Ensure the traveler's profile exists in the `profiles` table to prevent foreign key constraint violation
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "Traveler",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
        role: user.user_metadata?.role || "traveler",
        city: user.user_metadata?.city || "Kolkata",
        verified: false,
      }, { onConflict: 'id' });

      if (profileError) {
        console.warn("Profile upsert notice:", profileError.message);
      }

      // 2. Insert real booking with 15% advance deposit details
      const { error: bookingInsertError } = await supabase
        .from('bookings')
        .insert({
          traveler_id: user.id,
          guide_id: guide.id,
          booking_date: date,
          booking_time: time,
          guests: parseInt(guests),
          duration_hours: parseInt(hours),
          total_price: tourTotal,
          platform_fee: advanceAmount,
          status: 'confirmed',
          payment_id: `UPI-UTR-${upiTransactionId.trim()}`,
          meeting_location: specialRequests ? `Special requests: ${specialRequests}` : null,
        });
        
      if (bookingInsertError) {
        throw bookingInsertError;
      }

      setStep(3);
    } catch (err: any) {
      console.error("Booking error:", err);
      setBookingError(err.message || "Failed to confirm booking. Please try again.");
    } finally {
      setIsProcessing(false);
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
                {step === 1 ? "Tour Details" : step === 2 ? "15% Advance UPI Payment" : "Confirmed!"}
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
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
                <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="shrink-0" disabled={isProcessing}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h2 className="text-xl font-bold">2. 15% Booking Advance via UPI</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pay 15% now to confirm guide booking. Pay remaining 85% directly to guide after trip.
                      </p>
                    </div>
                  </div>

                  {/* Payment Breakdown Card */}
                  <div className="rounded-2xl border bg-muted/40 p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Total Tour Amount:</span>
                      <span className="font-semibold text-foreground">{formatPrice(tourTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-emerald font-semibold pt-1 border-t">
                      <span>15% Advance Payable Now (UPI):</span>
                      <span className="text-base">{formatPrice(advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground text-xs pt-1">
                      <span>85% Remaining to Guide (Post-Trip):</span>
                      <span className="font-medium text-foreground">{formatPrice(remainingAmount)}</span>
                    </div>
                  </div>

                  {/* UPI Payment Box */}
                  <div className="rounded-2xl border border-brand-emerald/30 bg-brand-emerald/5 p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* QR Code */}
                      <div className="bg-white p-3 rounded-2xl shadow-sm border shrink-0 text-center">
                        <img 
                          src={qrCodeUrl} 
                          alt="Scan to Pay via UPI" 
                          className="w-40 h-40 object-contain mx-auto rounded-lg"
                        />
                        <p className="text-[10px] text-gray-500 font-medium mt-1">Scan with GPay / PhonePe / Paytm</p>
                      </div>

                      {/* UPI ID Info & Action Buttons */}
                      <div className="space-y-4 flex-1 w-full text-center md:text-left">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company UPI ID</p>
                          <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
                            <span className="text-lg font-mono font-bold text-foreground bg-background px-3 py-1.5 rounded-xl border">
                              {COMPANY_UPI_ID}
                            </span>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={copyUpiId}
                              className="h-10 px-3"
                            >
                              {copiedUpi ? (
                                <>
                                  <Check className="h-4 w-4 text-brand-emerald mr-1" />
                                  <span className="text-brand-emerald text-xs font-semibold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  <span className="text-xs">Copy</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• <strong>Amount to send:</strong> {formatPrice(advanceAmount)}</p>
                          <p>• <strong>Payment note:</strong> GuideGo Booking for {guide.name}</p>
                        </div>

                        {/* Mobile Open UPI App Button */}
                        <div className="pt-1">
                          <a
                            href={upiDeepLink}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-colors"
                          >
                            <Smartphone className="h-4 w-4" />
                            Open Any UPI App ({formatPrice(advanceAmount)})
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Reference Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <span>UPI Reference / UTR Number</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 429381928391 (12-digit UTR from your UPI app)" 
                      className="h-12 w-full rounded-xl border bg-background px-4 text-sm font-mono outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" 
                      value={upiTransactionId}
                      onChange={(e) => setUpiTransactionId(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      After transferring {formatPrice(advanceAmount)} to <strong>{COMPANY_UPI_ID}</strong>, enter the 12-digit UPI reference (UTR) number shown on your payment receipt.
                    </p>
                  </div>

                  {bookingError && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p>{bookingError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <Button 
                      className="bg-brand-emerald hover:bg-emerald-600 h-12 w-full sm:w-auto px-8 text-white font-semibold" 
                      onClick={handleConfirmUpiBooking}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Verifying & Confirming..." : `I Have Paid ${formatPrice(advanceAmount)} (Confirm Booking)`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-brand-emerald/20 bg-brand-emerald/5 p-8 text-center sm:p-12 shadow-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-emerald text-white">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-emerald mb-2">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your 15% advance payment ({formatPrice(advanceAmount)}) has been recorded. Guide {guide.name} has been notified.
                  </p>

                  <div className="rounded-2xl border bg-card p-4 max-w-md mx-auto mb-8 text-left text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advance Paid (15%):</span>
                      <span className="font-semibold text-brand-emerald">{formatPrice(advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Due to Guide (85%):</span>
                      <span className="font-semibold">{formatPrice(remainingAmount)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t text-xs text-muted-foreground">
                      <span>Payment Reference:</span>
                      <span className="font-mono">UTR: {upiTransactionId}</span>
                    </div>
                  </div>

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
                
                {/* Price Breakdown with 15% / 85% Split */}
                <div className="py-4 space-y-3 border-b text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{formatPrice(guide.hourlyRate)} x {hours} hours</span>
                    <span>{formatPrice(tourTotal)}</span>
                  </div>
                  <div className="flex justify-between text-brand-emerald font-medium">
                    <span>15% Advance (Pay Now via UPI)</span>
                    <span>{formatPrice(advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>85% Balance (Pay to Guide Post-Trip)</span>
                    <span>{formatPrice(remainingAmount)}</span>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between font-bold text-lg">
                  <span>Total Tour Cost</span>
                  <span className="text-brand-blue">{formatPrice(tourTotal)}</span>
                </div>

                <div className="mt-4 rounded-xl bg-brand-emerald/10 p-3 text-xs text-brand-emerald flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    You only pay <strong>{formatPrice(advanceAmount)}</strong> (15%) now. The remaining <strong>{formatPrice(remainingAmount)}</strong> is paid directly to your guide after the trip!
                  </p>
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
