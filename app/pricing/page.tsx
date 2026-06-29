"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const plans = [
  {
    name: "Traveler Basic",
    price: "Free",
    description: "Everything you need to discover and book amazing local guides.",
    features: [
      "Access to all verified guides",
      "Read detailed reviews",
      "Basic search and filtering",
      "Pay per booking",
      "24/7 customer support",
    ],
    notIncluded: ["AI Trip Planner (coming soon)", "Priority booking", "Discounted platform fees"],
    cta: "Sign Up for Free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Traveler Pro",
    price: "₹499",
    period: "/month",
    description: "For frequent travelers who want the best experience and savings.",
    features: [
      "Access to all verified guides",
      "Read detailed reviews",
      "Advanced search filters",
      "Unlimited AI Trip Planner usage",
      "Zero platform booking fees",
      "Priority customer support",
      "Free cancellation up to 12 hours",
    ],
    notIncluded: [],
    cta: "Get Pro",
    href: "/signup?plan=pro",
    popular: true,
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Pricing"
            title="Simple, Transparent Pricing"
            description="Choose the plan that's right for your travel needs."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-12 flex justify-center">
          <div className="grid w-full max-w-4xl gap-8 sm:grid-cols-2">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 0.1}>
                <div
                  className={`relative flex h-full flex-col rounded-3xl border p-8 shadow-sm transition-all ${
                    plan.popular
                      ? "border-brand-blue bg-card shadow-xl scale-100 lg:scale-105 z-10"
                      : "bg-card hover:shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-brand-blue to-brand-emerald px-4 py-1 text-sm font-medium text-white shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <Button
                    className={`mb-8 w-full ${
                      plan.popular
                        ? "bg-brand-blue hover:bg-brand-blue-dark text-white"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>

                  <div className="space-y-4 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-emerald" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 opacity-60">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-20 rounded-3xl border bg-brand-blue p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl mb-4">Want to become a guide?</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Signing up as a guide is completely free. You set your own rates and we only take a small percentage fee when you get booked.
            </p>
            <Button size="lg" className="bg-white text-brand-blue hover:bg-white/90" asChild>
              <Link href="/become-guide">Learn More</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
