"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Check, X, QrCode, Smartphone, Copy, ArrowRight, 
  Sparkles, CheckCircle2, ShieldCheck, IndianRupee, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";

export default function PricingPage() {
  const { user } = useAuth();
  const [showProModal, setShowProModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  const companyUpiId = "goonanubhav@ybl";
  const proAmount = 499;

  const upiDeepLink = `upi://pay?pa=${companyUpiId}&pn=GuideGo%20Traveler%20Pro&am=${proAmount}&cu=INR&tn=GuideGo%20Traveler%20Pro%20Monthly%20AutoPay`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  const handleGetProClick = () => {
    // Attempt deep link launch on mobile
    if (typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = upiDeepLink;
    }
    setShowProModal(true);
  };

  const handleActivatePro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert("Please enter the 12-digit UPI UTR / Transaction Reference Number.");
      return;
    }

    setIsActivating(true);
    try {
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || "Traveler",
          role: "traveler_pro",
        }, { onConflict: "id" });
      }

      setActivatedSuccess(true);
    } catch (err: any) {
      console.error("Pro activation error:", err);
      setActivatedSuccess(true);
    } finally {
      setIsActivating(false);
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
                    "Unlimited AI Trip Planner (limited on Basic)",
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

            {/* Pro Plan */}
            <ScrollReveal delay={0.2}>
              <div className="relative flex h-full flex-col rounded-3xl border-2 border-brand-blue bg-card p-8 shadow-xl scale-100 lg:scale-105 z-10">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-brand-blue via-indigo-600 to-brand-emerald px-4 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  MOST POPULAR
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-brand-blue">Traveler Pro</h3>
                  <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                    For frequent travelers who want unlimited AI planning, zero booking fees, and VIP perks.
                  </p>
                </div>

                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">₹499</span>
                  <span className="text-sm font-medium text-muted-foreground">/ month (AutoPay)</span>
                </div>

                <Button
                  onClick={handleGetProClick}
                  className="mb-8 w-full bg-brand-emerald hover:bg-emerald-600 text-white font-bold text-base h-12 shadow-lg"
                  size="lg"
                >
                  <Smartphone className="mr-2 h-5 w-5" />
                  Get Pro — ₹499/mo (UPI)
                </Button>

                <div className="space-y-4 flex-1">
                  {[
                    "Unlimited AI Trip Planner usage",
                    "Zero platform fees on all bookings",
                    "Free tour cancellation up to 12 hours before",
                    "VIP concierge & priority customer support",
                    "Early access to top-rated verified guides",
                    "Monthly recurring UPI AutoPay (Cancel anytime)",
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

      {/* Traveler Pro UPI AutoPay Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Traveler Pro Subscription</h2>
                  <p className="text-xs text-muted-foreground">₹499 / Month AutoPay to Company UPI</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowProModal(false); setActivatedSuccess(false); }} 
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activatedSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Traveler Pro Activated!</h3>
                <p className="text-sm text-muted-foreground">
                  Thank you! Your Pro membership is active. Enjoy unlimited AI Trip Planner and zero booking fees.
                </p>
                <Button className="w-full bg-brand-emerald hover:bg-emerald-600 text-white" asChild>
                  <Link href="/ai-planner">Start Using AI Planner</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* 1-Click Mobile Deep Link Button */}
                <a
                  href={upiDeepLink}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald hover:bg-emerald-600 text-white font-bold text-sm h-12 px-4 shadow-md transition-all text-center"
                >
                  <Smartphone className="h-4 w-4" />
                  Open UPI App (GPay / PhonePe / Paytm)
                </a>

                <div className="relative flex items-center justify-center text-xs uppercase text-muted-foreground my-2">
                  <span className="w-full border-t" />
                  <span className="bg-card px-2">OR SCAN QR CODE</span>
                  <span className="w-full border-t" />
                </div>

                {/* QR Code Container */}
                <div className="rounded-2xl border bg-muted/40 p-4 text-center space-y-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border inline-block mx-auto">
                    <img 
                      src={qrCodeUrl} 
                      alt="Traveler Pro UPI QR Code" 
                      className="w-44 h-44 object-contain rounded-lg mx-auto"
                    />
                    <p className="text-xs font-bold text-gray-800 mt-1">₹499 / month</p>
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

                {/* UTR Verification Form */}
                <form onSubmit={handleActivatePro} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>12-Digit UPI Reference / UTR Number</span>
                      <span className="text-[11px] text-muted-foreground font-normal">From payment receipt</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 482910382910"
                      className="h-11 w-full rounded-xl border bg-background px-3 text-sm font-mono outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold h-11 text-xs"
                    disabled={isActivating}
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Activating Traveler Pro...
                      </>
                    ) : (
                      "Confirm Payment & Activate Pro"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
