"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={review.userAvatar}
              alt={review.userName}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">{review.userName}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? "fill-brand-orange text-brand-orange"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{review.comment}&rdquo;
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {review.tourType}
        </span>
      </div>
    </div>
  );
}
