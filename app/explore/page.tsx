"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, MapPin, Users, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { cities } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

const states = [...new Set(cities.map((c) => c.state))];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "guides" | "price">("rating");

  const filtered = useMemo(() => {
    const result = cities.filter((city) => {
      const matchesSearch =
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.state.toLowerCase().includes(search.toLowerCase());
      const matchesState = !selectedState || city.state === selectedState;
      return matchesSearch && matchesState;
    });

    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "guides":
        result.sort((a, b) => b.guideCount - a.guideCount);
        break;
      case "price":
        result.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
    }

    return result;
  }, [search, selectedState, sortBy]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <SectionHeader
            badge="Explore"
            title="Discover India's Best Cities"
            description="Browse destinations, find local guides, and plan your perfect trip."
            align="center"
          />
        </ScrollReveal>

        {/* Search & Filters */}
        <ScrollReveal delay={0.1}>
          <div className="mb-10 space-y-4">
            {/* Search Bar */}
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities or states..."
                className="h-13 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                <span>Filter:</span>
              </div>
              <Badge
                variant={selectedState === null ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedState(null)}
              >
                All States
              </Badge>
              {states.map((state) => (
                <Badge
                  key={state}
                  variant={selectedState === state ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() =>
                    setSelectedState(selectedState === state ? null : state)
                  }
                >
                  {state}
                </Badge>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              {(["rating", "guides", "price"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    sortBy === s
                      ? "bg-brand-blue text-white"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {s === "rating" ? "Top Rated" : s === "guides" ? "Most Guides" : "Lowest Price"}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Results */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center"
            >
              <p className="text-lg text-muted-foreground">
                No cities found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setSelectedState(null);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((city) => (
                  <StaggerItem key={city.id}>
                    <Link href={`/guides?city=${city.slug}`} className="group block">
                      <div className="relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={city.image}
                            alt={city.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/70 px-2.5 py-1 text-sm font-medium backdrop-blur-sm">
                            <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                            {city.averageRating}
                          </div>

                          <div className="absolute bottom-3 left-3">
                            <h3 className="text-xl font-bold text-white">
                              {city.name}
                            </h3>
                            <p className="flex items-center gap-1 text-sm text-white/80">
                              <MapPin className="h-3.5 w-3.5" />
                              {city.state}
                            </p>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {city.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{city.guideCount} guides</span>
                            </div>
                            <div className="text-sm font-semibold text-primary">
                              From {formatPrice(city.startingPrice)}/hr
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
