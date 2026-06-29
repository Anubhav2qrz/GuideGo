"use client";

import Link from "next/link";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function CtaSection() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue via-blue-600 to-brand-blue-dark p-10 md:p-16 text-center">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-brand-emerald/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                Start your adventure today
              </div>

              <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Ready to Explore India Like Never Before?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
                Join thousands of travelers who discovered authentic experiences
                with verified local guides.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 min-w-[180px] bg-white text-brand-blue hover:bg-white/90 text-base font-semibold shadow-lg"
                  asChild
                >
                  <Link href="/explore">
                    <Compass className="mr-2 h-5 w-5" />
                    Find a Guide
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[180px] border-2 border-white/30 bg-transparent text-white hover:bg-white/10 text-base"
                  asChild
                >
                  <Link href="/become-guide">
                    Become a Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
