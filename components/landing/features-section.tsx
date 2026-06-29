"use client";

import { ShieldCheck, Users, Sparkles, Zap, Star, Lock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { features } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  Users,
  Sparkles,
  Zap,
  Star,
  Lock,
};

const gradients = [
  "from-blue-500/10 to-blue-600/5",
  "from-emerald-500/10 to-emerald-600/5",
  "from-orange-500/10 to-orange-600/5",
  "from-purple-500/10 to-purple-600/5",
  "from-pink-500/10 to-pink-600/5",
  "from-cyan-500/10 to-cyan-600/5",
];

const iconColors = [
  "text-blue-500",
  "text-emerald-500",
  "text-orange-500",
  "text-purple-500",
  "text-pink-500",
  "text-cyan-500",
];

export function FeaturesSection() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Why GuideGo"
            title="Everything you need for the perfect local experience"
            description="We've built the most comprehensive platform for connecting travelers with verified local guides."
          />
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Star;
            return (
              <StaggerItem key={feature.title}>
                <div
                  className={cn(
                    "group relative rounded-2xl border bg-card p-6 transition-all duration-300",
                    "hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
                  )}
                >
                  {/* Gradient background on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                      gradients[index % gradients.length]
                    )}
                  />

                  <div className="relative">
                    <div
                      className={cn(
                        "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                        gradients[index % gradients.length]
                      )}
                    >
                      <Icon className={cn("h-6 w-6", iconColors[index % iconColors.length])} />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
