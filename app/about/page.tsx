"use client";

import Image from "next/image";
import { Users, Globe2, ShieldCheck, Heart } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const values = [
  {
    icon: Globe2,
    title: "Authentic Connections",
    description: "We believe the best way to experience a city is through the eyes of someone who calls it home."
  },
  {
    icon: ShieldCheck,
    title: "Safety & Trust",
    description: "Every guide on our platform is verified, and every booking is protected by our secure payment system."
  },
  {
    icon: Users,
    title: "Empowering Locals",
    description: "We provide a platform for passionate locals to turn their knowledge into a sustainable income."
  },
  {
    icon: Heart,
    title: "Memorable Experiences",
    description: "We're obsessed with helping travelers create unforgettable memories that last a lifetime."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="section-padding pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Changing the way the world <span className="text-brand-blue">travels</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              GuideGo was founded on a simple idea: that travel is better when you have a local friend to show you around.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Story Image */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <ScrollReveal delay={0.1}>
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2000&auto=format&fit=crop"
              alt="People traveling and exploring"
              fill
              className="object-cover"
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              title="Our Core Values"
              description="The principles that guide everything we do at GuideGo."
              align="center"
            />
          </ScrollReveal>

          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-12">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={i}>
                  <div className="rounded-3xl bg-card p-6 border shadow-sm text-center h-full">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-lg font-bold">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
