"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, Navigation, StopCircle, CheckCircle2, Play, 
  Check, QrCode, Banknote, IndianRupee, X, Loader2, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

export function GuideTracker({ 
  guideId, 
  bookingId, 
  totalPrice = 3200,
  guideUpiId,
  guideName = "Guide",
  bookingStatus = "confirmed",
  onStatusChange 
}: { 
  guideId: string; 
  bookingId: string; 
  totalPrice?: number;
  guideUpiId?: string;
  guideName?: string;
  bookingStatus?: string;
  onStatusChange?: (newStatus: string) => void;
}) {
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState(bookingStatus);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash">("upi");
  const [customUpiId, setCustomUpiId] = useState(guideUpiId || "");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // 85% balance calculation
  const advanceAmount = Math.round(totalPrice * 0.15);
  const remainingBalance = totalPrice - advanceAmount;

  // Active UPI ID
  const activeUpiId = customUpiId.trim() || guideUpiId || "goonanubhav@ybl";
  const upiDeepLink = `upi://pay?pa=${activeUpiId}&pn=${encodeURIComponent(guideName)}&am=${remainingBalance}&cu=INR&tn=GuideGo%20Tour%20Balance`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  // Fetch guide's UPI ID if not passed
  useEffect(() => {
    async function fetchGuideUpi() {
      if (guideUpiId) {
        setCustomUpiId(guideUpiId);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('upi_id, full_name')
        .eq('id', guideId)
        .single();

      if (data?.upi_id) {
        setCustomUpiId(data.upi_id);
      }
    }
    fetchGuideUpi();
  }, [guideId, guideUpiId]);

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

  const handleConfirmEndTour = async () => {
    setIsUpdating(true);
    stopTracking();

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);

    setIsUpdating(false);
    if (!updateError) {
      setStatus('completed');
      setShowCollectModal(false);
      onStatusChange?.('completed');
    } else {
      alert(`Error ending trip: ${updateError.message}`);
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
            <h4 className="font-bold text-sm text-brand-emerald">Tour Completed</h4>
            <p className="text-xs text-muted-foreground">
              Remaining balance of {formatPrice(remainingBalance)} collected. Tour ended successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isTracking ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-muted text-muted-foreground'}`}>
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Tour Control & Live GPS</h3>
              <p className="text-xs text-muted-foreground">
                {isTracking ? "Broadcasting live GPS signal to traveler" : "Start trip to activate GPS tracking"}
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
                onClick={() => setShowCollectModal(true)} 
                disabled={isUpdating}
                className="flex-1 bg-brand-emerald hover:bg-emerald-600 text-white text-xs h-10 font-semibold shadow-sm"
              >
                <IndianRupee className="mr-1.5 h-4 w-4" /> End Tour & Collect {formatPrice(remainingBalance)}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Guide End Tour & Collect 85% Payment Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">End Tour & Collect Payment</h2>
                  <p className="text-xs text-muted-foreground">Receive your 85% direct payout from the traveler</p>
                </div>
              </div>
              <button onClick={() => setShowCollectModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price Summary Breakdown */}
            <div className="rounded-2xl border bg-muted/40 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Total Tour Amount:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>15% Advance (Already Deposited):</span>
                <span>{formatPrice(advanceAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-brand-emerald font-bold pt-2 border-t text-base">
                <span>85% Amount to Collect from Traveler:</span>
                <span>{formatPrice(remainingBalance)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode("upi")}
                  className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-sm font-semibold transition-all ${
                    paymentMode === "upi"
                      ? "border-brand-emerald bg-brand-emerald/10 text-brand-emerald ring-2 ring-brand-emerald/20"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  Show UPI QR Code
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode("cash")}
                  className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-sm font-semibold transition-all ${
                    paymentMode === "cash"
                      ? "border-brand-emerald bg-brand-emerald/10 text-brand-emerald ring-2 ring-brand-emerald/20"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  Accept Cash ({formatPrice(remainingBalance)})
                </button>
              </div>
            </div>

            {/* Mode 1: Dynamic QR Code */}
            {paymentMode === "upi" && (
              <div className="rounded-2xl border border-brand-emerald/30 bg-brand-emerald/5 p-5 text-center space-y-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Ask the traveler to scan this QR code with Google Pay, PhonePe, or Paytm:
                </p>

                <div className="bg-white p-3 rounded-2xl shadow-sm border inline-block mx-auto">
                  <img 
                    src={qrCodeUrl} 
                    alt="Guide UPI QR Code" 
                    className="w-44 h-44 object-contain rounded-lg mx-auto"
                  />
                  <p className="text-[11px] font-bold text-gray-700 mt-1">Amount: {formatPrice(remainingBalance)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Receiving to UPI ID:</p>
                  <div className="inline-flex items-center gap-2 bg-background border px-3 py-1.5 rounded-xl font-mono text-xs font-semibold">
                    <span>{activeUpiId}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeUpiId);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copiedUpi ? <Check className="h-3.5 w-3.5 text-brand-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Quick Edit UPI ID if needed */}
                {!guideUpiId && (
                  <div className="text-left pt-2 border-t">
                    <label className="text-[11px] text-muted-foreground font-medium">Change UPI ID:</label>
                    <input 
                      type="text" 
                      value={customUpiId} 
                      onChange={(e) => setCustomUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="mt-1 h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono outline-none focus:border-brand-blue"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Cash Payment */}
            {paymentMode === "cash" && (
              <div className="rounded-2xl border border-brand-emerald/30 bg-brand-emerald/5 p-5 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <Banknote className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-base">Cash Collection</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Please collect <strong>{formatPrice(remainingBalance)}</strong> in cash directly from your traveler before marking the tour as completed.
                </p>
              </div>
            )}

            {/* Confirm & End Tour Button */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowCollectModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-brand-emerald hover:bg-emerald-600 text-white font-semibold"
                onClick={handleConfirmEndTour}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  `Payment Received (${formatPrice(remainingBalance)}) — Complete Tour`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
