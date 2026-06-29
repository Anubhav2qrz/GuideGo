"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function GuideTracker({ guideId, bookingId }: { guideId: string, bookingId: string }) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isTracking ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-muted text-muted-foreground'}`}>
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold">Live Location Sharing</h3>
          <p className="text-sm text-muted-foreground">
            {isTracking ? "Currently broadcasting your location" : "Share your location with travelers"}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {!isTracking ? (
        <Button onClick={startTracking} className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white">
          <Navigation className="mr-2 h-4 w-4" /> Start Broadcasting
        </Button>
      ) : (
        <Button onClick={stopTracking} variant="destructive" className="w-full">
          <StopCircle className="mr-2 h-4 w-4" /> Stop Sharing
        </Button>
      )}
    </div>
  );
}
