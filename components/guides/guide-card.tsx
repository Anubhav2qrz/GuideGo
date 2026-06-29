"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Guide } from "@/types";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      {/* Header with cover image */}
      <div className="relative h-32 overflow-hidden">
        <Image
          src={guide.coverImage}
          alt={`${guide.name}'s cover`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Avatar */}
      <div className="relative -mt-10 px-5">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-card shadow-lg bg-background">
          <Image
            src={guide.avatar}
            alt={guide.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-semibold">{guide.name}</h3>
              {guide.verified && (
                <BadgeCheck className="h-5 w-5 text-brand-blue" />
              )}
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              {guide.city}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-1 text-sm font-medium text-brand-orange">
            <Star className="h-3.5 w-3.5 fill-current" />
            {guide.rating}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {guide.experience} yrs exp
          </span>
          <span>{guide.reviewCount} reviews</span>
          <span className="ml-auto font-semibold text-foreground">
            {formatPrice(guide.hourlyRate)}/hr
          </span>
        </div>

        {/* Specialties */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {guide.specialties.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="text-xs font-normal">
              {spec}
            </Badge>
          ))}
          {guide.specialties.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{guide.specialties.length - 3}
            </Badge>
          )}
        </div>

        {/* Languages */}
        <p className="mt-3 text-xs text-muted-foreground">
          Speaks: {guide.languages.join(", ")}
        </p>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/guides/${guide.slug}`}>View Profile</Link>
          </Button>
          <Button
            className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md hover:shadow-lg transition-all"
            asChild
          >
            <Link href={`/book?guide=${guide.slug}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
