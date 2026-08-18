"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { 
  Navigation, ArrowLeft, Phone, AlertTriangle, Copy, 
  CheckCircle2, Calendar, Clock, Users, X, Check, Loader2 
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

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
  const router = useRouter();
  const bookingId = params?.bookingId as string;
  
  const [guideProfile, setGuideProfile] = useState<{ id: string, full_name: string, avatar_url: string } | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{
    booking_date: string;
    booking_time: string;
    guests: number;
    total_price: number;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSOS, setShowSOS] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [isEndingTrip, setIsEndingTrip] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      if (!bookingId) return;
      
      const { data: booking } = await supabase
        .from('bookings')
        .select('guide_id, booking_date, booking_time, guests, total_price, status')
        .eq('id', bookingId)
        .single();
        
      if (booking) {
        setBookingDetails({
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          guests: booking.guests,
          total_price: booking.total_price,
          status: booking.status,
        });

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

  const handleCopyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const text = `Emergency! My location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        navigator.clipboard.writeText(text);
        setCopiedLocation(true);
        setTimeout(() => setCopiedLocation(false), 3000);
      });
    }
  };

  const handleConfirmEndTrip = async () => {
    setIsEndingTrip(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      // Redirect directly to review page
      router.push(`/review/${bookingId}`);
    } catch (err: any) {
      console.error("Error completing trip:", err);
      alert(err?.message || "Failed to complete trip.");
      setIsEndingTrip(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center text-muted-foreground">Loading tracking details...</div>;
  }
  
  if (!guideProfile) {
    return <div className="min-h-screen pt-32 text-center text-destructive">Booking not found or you don&apos;t have access.</div>;
  }

  const isCompleted = bookingDetails?.status === 'completed';

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Live Tracking</h1>
                <p className="text-muted-foreground">Booking Ref: #{bookingId.split('-')[0]}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isCompleted ? (
                <Button 
                  onClick={() => setShowEndTripModal(true)}
                  className="bg-brand-emerald hover:bg-emerald-600 text-white h-11 px-5 shadow-sm font-semibold"
                >
                  <Check className="mr-2 h-4 w-4" />
                  End Trip
                </Button>
              ) : (
                <Button asChild className="bg-brand-orange hover:bg-orange-600 text-white h-11 px-5 font-semibold">
                  <Link href={`/review/${bookingId}`}>
                    Leave Review
                  </Link>
                </Button>
              )}

              <Button 
                variant="destructive" 
                className="h-11 px-5 shadow-lg"
                onClick={() => setShowSOS(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                SOS
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Map */}
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

                {!isCompleted && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowEndTripModal(true)}
                    className="text-xs text-brand-emerald border-brand-emerald/30 hover:bg-brand-emerald/10"
                  >
                    Finish Tour
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details Sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h3 className="font-bold mb-4">Booking Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-semibold">{bookingDetails?.booking_date || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-semibold">{bookingDetails?.booking_time || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Guests</p>
                    <p className="font-semibold">{bookingDetails?.guests || "—"} People</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h3 className="font-bold mb-4">Your Guide</h3>
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden">
                  <Image
                    src={guideProfile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"}
                    alt={guideProfile.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">{guideProfile.full_name}</p>
                  <p className="text-xs text-brand-emerald font-medium">
                    {isCompleted ? "Tour completed" : "Currently on tour"}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href={`/messages?booking=${bookingId}`}>
                  Message Guide
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* End Trip Confirmation Modal */}
      {showEndTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-2xl border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">End This Tour?</h2>
              </div>
              <button onClick={() => setShowEndTripModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Please confirm that your tour with <strong>{guideProfile.full_name}</strong> is complete.
            </p>

            <div className="rounded-2xl border bg-muted/40 p-4 mb-6 text-xs text-muted-foreground space-y-1.5">
              <p>• <strong>Remaining Balance:</strong> Ensure you have settled the remaining 85% payment directly with your guide.</p>
              <p>• <strong>Review:</strong> You will be invited to leave a verified rating & review for your guide.</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowEndTripModal(false)}
                disabled={isEndingTrip}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-brand-emerald hover:bg-emerald-600 text-white font-semibold"
                onClick={handleConfirmEndTrip}
                disabled={isEndingTrip}
              >
                {isEndingTrip ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finishing...
                  </>
                ) : (
                  "Confirm & End Trip"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Emergency Modal */}
      {showSOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-2xl border border-destructive/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Emergency Help</h2>
              </div>
              <button onClick={() => setShowSOS(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <a
                href="tel:112"
                className="flex items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 transition-colors hover:bg-destructive/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-destructive">Call Emergency (112)</p>
                  <p className="text-sm text-muted-foreground">India Emergency Services</p>
                </div>
              </a>

              <a
                href="tel:100"
                className="flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">Call Police (100)</p>
                  <p className="text-sm text-muted-foreground">Local Police Control Room</p>
                </div>
              </a>

              <button
                onClick={handleCopyLocation}
                className="flex w-full items-center gap-4 rounded-2xl border p-4 transition-colors hover:bg-muted/50 text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-emerald text-white">
                  {copiedLocation ? <CheckCircle2 className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                </div>
                <div>
                  <p className="font-bold">{copiedLocation ? "Location Copied!" : "Share My Location"}</p>
                  <p className="text-sm text-muted-foreground">Copy GPS coordinates to clipboard</p>
                </div>
              </button>
            </div>

            <p className="mt-6 text-xs text-center text-muted-foreground">
              GuideGo takes your safety seriously. All guides are verified and tracked.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
