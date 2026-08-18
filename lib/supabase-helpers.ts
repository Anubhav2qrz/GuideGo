// ============================================
// GuideGo — Supabase Data Helpers
// Shared mapping & fetching logic for profiles
// ============================================

import { supabase } from "@/lib/supabase";
import { Guide, Review } from "@/types";
import { guides as mockGuides, reviews as mockReviews } from "@/lib/mock-data";
import { getDefaultAvatar } from "@/lib/utils";

// ---- Types for raw Supabase profile rows ----
export interface SupabaseProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  cover_image?: string;
  bio?: string;
  languages?: string[];
  rating?: number;
  reviews?: number;
  experience?: number;
  hourly_rate?: number;
  specialties?: string[];
  city?: string;
  verified?: boolean;
  role?: string;
  upi_id?: string;
}

/**
 * Maps a raw Supabase `profiles` row into our frontend Guide type.
 * Used across guides list, guide detail, booking, and dashboard pages
 * to eliminate duplicated mapping logic.
 */
export function mapProfileToGuide(profile: SupabaseProfile): Guide {
  return {
    id: profile.id,
    name: profile.full_name,
    slug: profile.id, // Using UUID as slug for real DB entries
    avatar: profile.avatar_url || getDefaultAvatar(profile.full_name || "Guide"),
    coverImage: profile.cover_image || "https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=80",
    bio: profile.bio || "",
    languages: profile.languages || [],
    rating: profile.rating || 5.0,
    reviewCount: profile.reviews || 0,
    experience: profile.experience || 1,
    hourlyRate: profile.hourly_rate || 500,
    specialties: profile.specialties || [],
    city: profile.city || "Unknown",
    citySlug: (profile.city || "unknown").toLowerCase().replace(/\s+/g, "-"),
    availability: true,
    verified: profile.verified || false,
    upiId: profile.upi_id,
    gallery: [],
    tourCategories: [],
  };
}

/**
 * Fetches a guide by ID. Tries Supabase first (UUID match),
 * then falls back to mock data (slug match).
 * Returns null if no guide is found anywhere.
 */
export async function fetchGuideById(id: string): Promise<Guide | null> {
  // 1. Try Supabase by UUID
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (data && !error) {
      return mapProfileToGuide(data as SupabaseProfile);
    }
  } catch {
    // Supabase might not be configured — fall through to mock
  }

  // 2. Fallback to mock data by slug
  const mockGuide = mockGuides.find((g) => g.slug === id || g.id === id);
  return mockGuide || null;
}

/**
 * Fetches all guides with role='guide' from Supabase.
 * Falls back to mock data if Supabase is not configured or returns empty.
 */
export async function fetchAllGuides(): Promise<Guide[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "guide");

    if (data && data.length > 0 && !error) {
      return data.map((p) => mapProfileToGuide(p as SupabaseProfile));
    }
  } catch {
    // Fall through to mock
  }

  // Fallback: return mock guides
  return mockGuides;
}

/**
 * Fetches reviews for a guide. Tries Supabase first, falls back to mock.
 */
export async function fetchReviewsForGuide(guideId: string) {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        traveler:profiles!traveler_id(full_name, avatar_url)
      `)
      .eq("guide_id", guideId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0 && !error) {
      return {
        source: "supabase" as const,
        reviews: data.map((r: any) => ({
          id: r.id,
          guideId,
          userName: r.traveler?.full_name || "Anonymous",
          userAvatar: r.traveler?.avatar_url || getDefaultAvatar(r.traveler?.full_name || "Traveler"),
          rating: r.rating,
          comment: r.comment || "",
          date: r.created_at?.split("T")[0] || "",
          tourType: "Verified Tour",
          verified: true,
        })),
      };
    }
  } catch {
    // Fall through
  }

  // 2. Fallback to mock reviews
  const filtered = mockReviews.filter((r) => r.guideId === guideId);
  return {
    source: "mock" as const,
    reviews: filtered.map((r) => ({ ...r, verified: false })),
  };
}
