"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [guideProfile, setGuideProfile] = useState<{ id: string; full_name: string; avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId || !user) return;

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .eq("traveler_id", user.id)
        .single();

      if (bookingData) {
        setBooking(bookingData);

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", bookingData.guide_id)
          .single();

        if (profile) setGuideProfile(profile);
      }
      setLoading(false);
    }
    fetchBooking();
  }, [bookingId, user]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 20) {
      setError("Please write at least 20 characters in your review.");
      return;
    }
    if (!user || !guideProfile) return;

    setIsSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      guide_id: guideProfile.id,
      traveler_id: user.id,
      rating,
      comment: comment.trim(),
    });

    if (insertError) {
      if (insertError.message.includes("duplicate")) {
        setError("You have already reviewed this booking.");
      } else {
        setError(insertError.message);
      }
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center text-muted-foreground">
        Loading booking details...
      </div>
    );
  }

  if (!booking || !guideProfile) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Booking not found</h2>
        <p className="text-muted-foreground mb-6">
          This booking doesn&apos;t exist or you don&apos;t have permission to review it.
        </p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-muted/20 flex items-center justify-center">
        <ScrollReveal>
          <div className="mx-auto max-w-md rounded-3xl border border-brand-emerald/20 bg-brand-emerald/5 p-10 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-emerald text-white">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-brand-emerald mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-8">
              Your review for {guideProfile.full_name} has been submitted. It will help other travelers make better choices.
            </p>
            <Button asChild className="bg-brand-emerald hover:bg-emerald-600 text-white h-12 px-8">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <ScrollReveal>
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="rounded-3xl border bg-card p-8 shadow-lg">
            <h1 className="text-2xl font-bold mb-2">Leave a Review</h1>
            <p className="text-muted-foreground mb-8">
              Share your experience to help other travelers
            </p>

            {/* Guide Info */}
            <div className="flex items-center gap-4 pb-6 mb-6 border-b">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                <img
                  src={guideProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideProfile.full_name)}&background=00458B&color=fff&bold=true`}
                  alt={guideProfile.full_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{guideProfile.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Booking #{bookingId.split("-")[0]} · {booking.booking_date}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-8">
              <label className="text-sm font-medium mb-3 block">
                How was your experience?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="group transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-brand-orange text-brand-orange"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  {rating === 0
                    ? "Select a rating"
                    : rating === 1
                    ? "Poor"
                    : rating === 2
                    ? "Fair"
                    : rating === 3
                    ? "Good"
                    : rating === 4
                    ? "Great"
                    : "Excellent!"}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6 space-y-2">
              <label className="text-sm font-medium">
                Your Review <span className="text-muted-foreground font-normal">(min 20 characters)</span>
              </label>
              <textarea
                className="w-full rounded-xl border bg-background p-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 resize-none"
                rows={5}
                placeholder="Tell other travelers about your experience — what was the highlight? Would you recommend this guide?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length} / 20 min characters
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 mb-6 text-sm text-destructive flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
