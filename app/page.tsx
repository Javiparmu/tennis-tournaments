import { CtaBand } from "@/components/landing/cta-band";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SectionDivider } from "@/components/landing/section-divider";
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
        <Features />
        <SectionDivider />
        <HowItWorks />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
