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

export default function LiveMap({ bookingId, guideId }: { bookingId: string, guideId: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchLocation = async () => {
      const { data } = await supabase
        .from('live_locations')
        .select('lat, lng')
        .eq('booking_id', bookingId)
        .eq('guide_id', guideId)
        .single();

      if (data) {
        setPosition([data.lat, data.lng]);
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
      }, (payload: any) => {
        if (payload.new && payload.new.guide_id === guideId) {
          setPosition([payload.new.lat, payload.new.lng]);
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
        <p className="text-muted-foreground font-medium">Waiting for guide's location signal...</p>
      </div>
    );
  }

  return (
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
          Guide's Live Location
        </Popup>
      </Marker>
    </MapContainer>
  );
}
