// ============================================
// GuideGo — Core TypeScript Types
// ============================================

export interface City {
  id: string;
  name: string;
  slug: string;
  image: string;
  guideCount: number;
  startingPrice: number;
  averageRating: number;
  description: string;
  state: string;
}

export interface Guide {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  coverImage: string;
  bio: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  experience: number; // years
  hourlyRate: number;
  specialties: string[];
  city: string;
  citySlug: string;
  availability: boolean;
  verified: boolean;
  gallery: string[];
  tourCategories: string[];
}

export interface Review {
  id: string;
  guideId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  tourType: string;
}

export interface Experience {
  id: string;
  title: string;
  slug: string;
  category: ExperienceCategory;
  description: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  city: string;
  guideName: string;
  guideAvatar: string;
}

export type ExperienceCategory =
  | "food-walks"
  | "photography-tours"
  | "historical-tours"
  | "shopping-tours"
  | "nightlife"
  | "nature"
  | "adventure"
  | "religious-tours"
  | "hidden-gems";

export interface ExperienceCategoryInfo {
  id: ExperienceCategory;
  name: string;
  icon: string;
  description: string;
  image: string;
  count: number;
}

export interface Booking {
  id: string;
  guideId: string;
  guideName: string;
  guideAvatar: string;
  city: string;
  date: string;
  duration: number; // hours
  totalPrice: number;
  status: BookingStatus;
  tourType: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  city: string;
  date: string;
  tourType: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface AIPlannerMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Itinerary {
  time: string;
  activity: string;
  location: string;
  cost: number;
  tip?: string;
}

export interface AIPlannerResponse {
  itinerary: Itinerary[];
  recommendedGuide: Guide;
  totalEstimatedCost: number;
  foodRecommendations: string[];
  nearbyAttractions: string[];
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
}
