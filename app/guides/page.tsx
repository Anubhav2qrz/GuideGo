"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, SlidersHorizontal, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { GuideCard } from "@/components/guides/guide-card";
import { cities } from "@/lib/mock-data";
import { fetchAllGuides } from "@/lib/supabase-helpers";
import { Guide } from "@/types";

function GuidesContent() {
  const searchParams = useSearchParams();
  const initialCityParam = searchParams?.get("city") || null;

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCityParam);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    async function loadGuides() {
      const allGuides = await fetchAllGuides();
      setGuides(allGuides);
    }
    loadGuides();
  }, []);

  // Update selected city if URL search param changes
  useEffect(() => {
    if (initialCityParam) {
      // Find matching city name (case-insensitive or by slug)
      const matchedCity = cities.find(
        (c) => c.slug.toLowerCase() === initialCityParam.toLowerCase() || 
               c.name.toLowerCase() === initialCityParam.toLowerCase()
      );
      setSelectedCity(matchedCity ? matchedCity.name : initialCityParam);
    }
  }, [initialCityParam]);

  // Extract unique cities from active guides + predefined list
  const availableCities = useMemo(() => {
    const citySet = new Set<string>(cities.map((c) => c.name));
    guides.forEach((g) => {
      if (g.city) citySet.add(g.city);
    });
    return Array.from(citySet).sort();
  }, [guides]);

  // Extract unique languages
  const languages = useMemo(() => {
    const langs = new Set<string>();
    guides.forEach((g) => g.languages.forEach((l) => langs.add(l)));
    return Array.from(langs).sort();
  }, [guides]);

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesSearch =
        guide.name.toLowerCase().includes(search.toLowerCase()) ||
        (guide.city && guide.city.toLowerCase().includes(search.toLowerCase())) ||
        guide.specialties.some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        );

      // Strict city matching (case-insensitive and trimmed)
      const matchesCity =
        !selectedCity ||
        guide.city?.toLowerCase().trim() === selectedCity.toLowerCase().trim() ||
        guide.citySlug?.toLowerCase().trim() === selectedCity.toLowerCase().trim();

      const matchesLanguage =
        !selectedLanguage || guide.languages.includes(selectedLanguage);

      return matchesSearch && matchesCity && matchesLanguage;
    });
  }, [search, selectedCity, selectedLanguage, guides]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Local Guides"
            title={selectedCity ? `Local Guides in ${selectedCity}` : "Find Your Perfect Guide"}
            description={
              selectedCity 
                ? `Connect with verified local experts living in ${selectedCity}.`
                : "Connect with verified locals who know their city inside out."
            }
            align="center"
          />
        </ScrollReveal>

        {/* Active City Filter Badge if filtered by URL or dropdown */}
        {selectedCity && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 px-4 py-1.5 text-sm font-medium text-brand-blue">
              <MapPin className="h-4 w-4" />
              <span>Showing guides registered in <strong>{selectedCity}</strong></span>
              <button 
                onClick={() => setSelectedCity(null)}
                className="ml-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-brand-blue/20 p-0.5"
                title="Clear city filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

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
                  placeholder={`Search guides in ${selectedCity || "all cities"} by name or specialty...`}
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
              {(showFilters || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
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
                          {availableCities.map((cityName) => (
                            <option key={cityName} value={cityName}>
                              {cityName}
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
                No guides found {selectedCity ? `in ${selectedCity}` : ""}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedCity 
                  ? `There are currently no verified guides registered in ${selectedCity}.`
                  : "Try adjusting your search or filters to find what you're looking for."}
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
                  {selectedCity && <span> in <strong className="text-foreground">{selectedCity}</strong></span>}
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

export default function GuidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-muted-foreground">Loading guides...</div>}>
      <GuidesContent />
    </Suspense>
  );
}
