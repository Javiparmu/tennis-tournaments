import { CtaBand } from "@/components/landing/cta-band";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProfileTeaser } from "@/components/landing/profile-teaser";
import { StatBand } from "@/components/landing/stat-band";
import { TournamentGrid } from "@/components/landing/tournament-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-court-ink">
      <SiteHeader />
      <main>
        <Hero />
        <StatBand />
        <HowItWorks />
        <ProfileTeaser />
        <TournamentGrid />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
