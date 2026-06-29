"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { testimonials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Testimonials() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Testimonials"
            title="Loved by Travelers Worldwide"
            description="Hear from real travelers who discovered a new way to explore India."
          />
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} delay={index * 0.1}>
              <div
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  index === 0 && "md:col-span-2 lg:col-span-1"
                )}
              >
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-brand-blue/10 dark:text-brand-blue/20 mb-4" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-orange text-brand-orange"
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.tourType} in {testimonial.city} · {testimonial.date}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
