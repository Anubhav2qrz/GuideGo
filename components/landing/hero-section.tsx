"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Camera,
  Utensils,
  Compass,
  Plane,
  Star,
  Globe,
} from "lucide-react";

// Floating travel icon component
function FloatingIcon({
  icon: Icon,
  className,
  delay = 0,
}: {
  icon: React.ElementType;
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className={className}
    >
      <Icon className="h-full w-full" />
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating travel elements */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon
          icon={MapPin}
          className="absolute top-[15%] left-[10%] h-8 w-8 text-brand-blue/20 dark:text-brand-blue/10"
          delay={0}
        />
        <FloatingIcon
          icon={Camera}
          className="absolute top-[25%] right-[15%] h-10 w-10 text-brand-emerald/20 dark:text-brand-emerald/10"
          delay={1}
        />
        <FloatingIcon
          icon={Utensils}
          className="absolute bottom-[30%] left-[8%] h-7 w-7 text-brand-orange/20 dark:text-brand-orange/10"
          delay={2}
        />
        <FloatingIcon
          icon={Compass}
          className="absolute top-[40%] right-[8%] h-9 w-9 text-brand-blue/15 dark:text-brand-blue/10"
          delay={1.5}
        />
        <FloatingIcon
          icon={Plane}
          className="absolute bottom-[20%] right-[20%] h-8 w-8 text-brand-emerald/15 dark:text-brand-emerald/10"
          delay={0.5}
        />
        <FloatingIcon
          icon={Star}
          className="absolute top-[60%] left-[15%] h-6 w-6 text-brand-orange/15 dark:text-brand-orange/10"
          delay={3}
        />
        <FloatingIcon
          icon={Globe}
          className="absolute bottom-[40%] left-[30%] h-12 w-12 text-brand-blue/10 dark:text-brand-blue/5"
          delay={2.5}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-blue/5 blur-[120px] dark:bg-brand-blue/10" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-emerald/5 blur-[100px] dark:bg-brand-emerald/10" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/5 px-4 py-1.5 text-sm font-medium text-brand-blue dark:border-brand-blue/30 dark:bg-brand-blue/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-emerald" />
            </span>
            2,500+ verified guides across India
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Explore Every City{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text">Like a Local</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Book verified local guides for authentic experiences, hidden gems,
          food tours, shopping, photography, and city adventures.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            className="h-12 min-w-[180px] bg-brand-blue text-white hover:bg-brand-blue-dark text-base shadow-lg shadow-brand-blue/25 transition-all hover:shadow-xl hover:shadow-brand-blue/30"
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
            className="h-12 min-w-[180px] text-base border-2"
            asChild
          >
            <Link href="/become-guide">
              Become a Guide
            </Link>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-brand-blue to-brand-emerald"
                />
              ))}
            </div>
            <span className="ml-1">12,000+ happy travelers</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-brand-orange text-brand-orange" />
            <span>4.8 average rating</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span>50+ cities covered</span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
