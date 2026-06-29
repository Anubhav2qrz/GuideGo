"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { experiences, experienceCategories } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export default function ExperienceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const catInfo = experienceCategories.find((c) => c.id === category);
  const catExperiences = experiences.filter((e) => e.category === category);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/experiences">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                All Experiences
              </Link>
            </Button>
          </div>
          <SectionHeader
            badge={catInfo?.name || "Experiences"}
            title={catInfo?.name || category}
            description={catInfo?.description || "Explore amazing experiences."}
          />
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
          {catExperiences.map((exp) => (
            <StaggerItem key={exp.id}>
              <div className="group overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/70 px-2.5 py-1 text-sm font-medium backdrop-blur-sm">
                    <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                    {exp.rating}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{exp.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {exp.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {exp.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {exp.duration}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative h-7 w-7 overflow-hidden rounded-full">
                      <Image
                        src={exp.guideAvatar}
                        alt={exp.guideName}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                    <span className="text-sm">{exp.guideName}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(exp.price)}
                    </span>
                    <Button
                      size="sm"
                      className="bg-brand-blue hover:bg-brand-blue-dark text-white"
                    >
                      Book Experience
                    </Button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {catExperiences.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No experiences available in this category yet.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/experiences">Browse All Experiences</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
