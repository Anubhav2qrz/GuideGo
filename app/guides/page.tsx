"use client";

import { useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { GuideCard } from "@/components/guides/guide-card";
import { guides, cities } from "@/lib/mock-data";

export default function GuidesPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique languages
  const languages = useMemo(() => {
    const langs = new Set<string>();
    guides.forEach((g) => g.languages.forEach((l) => langs.add(l)));
    return Array.from(langs).sort();
  }, []);

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesSearch =
        guide.name.toLowerCase().includes(search.toLowerCase()) ||
        guide.specialties.some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        );
      const matchesCity = !selectedCity || guide.city === selectedCity;
      const matchesLanguage =
        !selectedLanguage || guide.languages.includes(selectedLanguage);

      return matchesSearch && matchesCity && matchesLanguage;
    });
  }, [search, selectedCity, selectedLanguage]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Local Guides"
            title="Find Your Perfect Guide"
            description="Connect with verified locals who know the city inside out."
            align="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-10 space-y-4">
            {/* Search Bar & Mobile Filter Toggle */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or specialty (e.g., Photography, History)..."
                  className="h-13 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
              <Button
                size="lg"
                variant="outline"
                className="h-13 w-13 shrink-0 rounded-2xl p-0 lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>

            {/* Filters Area */}
            <AnimatePresence>
              {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden lg:!h-auto lg:!opacity-100"
                >
                  <div className="rounded-2xl border bg-card p-4 sm:p-6 lg:border-none lg:bg-transparent lg:p-0">
                    <div className="grid gap-6 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-4">
                      {/* City Filter */}
                      <div className="space-y-2 lg:flex-1">
                        <label className="text-sm font-medium text-foreground lg:sr-only">
                          City
                        </label>
                        <select
                          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 lg:h-11"
                          value={selectedCity || ""}
                          onChange={(e) => setSelectedCity(e.target.value || null)}
                        >
                          <option value="">All Cities</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Language Filter */}
                      <div className="space-y-2 lg:flex-1">
                        <label className="text-sm font-medium text-foreground lg:sr-only">
                          Language
                        </label>
                        <select
                          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 lg:h-11"
                          value={selectedLanguage || ""}
                          onChange={(e) =>
                            setSelectedLanguage(e.target.value || null)
                          }
                        >
                          <option value="">All Languages</option>
                          {languages.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Reset Filters */}
                      {(selectedCity || selectedLanguage || search) && (
                        <div className="flex items-end lg:items-center">
                          <Button
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSearch("");
                              setSelectedCity(null);
                              setSelectedLanguage(null);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reset Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* Results */}
        <AnimatePresence mode="wait">
          {filteredGuides.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No guides found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSearch("");
                  setSelectedCity(null);
                  setSelectedLanguage(null);
                }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Showing <span className="font-semibold text-foreground">{filteredGuides.length}</span>{" "}
                  {filteredGuides.length === 1 ? "guide" : "guides"}
                </p>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Verified Guides Only</span>
                </div>
              </div>

              <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGuides.map((guide) => (
                  <StaggerItem key={guide.id}>
                    <GuideCard guide={guide} />
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
