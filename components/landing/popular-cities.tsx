"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { cities } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export function PopularCities() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Popular Destinations"
            title="Explore India's Most Vibrant Cities"
            description="From the royal forts of Jaipur to the ghats of Varanasi — find your next adventure."
          />
        </ScrollReveal>

        <StaggerContainer
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.08}
        >
          {cities.map((city) => (
            <StaggerItem key={city.id}>
              <Link href={`/explore?city=${city.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/70 px-2.5 py-1 text-sm font-medium backdrop-blur-sm">
                      <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                      {city.averageRating}
                    </div>

                    {/* City Name Overlay */}
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-xl font-bold text-white">{city.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-white/80">
                        <MapPin className="h-3.5 w-3.5" />
                        {city.state}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{city.guideCount} guides</span>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      From {formatPrice(city.startingPrice)}/hr
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
