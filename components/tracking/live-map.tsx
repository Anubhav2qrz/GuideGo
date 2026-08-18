"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabase";

// Fix for default leaflet icons in React
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom component to update map center
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffSeconds < 10) return "Just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  return `${Math.floor(diffSeconds / 3600)}h ago`;
}

export default function LiveMap({ bookingId, guideId }: { bookingId: string, guideId: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchLocation = async () => {
      const { data } = await supabase
        .from('live_locations')
        .select('lat, lng, updated_at')
        .eq('booking_id', bookingId)
        .eq('guide_id', guideId)
        .single();

      if (data) {
        setPosition([data.lat, data.lng]);
        setLastUpdated(data.updated_at);
      }
    };

    fetchLocation();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('public:live_locations')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'live_locations',
        filter: `booking_id=eq.${bookingId}`
      }, (payload) => {
        const newLoc = payload.new as { guide_id: string, lat: number, lng: number, updated_at: string };
        if (newLoc && newLoc.guide_id === guideId) {
          setPosition([newLoc.lat, newLoc.lng]);
          setLastUpdated(newLoc.updated_at);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, guideId]);

  if (!position) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/50 rounded-2xl border border-dashed">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Waiting for guide&apos;s location signal...</p>
          <p className="text-xs text-muted-foreground mt-1">The guide needs to start broadcasting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 10, borderRadius: '1rem' }}
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">Guide&apos;s Live Location</p>
              {lastUpdated && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {formatTimeAgo(lastUpdated)}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Last Updated Overlay */}
      {lastUpdated && (
        <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-card/90 backdrop-blur-sm border px-3 py-1.5 text-xs font-medium shadow-sm">
          📡 Updated {formatTimeAgo(lastUpdated)}
        </div>
      )}
    </div>
  );
}
