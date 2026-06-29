"use client";

import Image from "next/image";
import Link from "next/link";
import {
  UtensilsCrossed, Camera, Landmark, ShoppingBag,
  Moon, TreePine, Mountain, Church, Gem,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { experienceCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  UtensilsCrossed, Camera, Landmark, ShoppingBag,
  Moon, TreePine, Mountain, Church, Gem,
};

export function ExperiencesSection() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Experiences"
            title="Find Your Perfect Adventure"
            description="Choose from curated experience categories designed to match every traveler's style."
          />
        </ScrollReveal>

        <StaggerContainer
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.07}
        >
          {experienceCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || Gem;
            return (
              <StaggerItem key={cat.id}>
                <Link
                  href={`/experiences/${cat.id}`}
                  className="group relative block overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-all duration-300 group-hover:from-black/80" />
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                    <p className="mt-1 text-sm text-white/75 line-clamp-1">
                      {cat.description}
                    </p>
                    <span className="mt-2 text-xs font-medium text-white/60">
                      {cat.count} experiences
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
