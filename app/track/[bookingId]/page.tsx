"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Navigation, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Dynamically import the map to avoid SSR issues with Leaflet
const LiveMap = dynamic(
  () => import("@/components/tracking/live-map"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/50 rounded-2xl border border-dashed animate-pulse">
        <p className="text-muted-foreground font-medium">Loading map engine...</p>
      </div>
    )
  }
);

export default function TrackPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  
  const [guideProfile, setGuideProfile] = useState<{ id: string, full_name: string, avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      if (!bookingId) return;
      
      const { data: booking } = await supabase
        .from('bookings')
        .select('guide_id')
        .eq('id', bookingId)
        .single();
        
      if (booking) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', booking.guide_id)
          .single();
          
        if (profile) {
          setGuideProfile({ ...profile, id: booking.guide_id });
        }
      }
      setLoading(false);
    }
    
    fetchDetails();
  }, [bookingId]);

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading tracking details...</div>;
  }
  
  if (!guideProfile) {
    return <div className="min-h-screen pt-32 text-center text-destructive">Booking not found or you don&apos;t have access.</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald">
              <Navigation className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Live Tracking</h1>
          </div>
          <p className="text-muted-foreground">Booking Ref: #{bookingId.split('-')[0]}</p>
        </div>

        <div className="bg-card rounded-3xl border shadow-lg overflow-hidden flex flex-col h-[600px] p-2">
          <div className="flex-1 rounded-2xl overflow-hidden relative">
             <LiveMap bookingId={bookingId} guideId={guideProfile.id} />
          </div>
          
          <div className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                  <img src={guideProfile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"} alt="Guide" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{guideProfile.full_name}</p>
                  <p className="text-xs text-brand-emerald flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-emerald" />
                    </span>
                    GPS Active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
