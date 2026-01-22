import { HeroSection } from "@/components/home/hero-section";
import { SearchSection } from "@/components/home/search-section";
import { FeaturedTools } from "@/components/home/featured-tools";
import { LearningPaths } from "@/components/home/learning-paths";
import { LatestPosts } from "@/components/home/latest-posts";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { AboutBioinformatics } from "@/components/home/about-bioinformatics";
import { GettingStartedSection } from "@/components/home/getting-started-section";

export default function Home() {
  return (
    <div className="flex flex-col gap-0 pb-20">
      <HeroSection />
      <SearchSection />
      <AboutBioinformatics />
      <FeaturedTools />
      <GettingStartedSection />
      <LearningPaths />
      <LatestPosts />
      <NewsletterSection />
    </div>
  );
}
