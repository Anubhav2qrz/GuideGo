"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, MapPin, Clock, BadgeCheck, Languages, Award, 
  MessageCircle, Camera, Utensils, Mountain, Calendar, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { guides, reviews } from "@/lib/mock-data";
import { ReviewCard } from "@/components/guides/review-card";
import { formatPrice } from "@/lib/utils";

const specIcons: Record<string, React.ElementType> = {
  "Photography": Camera,
  "Food Tours": Utensils,
  "History": Award,
  "Adventure": Mountain,
  "Culture": MessageCircle,
};

export default function GuideProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const guide = guides.find((g) => g.slug === id);
  const guideReviews = reviews.filter((r) => r.guideId === guide?.id);

  if (!guide) {
    return (
      <div className="min-h-screen pt-32 pb-16 text-center">
        <h1 className="text-2xl font-bold">Guide Not Found</h1>
        <Button asChild className="mt-4">
          <Link href="/guides">Back to Guides</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Cover Image */}
      <div className="relative h-[30vh] min-h-[250px] w-full overflow-hidden lg:h-[40vh]">
        <Image
          src={guide.coverImage}
          alt={`${guide.name}'s cover`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        
        <div className="absolute top-24 left-4 sm:left-6 lg:left-8">
          <Button variant="ghost" size="sm" className="bg-background/50 backdrop-blur-md hover:bg-background/80" asChild>
            <Link href="/guides">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Profile Header */}
            <ScrollReveal>
              <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-card shadow-lg bg-background sm:h-40 sm:w-40">
                    <Image
                      src={guide.avatar}
                      alt={guide.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold sm:text-4xl">{guide.name}</h1>
                        {guide.verified && (
                          <BadgeCheck className="h-7 w-7 text-brand-blue" />
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-lg text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                        {guide.city}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1 rounded-full bg-brand-orange/10 px-3 py-1.5 text-sm font-semibold text-brand-orange">
                        <Star className="h-4 w-4 fill-current" />
                        {guide.rating} ({guide.reviewCount} reviews)
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {guide.experience} years experience
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t pt-8">
                  <h2 className="text-xl font-bold mb-4">About Me</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {guide.bio || `Hi, I'm ${guide.name}! I've been living in ${guide.city} for over ${guide.experience} years and I love sharing its hidden secrets with travelers. My tours are always customized to your interests, whether you're a foodie, a history buff, or an adventure seeker. Let's explore together!`}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Specialties & Languages */}
            <ScrollReveal delay={0.1}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5 text-brand-blue" />
                    Specialties
                  </h2>
                  <div className="space-y-4">
                    {guide.specialties.map((spec) => {
                      const Icon = specIcons[spec] || Award;
                      return (
                        <div key={spec} className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-medium">{spec}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Languages className="h-5 w-5 text-brand-emerald" />
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="px-3 py-1.5 text-sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Reviews */}
            <ScrollReveal delay={0.2}>
              <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-brand-orange" />
                    Traveler Reviews
                  </h2>
                  <div className="text-sm font-medium text-muted-foreground">
                    {guideReviews.length} Reviews
                  </div>
                </div>

                {guideReviews.length > 0 ? (
                  <StaggerContainer className="grid gap-4 sm:grid-cols-2" staggerDelay={0.05}>
                    {guideReviews.map((review) => (
                      <StaggerItem key={review.id}>
                        <ReviewCard review={review} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to leave a review!
                  </p>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar / Booking Widget */}
          <div className="lg:mt-0">
            <ScrollReveal delay={0.3}>
              <div className="sticky top-24 overflow-hidden rounded-3xl border bg-card shadow-lg">
                <div className="bg-gradient-to-br from-brand-blue to-blue-600 p-6 text-white">
                  <p className="text-sm font-medium opacity-90">Starting from</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{formatPrice(guide.hourlyRate)}</span>
                    <span className="text-sm opacity-90">/ hour</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-muted-foreground">Minimum Booking</span>
                      <span className="font-medium">2 hours</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="font-medium">Within 2 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancellation</span>
                      <span className="font-medium text-brand-emerald">Free (24h)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full h-12 text-base font-semibold bg-brand-blue hover:bg-brand-blue-dark text-white" asChild>
                      <Link href={`/book?guide=${guide.slug}`}>
                        <Calendar className="mr-2 h-5 w-5" />
                        Check Availability
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full h-12 text-base">
                      Contact Guide
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    You won't be charged yet
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
