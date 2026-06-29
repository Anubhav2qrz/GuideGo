import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { PopularCities } from "@/components/landing/popular-cities";
import { FeaturesSection } from "@/components/landing/features-section";
import { ExperiencesSection } from "@/components/landing/experiences-section";
import { TopGuides } from "@/components/landing/top-guides";
import { Testimonials } from "@/components/landing/testimonials";
import { AiTripPlannerPreview } from "@/components/landing/ai-trip-planner-preview";
import { CtaSection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PopularCities />
      <FeaturesSection />
      <ExperiencesSection />
      <TopGuides />
      <AiTripPlannerPreview />
      <Testimonials />
      <CtaSection />
    </>
  );
}
