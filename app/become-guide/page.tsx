"use client";

import Link from "next/link";
import { CheckCircle2, DollarSign, Clock, Shield, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn on your own terms",
    description: "Set your own hourly rates and keep 90% of what you earn. Get paid securely directly to your bank account."
  },
  {
    icon: Clock,
    title: "Flexible schedule",
    description: "Work as much or as little as you want. You have complete control over your calendar and availability."
  },
  {
    icon: Shield,
    title: "We've got your back",
    description: "Enjoy peace of mind with our $1M liability insurance, 24/7 support team, and secure payment processing."
  },
  {
    icon: Award,
    title: "Share your passion",
    description: "Meet interesting travelers from around the world and share what makes your city truly special."
  }
];

export default function BecomeGuidePage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-blue py-20 text-white lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-blue-700 to-brand-blue-dark" />
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-brand-emerald/20 blur-[120px]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
              Join 5,000+ local guides across India
            </span>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              Turn your local knowledge into <span className="text-brand-emerald">extra income</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
              Become a GuideGo local expert. Show travelers the real city, set your own schedule, and earn money doing what you love.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-14 bg-brand-emerald text-white hover:bg-emerald-600 px-8 text-base shadow-lg" asChild>
                <Link href="/signup?role=guide">
                  Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              title="Why host with GuideGo?"
              description="We provide the tools, audience, and support. You provide the authentic experience."
              align="center"
            />
          </ScrollReveal>

          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-12">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <StaggerItem key={i}>
                  <div className="rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-lg font-bold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Steps Section */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  How it works
                </h2>
                <div className="space-y-8">
                  {[
                    { title: "Create your profile", desc: "Sign up and tell us about yourself, your specialties, and the languages you speak. Add great photos." },
                    { title: "Complete verification", desc: "For the safety of our community, all guides undergo a quick identity and background check." },
                    { title: "Set your schedule", desc: "Choose when you want to work and set your hourly rates. You have total flexibility." },
                    { title: "Welcome travelers", desc: "Accept bookings, meet up with travelers, show them a great time, and get paid securely!" }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative aspect-square lg:aspect-auto lg:h-[600px] overflow-hidden rounded-3xl border bg-muted">
                <img 
                  src="https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=2000&auto=format&fit=crop" 
                  alt="Guide leading a tour" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20">
                    <p className="text-white text-lg font-medium italic">
                      "I started guiding on weekends to share my love for old Delhi's food. Now it's my full-time passion and business!"
                    </p>
                    <p className="text-white/80 mt-4 font-semibold">— Rahul K., Verified Guide</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
