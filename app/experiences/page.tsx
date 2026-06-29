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

const iconMap: Record<string, React.ElementType> = {
  UtensilsCrossed, Camera, Landmark, ShoppingBag,
  Moon, TreePine, Mountain, Church, Gem,
};

export default function ExperiencesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Experiences"
            title="Curated Experiences Across India"
            description="From food walks to adventure sports — find experiences that match your vibe."
          />
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
          {experienceCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || Gem;
            return (
              <StaggerItem key={cat.id}>
                <Link
                  href={`/experiences/${cat.id}`}
                  className="group relative block overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all group-hover:from-black/80" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                    <p className="mt-1 text-sm text-white/75">{cat.description}</p>
                    <span className="mt-2 text-xs font-medium text-white/60">
                      {cat.count} experiences available
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </div>
  );
}
