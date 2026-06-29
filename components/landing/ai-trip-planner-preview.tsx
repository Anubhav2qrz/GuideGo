"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, MapPin, Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { sampleItinerary } from "@/lib/mock-data";
import Link from "next/link";

export function AiTripPlannerPreview() {
  const [showResponse, setShowResponse] = useState(false);
  const [typed, setTyped] = useState(false);

  const handleAsk = () => {
    setTyped(true);
    setTimeout(() => setShowResponse(true), 800);
  };

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="AI-Powered"
            title="Plan Your Perfect Trip in Seconds"
            description="Tell our AI your budget, time, and interests — get a personalized itinerary instantly."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b bg-muted/50 px-5 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-emerald">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">GuideGo AI Planner</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />
                    Online
                  </p>
                </div>
              </div>

              {/* Chat Body */}
              <div className="max-h-[420px] overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: typed ? 1 : 0.4, y: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-blue px-4 py-3 text-sm text-white">
                    I have ₹3,000 and one day in Kolkata. Plan my trip!
                  </div>
                </motion.div>

                {/* AI Response */}
                <AnimatePresence>
                  {showResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-3"
                    >
                      <div className="max-w-[90%] space-y-3 rounded-2xl rounded-bl-md border bg-muted/50 px-4 py-4 text-sm">
                        <p className="font-medium flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-brand-orange" />
                          Here&apos;s your perfect day in Kolkata! 🎉
                        </p>

                        <div className="space-y-2 mt-3">
                          {sampleItinerary.slice(0, 4).map((item, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 rounded-xl bg-background p-3"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-xs font-bold text-brand-blue">
                                {item.time.split(":")[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm">{item.activity}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {item.location}
                                </p>
                                {item.cost > 0 && (
                                  <p className="text-xs text-brand-emerald mt-0.5 flex items-center gap-0.5">
                                    <IndianRupee className="h-3 w-3" />
                                    {item.cost}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground pt-2">
                          ...and 4 more activities.{" "}
                          <Link href="/ai-planner" className="text-brand-blue hover:underline">
                            See full itinerary →
                          </Link>
                        </p>

                        <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            Total: ₹1,730
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ~12 hours
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm text-muted-foreground">
                    {typed
                      ? "Ask another question..."
                      : "I have ₹3,000 and one day in Kolkata..."}
                  </div>
                  <Button
                    size="sm"
                    className="h-10 bg-brand-blue hover:bg-brand-blue-dark text-white"
                    onClick={handleAsk}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 text-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/ai-planner">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try the Full AI Planner
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
