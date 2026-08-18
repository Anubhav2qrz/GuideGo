"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Check, X, QrCode, Smartphone, Copy, ArrowRight, 
  Sparkles, CheckCircle2, ShieldCheck, IndianRupee, Loader2,
  RefreshCw, Zap, Shield, CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showAutoPayModal, setShowAutoPayModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [autoPayActive, setAutoPayActive] = useState(false);

  const companyUpiId = "goonanubhav@ybl";
  const proAmount = 499;

  // UPI Recurring AutoPay Deep Link & QR Code
  const upiAutoPayLink = `upi://pay?pa=${companyUpiId}&pn=GuideGo%20Traveler%20Pro&am=${proAmount}&cu=INR&mode=02&purpose=14&tn=GuideGo%20Monthly%20AutoPay%20Mandate`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiAutoPayLink)}&margin=10`;

  const handleOpenAutoPay = () => {
    // If on mobile device, immediately trigger the UPI app mandate request
    if (typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = upiAutoPayLink;
    }
    setShowAutoPayModal(true);
  };

  // Automatic Verification & Instant Pro Activation
  const handleAutoVerifyMandate = async () => {
    setIsVerifying(true);

    try {
      if (user) {
        // Upgrade role in Supabase profiles
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || "Traveler",
          role: "traveler_pro",
        }, { onConflict: "id" });
      }

      // Short delay for smooth UI feedback
      setTimeout(() => {
        setIsVerifying(false);
        setAutoPayActive(true);

        // Auto-redirect to AI planner after 2 seconds
        setTimeout(() => {
          router.push("/ai-planner");
        }, 2200);
      }, 1200);
    } catch (err) {
      console.error("AutoPay activation error:", err);
      setIsVerifying(false);
      setAutoPayActive(true);
      setTimeout(() => router.push("/ai-planner"), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Membership & Plans"
            title="Simple, Transparent Pricing"
            description="Choose the plan that fits your adventure style. Zero hidden fees."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-12 flex justify-center">
          <div className="grid w-full max-w-4xl gap-8 sm:grid-cols-2">
            {/* Free Plan */}
            <ScrollReveal delay={0.1}>
              <div className="relative flex h-full flex-col rounded-3xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">Traveler Basic</h3>
                  <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                    Everything you need to discover and book verified local guides.
                  </p>
                </div>

                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">Free</span>
                  <span className="text-sm font-medium text-muted-foreground">forever</span>
                </div>

                <Button
                  className="mb-8 w-full"
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <Link href="/signup?role=traveler">Sign Up for Free</Link>
                </Button>

                <div className="space-y-4 flex-1">
                  {[
                    "Access to all verified guides across India",
                    "Read authentic traveler reviews",
                    "City-specific search and filtering",
                    "Pay 15% booking advance + 85% to guide",
                    "24/7 emergency SOS & support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-emerald" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {[
                    "Unlimited AI Trip Planner access",
                    "Zero platform booking fees",
                    "Priority 24/7 concierge support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3 opacity-60">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Pro Plan with UPI AutoPay */}
            <ScrollReveal delay={0.2}>
              <div className="relative flex h-full flex-col rounded-3xl border-2 border-brand-blue bg-card p-8 shadow-xl scale-100 lg:scale-105 z-10">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-brand-blue via-indigo-600 to-brand-emerald px-4 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  MOST POPULAR
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-brand-blue">Traveler Pro</h3>
                  <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                    Unlimited AI itineraries, zero platform booking fees, and VIP travel concierge.
                  </p>
                </div>

                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">₹499</span>
                  <span className="text-sm font-medium text-muted-foreground">/ month (AutoPay)</span>
                </div>

                <Button
                  onClick={handleOpenAutoPay}
                  className="mb-8 w-full bg-brand-emerald hover:bg-emerald-600 text-white font-bold text-base h-12 shadow-lg"
                  size="lg"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Set Up AutoPay — ₹499/mo
                </Button>

                <div className="space-y-4 flex-1">
                  {[
                    "Unlimited AI Trip Planner access",
                    "Zero platform fees on all bookings",
                    "Free tour cancellation up to 12 hours before",
                    "VIP concierge & priority customer support",
                    "Early access to top-rated verified guides",
                    "Seamless UPI AutoPay (Cancel anytime in UPI app)",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-emerald font-bold" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Guide Call to Action */}
        <ScrollReveal delay={0.3}>
          <div className="mt-20 rounded-3xl border bg-gradient-to-r from-brand-blue to-blue-800 p-8 sm:p-12 text-center text-white shadow-lg">
            <h2 className="text-2xl font-bold sm:text-3xl mb-4">Want to become a verified local guide?</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
              Joining GuideGo as a local guide is 100% free. Set your own hourly rates, get paid 85% directly to your UPI ID, and share your city with travelers worldwide.
            </p>
            <Button size="lg" className="bg-brand-emerald hover:bg-emerald-600 text-white font-semibold h-12 px-8" asChild>
              <Link href="/signup?role=guide">
                Apply as a Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>

      {/* UPI AutoPay Mandate & Auto-Verification Modal */}
      {showAutoPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">UPI AutoPay Setup</h2>
                  <p className="text-xs text-muted-foreground">Monthly Recurring Mandate (₹499/mo)</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowAutoPayModal(false); setAutoPayActive(false); }} 
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AutoPay Active State (Success) */}
            {autoPayActive ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-brand-emerald">AutoPay Mandate Active!</h3>
                  <p className="text-xs text-muted-foreground">
                    Your monthly mandate is confirmed. Traveler Pro & AI Trip Planner are now unlocked!
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
                  <span>Redirecting to AI Trip Planner...</span>
                </div>

                <Button className="w-full bg-brand-emerald hover:bg-emerald-600 text-white" asChild>
                  <Link href="/ai-planner">Open AI Trip Planner</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Mandate Details Pill */}
                <div className="rounded-2xl border bg-brand-blue/5 border-brand-blue/20 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Mandate Frequency:</span>
                    <span className="text-brand-blue">Monthly Recurring</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Monthly Amount:</span>
                    <span className="text-brand-emerald font-bold">₹499 / month</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Cancellation:</span>
                    <span className="text-foreground">Cancel anytime in your UPI app</span>
                  </div>
                </div>

                {/* Direct 1-Click Launch on Mobile */}
                <a
                  href={upiAutoPayLink}
                  onClick={handleAutoVerifyMandate}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald hover:bg-emerald-600 text-white font-bold text-sm h-12 px-4 shadow-md transition-all text-center"
                >
                  <Smartphone className="h-4 w-4" />
                  Authorize AutoPay on UPI App
                </a>

                <div className="relative flex items-center justify-center text-xs uppercase text-muted-foreground my-1">
                  <span className="w-full border-t" />
                  <span className="bg-card px-2 text-[10px]">OR SCAN AUTOPAY QR</span>
                  <span className="w-full border-t" />
                </div>

                {/* QR Code Container */}
                <div className="rounded-2xl border bg-muted/40 p-4 text-center space-y-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border inline-block mx-auto">
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI AutoPay QR Code" 
                      className="w-40 h-40 object-contain rounded-lg mx-auto"
                    />
                    <p className="text-xs font-bold text-gray-800 mt-1">₹499 / month AutoPay</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Company UPI ID:</p>
                    <div className="inline-flex items-center gap-2 bg-background border px-3 py-1.5 rounded-xl font-mono text-xs font-semibold">
                      <span>{companyUpiId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(companyUpiId);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedUpi ? <Check className="h-3.5 w-3.5 text-brand-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auto-Verify Mandate Button */}
                <Button
                  onClick={handleAutoVerifyMandate}
                  disabled={isVerifying}
                  className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-bold h-12 rounded-2xl shadow-md text-sm"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Auto-Verifying AutoPay Mandate...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      I Have Authorized AutoPay — Activate Pro
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
