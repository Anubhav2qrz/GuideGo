"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { guides } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export function TopGuides() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Top-Rated Guides"
            title="Meet Our Highest-Rated Local Experts"
            description="Handpicked guides with outstanding reviews and years of experience."
          />
        </ScrollReveal>

        <StaggerContainer
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.1}
        >
          {guides.slice(0, 6).map((guide) => (
            <StaggerItem key={guide.id}>
              <div className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Header with avatar */}
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={guide.coverImage}
                    alt={`${guide.name}'s cover`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Avatar */}
                <div className="relative -mt-10 px-5">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-card shadow-lg">
                    <Image
                      src={guide.avatar}
                      alt={guide.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-semibold">{guide.name}</h3>
                        {guide.verified && (
                          <BadgeCheck className="h-5 w-5 text-brand-blue" />
                        )}
                      </div>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {guide.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-1 text-sm font-medium text-brand-orange">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {guide.rating}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {guide.experience} yrs
                    </span>
                    <span>{guide.reviewCount} reviews</span>
                    <span className="ml-auto font-semibold text-foreground">
                      {formatPrice(guide.hourlyRate)}/hr
                    </span>
                  </div>

                  {/* Specialties */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {guide.specialties.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs font-normal">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* Languages */}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Speaks: {guide.languages.join(", ")}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/guides/${guide.slug}`}>View Profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white"
                      asChild
                    >
                      <Link href={`/book?guide=${guide.slug}`}>Book Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/guides">View All Guides</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
