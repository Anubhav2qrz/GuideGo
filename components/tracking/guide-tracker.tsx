"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, StopCircle, CheckCircle2, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function GuideTracker({ 
  guideId, 
  bookingId, 
  bookingStatus = "confirmed",
  onStatusChange 
}: { 
  guideId: string; 
  bookingId: string; 
  bookingStatus?: string;
  onStatusChange?: (newStatus: string) => void;
}) {
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState(bookingStatus);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setError(null);
    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Push to Supabase
        const { error: upsertError } = await supabase
          .from('live_locations')
          .upsert({
            guide_id: guideId,
            booking_id: bookingId,
            lat: latitude,
            lng: longitude,
            updated_at: new Date().toISOString()
          }, { onConflict: 'guide_id, booking_id' });

        if (upsertError) {
          console.error("Failed to update location:", upsertError);
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const handleStartTrip = async () => {
    setIsUpdating(true);
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'in_progress' })
      .eq('id', bookingId);

    setIsUpdating(false);
    if (!updateError) {
      setStatus('in_progress');
      onStatusChange?.('in_progress');
      startTracking();
    }
  };

  const handleEndTrip = async () => {
    if (!window.confirm("Are you sure you want to end this tour? Make sure you have collected your remaining 85% payout from the traveler.")) {
      return;
    }

    setIsUpdating(true);
    stopTracking();

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);

    setIsUpdating(false);
    if (!updateError) {
      setStatus('completed');
      onStatusChange?.('completed');
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  if (status === 'completed') {
    return (
      <div className="rounded-2xl border border-brand-emerald/20 bg-brand-emerald/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-emerald/10 text-brand-emerald">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-brand-emerald">Trip Completed</h4>
            <p className="text-xs text-muted-foreground">This tour has ended successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isTracking ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-muted text-muted-foreground'}`}>
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Tour Control & Live GPS</h3>
            <p className="text-xs text-muted-foreground">
              {isTracking ? "Broadcasting live GPS signal" : "Start trip to activate GPS tracking"}
            </p>
          </div>
        </div>

        {status === 'in_progress' && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
            </span>
            Tour In Progress
          </span>
        )}
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        {status === 'confirmed' && (
          <Button 
            onClick={handleStartTrip} 
            disabled={isUpdating}
            className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs h-10 font-semibold"
          >
            <Play className="mr-1.5 h-4 w-4" /> Start Tour & Broadcast GPS
          </Button>
        )}

        {status === 'in_progress' && (
          <>
            {!isTracking ? (
              <Button onClick={startTracking} variant="outline" size="sm" className="flex-1 text-xs h-10">
                <Navigation className="mr-1.5 h-4 w-4 text-brand-emerald" /> Resume GPS
              </Button>
            ) : (
              <Button onClick={stopTracking} variant="outline" size="sm" className="flex-1 text-xs h-10">
                <StopCircle className="mr-1.5 h-4 w-4 text-destructive" /> Pause GPS
              </Button>
            )}

            <Button 
              onClick={handleEndTrip} 
              disabled={isUpdating}
              className="flex-1 bg-brand-emerald hover:bg-emerald-600 text-white text-xs h-10 font-semibold"
            >
              <Check className="mr-1.5 h-4 w-4" /> End Tour (Completed)
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
