"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Send, Sparkles, MapPin, Clock, IndianRupee, 
  Loader2, Lock, ArrowRight, CheckCircle2, Shield 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { sampleItinerary } from "@/lib/mock-data";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AiPlannerPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [checkingPro, setCheckingPro] = useState(true);

  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string, itinerary?: typeof sampleItinerary}>>([
    {
      role: 'ai',
      content: 'Hello! I am your GuideGo AI Trip Planner. Where would you like to go, what is your budget, and how many days do you have?'
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check Traveler Pro Status from User Metadata and Profiles table
  useEffect(() => {
    async function checkProStatus() {
      if (!user) {
        setIsPro(false);
        setCheckingPro(false);
        return;
      }

      if (user.user_metadata?.role === "traveler_pro") {
        setIsPro(true);
        setCheckingPro(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data?.role === "traveler_pro") {
          setIsPro(true);
        } else {
          setIsPro(false);
        }
      } catch (err) {
        setIsPro(false);
      } finally {
        setCheckingPro(false);
      }
    }

    if (!authLoading) {
      checkProStatus();
    }
  }, [user, authLoading]);

  const handleSend = async () => {
    if (!input.trim() || !isPro) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate itinerary.");
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: "Here is a personalized itinerary based on your request:",
          itinerary: data.itinerary
        }
      ]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: `I'm sorry, I couldn't generate that itinerary. ${error.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || checkingPro) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue mx-auto" />
          <p className="text-sm text-muted-foreground">Checking membership access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-muted/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Traveler Pro Exclusive"
            title="AI Trip Planner"
            description="Instant, personalized day-by-day itineraries tailored to your budget and travel style."
            align="center"
          />
        </ScrollReveal>

        {/* PAYWALL: Block access if user is not Traveler Pro */}
        {!isPro ? (
          <ScrollReveal delay={0.1}>
            <div className="mt-8 relative overflow-hidden rounded-3xl border-2 border-brand-blue/30 bg-card p-8 sm:p-12 shadow-2xl text-center space-y-6">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-brand-emerald/10 blur-3xl -z-10" />

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 text-white shadow-lg">
                <Lock className="h-8 w-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3.5 py-1 text-xs font-bold text-brand-blue border border-brand-blue/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  TRAVELER PRO FEATURE
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Unlock the AI Trip Planner
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The AI Trip Planner is an exclusive feature for <strong>Traveler Pro</strong> members. Upgrade your plan to generate unlimited custom itineraries, optimize travel budgets, and skip all platform booking fees.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid gap-3 sm:grid-cols-2 max-w-lg mx-auto text-left py-4">
                {[
                  "Unlimited AI Itinerary Generation",
                  "Zero Platform Fees on all bookings",
                  "Free tour cancellation up to 12h",
                  "VIP Concierge & Priority Support",
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-xl border bg-muted/30 p-3 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-brand-emerald shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-12 bg-brand-emerald hover:bg-emerald-600 text-white font-bold px-8 shadow-lg text-sm" 
                  asChild
                >
                  <Link href="/pricing">
                    Get 30-Day Pro Pass — ₹499 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                {!user && (
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 text-sm" asChild>
                    <Link href="/login">Sign In to Existing Account</Link>
                  </Button>
                )}
              </div>
            </div>
          </ScrollReveal>
        ) : (
          /* UNLOCKED: Traveler Pro AI Planner Interface */
          <ScrollReveal delay={0.1}>
            <div className="mt-8 overflow-hidden rounded-3xl border bg-card shadow-lg flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b bg-muted/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-emerald shadow-sm">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">GuideGo AI Planner</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20">
                        PRO UNLOCKED
                      </span>
                    </div>
                    <p className="text-xs text-brand-emerald flex items-center gap-1.5 font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-emerald" />
                      </span>
                      Unlimited Access Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'ai' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      
                      <div className={`space-y-4 max-w-[85%] ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-2xl rounded-tr-none px-4 py-3 text-sm' : ''}`}>
                        {msg.role === 'ai' && (
                          <div className="rounded-2xl rounded-tl-none bg-muted p-4 text-sm">
                            <p>{msg.content}</p>
                          </div>
                        )}

                        {msg.role === 'user' && (
                          <p>{msg.content}</p>
                        )}

                        {/* Itinerary Display */}
                        {msg.itinerary && (
                          <div className="space-y-3 pt-2">
                            {msg.itinerary.map((item, i) => (
                              <div key={i} className="flex gap-4 rounded-2xl border bg-card p-4 shadow-sm text-foreground">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-xs">
                                  {item.time.split(' ')[0]}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <h4 className="font-bold text-sm">{item.activity}</h4>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {item.location}
                                  </p>
                                  <p className="text-xs font-semibold text-brand-emerald flex items-center gap-1 pt-1">
                                    <IndianRupee className="h-3 w-3" /> Estimated: ₹{item.cost}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-none bg-muted px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing destinations and crafting your personalized itinerary...
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Input */}
              <div className="border-t bg-card p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. 3-day heritage and street food tour in Kolkata under ₹5,000..."
                    className="flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
