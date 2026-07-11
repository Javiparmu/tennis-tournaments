import { CtaBand } from "@/components/landing/cta-band";
import { FeaturesBento } from "@/components/landing/features-bento";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MarqueeBand } from "@/components/landing/marquee-band";
import { RacketSection } from "@/components/landing/racket-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-court-ink">
      <SiteHeader />
      <main>
        {/* Hero carries the live upcoming-tournaments agenda panel — the single
            source of upcoming tournaments on the page. */}
        <Hero />
        <MarqueeBand />
        <FeaturesBento />
        <RacketSection />
        <HowItWorks />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
