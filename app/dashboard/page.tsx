"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, MapPin, Clock, ArrowRight, Settings, 
  Heart, History, LogOut, Users, IndianRupee, TrendingUp, 
  Star, MessageCircle, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { GuideTracker } from "@/components/tracking/guide-tracker";
import { supabase } from "@/lib/supabase";

interface BookingRow {
  id: string;
  status: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  total_price: number;
  other_person?: {
    full_name: string;
    avatar_url: string;
  };
}

// Status badge color mapping
function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-brand-emerald text-white hover:bg-emerald-600";
    case "pending":
    case "payment_pending":
      return "bg-yellow-500 text-white hover:bg-yellow-600";
    case "in_progress":
    case "in-progress":
      return "bg-brand-blue text-white hover:bg-blue-600";
    case "completed":
      return "bg-gray-500 text-white hover:bg-gray-600";
    case "cancelled":
      return "bg-destructive text-white hover:bg-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "payment_pending": return "Payment Pending";
    case "in_progress":
    case "in-progress": return "In Progress";
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Check if a booking is upcoming
function isUpcoming(booking: BookingRow) {
  return ["confirmed", "pending", "payment_pending", "in_progress", "in-progress"].includes(booking.status);
}

function isPast(booking: BookingRow) {
  return ["completed", "cancelled"].includes(booking.status);
}

// ---------------------------------------------------------
// TRAVELER DASHBOARD COMPONENT
// ---------------------------------------------------------
function TravelerDashboard({ 
  bookings, 
  userName,
  onRefresh
}: { 
  bookings: BookingRow[]; 
  userName: string;
  onRefresh?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const tabs = [
    { id: "upcoming", name: "Upcoming Trips", icon: Calendar },
    { id: "past", name: "Past Trips", icon: History },
    { id: "saved", name: "Saved Guides", icon: Heart },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter(isPast);

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <ScrollReveal delay={0.1}>
        <div className="rounded-3xl border bg-card p-4 shadow-sm">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                  {tab.id === "upcoming" && upcomingBookings.length > 0 && (
                    <span className="ml-auto text-xs bg-brand-blue text-white rounded-full px-2 py-0.5">
                      {upcomingBookings.length}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t">
              <button 
                onClick={async () => await supabase.auth.signOut()}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      </ScrollReveal>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Upcoming Trips Tab */}
        {activeTab === "upcoming" && (
          <>
            {upcomingBookings.length === 0 ? (
              <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold mb-2">No upcoming trips</h3>
                <p className="text-muted-foreground mb-6">Looks like you don&apos;t have any adventures planned yet.</p>
                <Button className="bg-brand-blue text-white" asChild>
                  <Link href="/explore">Explore Destinations</Link>
                </Button>
              </div>
            ) : (
              upcomingBookings.map((booking, idx) => (
                <ScrollReveal key={booking.id} delay={0.2 + (idx * 0.1)}>
                  <BookingCard booking={booking} role="traveler" onRefresh={onRefresh} />
                </ScrollReveal>
              ))
            )}
          </>
        )}

        {/* Past Trips Tab */}
        {activeTab === "past" && (
          <>
            {pastBookings.length === 0 ? (
              <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold mb-2">No past trips</h3>
                <p className="text-muted-foreground mb-6">Your completed and cancelled trips will appear here.</p>
              </div>
            ) : (
              pastBookings.map((booking, idx) => (
                <ScrollReveal key={booking.id} delay={0.2 + (idx * 0.1)}>
                  <BookingCard 
                    booking={booking} 
                    role="traveler" 
                    showReviewCTA={booking.status === "completed"} 
                    onRefresh={onRefresh}
                  />
                </ScrollReveal>
              ))
            )}
          </>
        )}

        {/* Saved Guides Tab */}
        {activeTab === "saved" && (
          <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Saved guides coming soon</h3>
            <p className="text-muted-foreground mb-6">You&apos;ll be able to save your favourite guides and quickly rebook them.</p>
            <Button className="bg-brand-blue text-white" asChild>
              <Link href="/guides">Browse Guides</Link>
            </Button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <SettingsPanel userName={userName} />
        )}

        {/* CTA Banner */}
        {activeTab === "upcoming" && (
          <ScrollReveal delay={0.4}>
            <div className="rounded-3xl border bg-brand-emerald/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-brand-emerald mb-2">Ready for your next adventure?</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Explore new cities, find verified local guides, and create unforgettable memories.
                </p>
              </div>
              <Button className="bg-brand-emerald hover:bg-emerald-600 text-white shrink-0" asChild>
                <Link href="/explore">
                  Explore Destinations <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// GUIDE DASHBOARD COMPONENT
// ---------------------------------------------------------
function GuideDashboard({ 
  bookings, 
  userName, 
  userId,
  onRefresh
}: { 
  bookings: BookingRow[]; 
  userName: string; 
  userId: string;
  onRefresh?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("tours");

  const tabs = [
    { id: "tours", name: "My Tours", icon: MapPin },
    { id: "earnings", name: "Earnings", icon: IndianRupee },
    { id: "reviews", name: "Reviews", icon: Star },
    { id: "settings", name: "Profile Settings", icon: Settings },
  ];

  const totalEarnings = bookings.reduce((sum, b) => sum + b.total_price, 0);
  const upcomingBookings = bookings.filter(isUpcoming);

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <ScrollReveal delay={0.1}>
        <div className="rounded-3xl border bg-card p-4 shadow-sm">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t">
              <button 
                onClick={async () => await supabase.auth.signOut()}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      </ScrollReveal>

      {/* Main Content */}
      <div className="space-y-6">
        {activeTab === "tours" && (
          <>
            {/* Guide KYC Status Banner */}
            <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Identity & Document Verification</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20">
                      Documents Submitted
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your Government ID & Live Photo are submitted. Verified badge displays on your public tours.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <ScrollReveal delay={0.2}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">{formatPrice(totalEarnings)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming Tours</p>
                      <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {bookings.length === 0 ? (
              <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold mb-2">No tours yet</h3>
                <p className="text-muted-foreground mb-6">Keep your profile updated and competitive to attract more travelers.</p>
              </div>
            ) : (
              bookings.map((booking, idx) => (
                <ScrollReveal key={booking.id} delay={0.3 + (idx * 0.1)}>
                  <BookingCard booking={booking} role="guide" onRefresh={onRefresh} />
                  {isUpcoming(booking) && (
                    <div className="mt-4">
                      <GuideTracker 
                        guideId={userId} 
                        bookingId={booking.id} 
                        totalPrice={booking.total_price}
                        guideName={userName}
                        bookingStatus={booking.status}
                        onStatusChange={onRefresh}
                      />
                    </div>
                  )}
                </ScrollReveal>
              ))
            )}
          </>
        )}

        {activeTab === "earnings" && (
          <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
            <IndianRupee className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Detailed earnings coming soon</h3>
            <p className="text-muted-foreground">You&apos;ll be able to see detailed payout history and analytics here.</p>
            <div className="mt-6 rounded-2xl border bg-muted/50 p-6">
              <p className="text-sm text-muted-foreground">Total earned to date</p>
              <p className="text-4xl font-bold text-brand-emerald mt-1">{formatPrice(totalEarnings)}</p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Your reviews</h3>
            <p className="text-muted-foreground">Reviews from your travelers will appear here once they complete their tours.</p>
          </div>
        )}

        {activeTab === "settings" && (
          <SettingsPanel userName={userName} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SHARED: BOOKING CARD COMPONENT
// ---------------------------------------------------------
function BookingCard({ 
  booking, 
  role, 
  showReviewCTA = false,
  onRefresh
}: { 
  booking: BookingRow; 
  role: "traveler" | "guide"; 
  showReviewCTA?: boolean;
  onRefresh?: () => void;
}) {
  const otherLabel = role === "traveler" ? "Your Guide" : "Your Traveler";
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEndTrip = async () => {
    if (!window.confirm("Are you sure you want to mark this tour as completed?")) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id);

      if (error) {
        throw error;
      }
      onRefresh?.();
    } catch (err: any) {
      console.error("End trip error:", err);
      alert(`Failed to end trip: ${err?.message || "Please make sure RLS update policy is enabled in Supabase."}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <div className="bg-brand-blue/5 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Badge className={`${getStatusBadge(booking.status)} mb-2`}>
              {getStatusLabel(booking.status)}
            </Badge>
            <h2 className="text-xl font-bold">
              {role === "traveler" 
                ? `Trip with ${booking.other_person?.full_name || 'Guide'}` 
                : `Tour booked by ${booking.other_person?.full_name || 'Traveler'}`
              }
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Booking Ref</p>
            <p className="font-mono font-medium text-xs">#{booking.id.split('-')[0]}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date</p>
            <p className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-blue" />
              {booking.booking_date}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Time</p>
            <p className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-blue" />
              {booking.booking_time}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Guests</p>
            <p className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-blue" />
              {booking.guests} People
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {role === "guide" ? "Total Tour (Collect 85%)" : "Total Tour Price"}
            </p>
            <p className="font-semibold text-foreground">
              {formatPrice(booking.total_price)}
            </p>
            <p className="text-[11px] text-brand-emerald mt-0.5 font-medium">
              {role === "guide" 
                ? `Direct Payout: ${formatPrice(Math.round(booking.total_price * 0.85))}` 
                : `15% Advance Paid (${formatPrice(Math.round(booking.total_price * 0.15))})`}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              <Image src={booking.other_person?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"} alt="Avatar" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{otherLabel}</p>
              <p className="font-semibold">{booking.other_person?.full_name}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" asChild>
              <Link href={`/messages?booking=${booking.id}`}>
                <MessageCircle className="mr-1.5 h-4 w-4" />
                Message
              </Link>
            </Button>

            {role === "traveler" && isUpcoming(booking) && (
              <Button size="sm" className="flex-1 sm:flex-none bg-brand-emerald hover:bg-emerald-600 text-white" asChild>
                <Link href={`/track/${booking.id}`}>Live Map</Link>
              </Button>
            )}

            {/* Only the Guide has the button to End the Trip */}
            {role === "guide" && isUpcoming(booking) && (
              <Button 
                variant="outline"
                size="sm" 
                onClick={handleEndTrip}
                disabled={isUpdating}
                className="flex-1 sm:flex-none border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/10 font-medium"
              >
                End Trip
              </Button>
            )}

            {showReviewCTA && (
              <Button size="sm" className="flex-1 sm:flex-none bg-brand-orange hover:bg-orange-600 text-white" asChild>
                <Link href={`/review/${booking.id}`}>
                  <Star className="mr-1.5 h-4 w-4" />
                  Leave Review
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SHARED: SETTINGS PANEL
// ---------------------------------------------------------
function SettingsPanel({ userName }: { userName: string }) {
  const { user } = useAuth();
  return (
    <div className="rounded-3xl border bg-card p-8 shadow-sm space-y-6">
      <h3 className="text-xl font-bold">Account Settings</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
          <div className="h-12 flex items-center rounded-xl border bg-muted/50 px-4 text-sm">
            {userName}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <div className="h-12 flex items-center rounded-xl border bg-muted/50 px-4 text-sm">
            {user?.email || "—"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Role</label>
          <div className="h-12 flex items-center rounded-xl border bg-muted/50 px-4 text-sm capitalize">
            {user?.user_metadata?.role || "traveler"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Member Since</label>
          <div className="h-12 flex items-center rounded-xl border bg-muted/50 px-4 text-sm">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—"}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Profile editing coming soon. Contact support@guidego.com for urgent changes.
      </p>
    </div>
  );
}

// ---------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------
export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Traveler";
  const isGuide = user?.user_metadata?.role === 'guide';

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    
    const column = isGuide ? 'guide_id' : 'traveler_id';
    const foreignTable = isGuide ? 'traveler_id' : 'guide_id'; 
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        other_person:profiles!${foreignTable}(id, full_name, avatar_url, city, hourly_rate)
      `)
      .eq(column, user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookings(data);
    }
    setLoading(false);
  }, [user, isGuide]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-muted/20 flex justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{isGuide ? "Guide Dashboard" : "My Dashboard"}</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {userName}! You have {bookings.filter(isUpcoming).length} upcoming {isGuide ? 'tours' : 'trips'}.</p>
          </div>
        </ScrollReveal>

        {isGuide ? (
          <GuideDashboard 
            bookings={bookings} 
            userName={userName} 
            userId={user!.id} 
            onRefresh={fetchBookings}
          />
        ) : (
          <TravelerDashboard 
            bookings={bookings} 
            userName={userName} 
            onRefresh={fetchBookings}
          />
        )}
      </div>
    </div>
  );
}
