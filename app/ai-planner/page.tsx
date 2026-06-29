"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, MapPin, Clock, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { sampleItinerary } from "@/lib/mock-data";

export default function AiPlannerPage() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string, itinerary?: typeof sampleItinerary}>>([
    {
      role: 'ai',
      content: 'Hello! I am your GuideGo AI Trip Planner. Where would you like to go, what is your budget, and how many days do you have?'
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

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

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            badge="Beta"
            title="AI Trip Planner"
            description="Get instant, personalized itineraries based on your preferences."
            align="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-3xl border bg-card shadow-lg flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b bg-muted/50 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-emerald shadow-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold">GuideGo AI Planner</p>
                <p className="text-xs text-brand-emerald flex items-center gap-1.5 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-emerald" />
                  </span>
                  Online
                </p>
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
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-emerald mr-3 mt-1 shadow-sm">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md' : ''}`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div className="space-y-4 rounded-2xl rounded-tl-sm border bg-muted/30 p-5 shadow-sm">
                          <p className="text-sm font-medium flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                            {msg.content}
                          </p>

                          {msg.itinerary && (
                            <div className="space-y-3 mt-4">
                              {msg.itinerary.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-3 rounded-xl bg-background border p-3.5 shadow-sm transition-all hover:shadow-md"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-xs font-bold text-brand-blue">
                                    {item.time.split(":")[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm">{item.activity}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {item.location}
                                    </p>
                                    {item.cost > 0 && (
                                      <p className="text-xs text-brand-emerald font-medium mt-1 flex items-center gap-0.5">
                                        <IndianRupee className="h-3 w-3" />
                                        {item.cost}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-sm font-semibold text-muted-foreground">
                                <span className="flex items-center gap-1.5 bg-background border px-3 py-1.5 rounded-lg">
                                  <IndianRupee className="h-4 w-4 text-brand-emerald" />
                                  Total Estimated: ₹{msg.itinerary.reduce((sum, item) => sum + (Number(item.cost) || 0), 0).toLocaleString('en-IN')}
                                </span>
                                <span className="flex items-center gap-1.5 bg-background border px-3 py-1.5 rounded-lg">
                                  <Clock className="h-4 w-4 text-brand-blue" />
                                  {msg.itinerary.length} Planned Activities
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-emerald mr-3 mt-1 shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border bg-muted/30 p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="border-t bg-background p-4 sm:p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="e.g., Plan a 3-day cultural trip to Jaipur under ₹10,000"
                  className="h-12 flex-1 rounded-xl border bg-muted/30 px-4 text-sm outline-none transition-all focus:border-brand-blue focus:bg-background focus:ring-2 focus:ring-brand-blue/20"
                />
                <Button
                  size="lg"
                  className="h-12 w-12 shrink-0 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white p-0 shadow-md"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground mr-2 my-auto font-medium">Try asking:</p>
                {["1 day food tour in Delhi", "Budget weekend in Goa", "Historical walk in Agra"].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
